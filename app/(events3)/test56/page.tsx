"use client";

import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Page() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  // =========================
  // PROGRAM ID
  // =========================
  const programId = useMemo(
    () =>
      new PublicKey(
        "DNjSQoQ7u9Zrfot4uaATGbszQyF8HhRpbYGBy11eMQ7t"
      ),
    []
  );

  // =========================
  // MINT
  // =========================
  const mint = useMemo(
    () =>
      new PublicKey(
        "5vQnjwhBHex9rVJ4KbUkMuz3TkfPsYZB1JQFrZn7yJpb"
      ),
    []
  );

  // =========================
  // IDL
  // =========================
  const IDL: any = {
    /* PASTE IDL HERE */
  };

  // =========================
  // SAFE PROVIDER (FIXED TYPE ISSUE ROOT CAUSE)
  // =========================
  const provider = useMemo<anchor.AnchorProvider | null>(() => {
    if (!wallet.publicKey) return null;

    return new anchor.AnchorProvider(
      connection,
      wallet as unknown as anchor.Wallet,
      { commitment: "processed" }
    );
  }, [wallet.publicKey, connection]);

  // =========================
  // SAFE PROGRAM (IMPORTANT FIX)
  // =========================
  const program = useMemo(() => {
    if (!provider) return null;

    return new anchor.Program(
      IDL as anchor.Idl,
      programId,
      provider
    );
  }, [provider, programId]);

  // =========================
  // CONSTANTS
  // =========================
  const randomString = "abc12345";

  const admin = wallet.publicKey;
  const creator = wallet.publicKey;

  // =========================
  // GUARD (IMPORTANT FOR NEXT.JS)
  // =========================
  if (!wallet.publicKey) {
    return (
      <div style={{ padding: 40 }}>
        <WalletMultiButton />
        <p>Please connect wallet</p>
      </div>
    );
  }

  // =========================
  // PDAs
  // =========================
  const [challengePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      admin!.toBuffer(),
      Buffer.from(randomString),
    ],
    programId
  );

  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), challengePda.toBuffer()],
    programId
  );

  const escrowVault = getAssociatedTokenAddressSync(
    mint,
    vaultAuthority,
    true
  );

  // =========================
  // CREATE
  // =========================
  const createChallenge = async () => {
    try {
      if (!program) return;
      setLoading(true);

      await program.methods
        .createChallenge(
          "Test Challenge",
          "Working version",
          new anchor.BN(1),
          randomString,
          new anchor.BN(Math.floor(Date.now() / 1000)),
          new anchor.BN(Math.floor(Date.now() / 1000) + 3600),
          new anchor.BN(1_000_000_000),
          10
        )
        .accounts({
          challenge: challengePda,
          vaultAuthority,
          escrowVault,
          mint,
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
      alert("Create failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // JOIN
  // =========================
  const joinChallenge = async () => {
    try {
      if (!program) return;
      setLoading(true);

      const participantTokenAccount = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey
      );

      await program.methods
        .joinChallenge()
        .accounts({
          challenge: challengePda,
          escrowVault,
          vaultAuthority,
          participant: wallet.publicKey,
          participantTokenAccount,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert("Joined");
    } catch (e) {
      console.error(e);
      alert("Join failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DISTRIBUTE
  // =========================
  const distributePrizes = async () => {
    try {
      if (!program) return;
      setLoading(true);

      const platformTreasury = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey
      );

      const winner1 = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey
      );

      await program.methods
        .distributePrizes()
        .accounts({
          challenge: challengePda,
          escrowVault,
          vaultAuthority,
          signer: wallet.publicKey,
          platformTreasury,
          winner1,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert("Distributed");
    } catch (e) {
      console.error(e);
      alert("Distribute failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <WalletMultiButton />

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={createChallenge} disabled={loading}>
          Create
        </button>

        <button onClick={joinChallenge} disabled={loading}>
          Join
        </button>

        <button onClick={distributePrizes} disabled={loading}>
          Distribute
        </button>
      </div>
    </div>
  );
}
