// page.tsx - replace your static imports with this pattern
'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function CompetitionPage() {
  const wallet = useWallet();
  const [competitionPubkey, setCompetitionPubkey] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const createCompetition = async () => {
    if (!wallet.publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      // Dynamic imports — loaded only when button is clicked, not at build time
      const { Connection, PublicKey, SystemProgram, clusterApiUrl } = await import('@solana/web3.js');
      const { AnchorProvider, BN, Program } = await import('@coral-xyz/anchor');
      const { IDL } = await import('@/idl1');

      const PROGRAM_ID = new PublicKey("2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ");
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      if (!wallet.signTransaction) throw new Error("Wallet not ready");

      const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
      const program = new Program(IDL as any, provider) as any;

      const username = "Justin";
      const description = "Test Competition on Devnet";
      const gameId = 123;
      const randomString = `motion_${Date.now()}`;
      const startTime = Math.floor(Date.now() / 1000);
      const finishTime = startTime + 86400;
      const entryFee = 100_000_000;
      const maxParticipants = 100;

      const [compPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("competition"),
          wallet.publicKey.toBuffer(),
          new Uint8Array(new BigUint64Array([BigInt(gameId)]).buffer),
          Buffer.from(randomString),
        ],
        PROGRAM_ID
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), compPda.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods
        .createCompetition({
          username,
          description,
          gameId: new BN(gameId),
          randomString,
          startTime: new BN(startTime),
          finishTime: new BN(finishTime),
          entryFee: new BN(entryFee),
          maxParticipants,
        })
        .accounts({
          creator: wallet.publicKey,
          competition: compPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setCompetitionPubkey(compPda.toBase58());
      setStatus(`✅ Competition created! TX: ${tx}`);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40, fontFamily: 'Arial, sans-serif', maxWidth: 600 }}>
      <h1>MotionPlay Competition</h1>

      <WalletMultiButton />

      <div style={{ margin: "30px 0" }}>
        <button
          onClick={createCompetition}
          disabled={!wallet.publicKey || loading}
          style={{
            padding: "12px 28px",
            fontSize: 16,
            cursor: wallet.publicKey && !loading ? "pointer" : "not-allowed",
            opacity: wallet.publicKey && !loading ? 1 : 0.5,
          }}
        >
          {loading ? "Creating..." : "Create New Competition"}
        </button>
      </div>

      {status && (
        <p style={{ fontSize: 15, marginTop: 16, wordBreak: "break-word" }}>
          {status}
        </p>
      )}

      {competitionPubkey && (
        <p style={{ wordBreak: "break-word" }}>
          <strong>Competition PDA:</strong> {competitionPubkey}
        </p>
      )}
    </main>
  );
}