"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useProgram } from "@/hooks/useProgram";
import { RANDOM_STRING, MINT } from "@/lib/constants";
import {
  getChallengePda,
  getVaultAuthority,
} from "@/lib/pdas";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useState } from "react";

export default function Page() {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  if (!wallet.publicKey) {
    return (
      <div style={{ padding: 40 }}>
        <WalletMultiButton />
        <p>Connect wallet</p>
      </div>
    );
  }

  const admin = wallet.publicKey;
  const creator = wallet.publicKey;

  const challengePda = getChallengePda(admin, RANDOM_STRING);
  const vaultAuthority = getVaultAuthority(challengePda);

  const escrowVault = getAssociatedTokenAddressSync(
    MINT,
    vaultAuthority,
    true
  );

  const createChallenge = async () => {
    if (!program) return;
    setLoading(true);

    try {
      await program.methods
        .createChallenge(
          "Clean dApp",
          "Architecture refactor",
          new anchor.BN(1),
          RANDOM_STRING,
          new anchor.BN(Date.now() / 1000),
          new anchor.BN(Date.now() / 1000 + 3600),
          new anchor.BN(1_000_000_000),
          10
        )
        .accounts({
          challenge: challengePda,
          vaultAuthority,
          escrowVault,
          mint: MINT,
          admin,
          creator,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram:
            anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert("Created");
    } catch (e) {
      console.error(e);
      alert("Failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <WalletMultiButton />

      <button onClick={createChallenge} disabled={loading}>
        Create Challenge
      </button>
    </div>
  );
}
