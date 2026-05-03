'use client';

import React, { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { IDL } from '@/idl1';   // Adjust path if needed

const PROGRAM_ID = new PublicKey("2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ");

export default function CompetitionPage() {
  const wallet = useWallet();
  const [competitionPubkey, setCompetitionPubkey] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // ✅ Correct getProvider function
  const getProvider = (): AnchorProvider => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Please connect your wallet first");
    }

    return new AnchorProvider(
      connection,
      wallet as any,           // WalletAdapter works with AnchorProvider
      { commitment: "confirmed" }
    );
  };

  // Create Competition
  const createCompetition = async () => {
    if (!wallet.publicKey) return alert("Connect wallet first!");

    try {
      const provider = getProvider();
      const program = new Program(IDL as any, PROGRAM_ID, provider);

      const username = "Justin";
      const description = "Test Competition on Devnet";
      const gameId = 123;
      const randomString = `motion_${Date.now()}`;
      const startTime = Math.floor(Date.now() / 1000);
      const finishTime = startTime + 86400; // 24 hours
      const entryFee = 0.1 * 1_000_000_000; // 0.1 SOL
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
          gameId: new (require('@coral-xyz/anchor')).BN(gameId),
          randomString,
          startTime: new (require('@coral-xyz/anchor')).BN(startTime),
          finishTime: new (require('@coral-xyz/anchor')).BN(finishTime),
          entryFee: new (require('@coral-xyz/anchor')).BN(entryFee),
          maxParticipants,
        })
        .accounts({
          creator: wallet.publicKey,
          competition: compPda,
          vault: vaultPda,
          systemProgram: PublicKey.default,
        })
        .rpc();

      setCompetitionPubkey(compPda.toBase58());
      setStatus(`✅ Competition Created! PDA: ${compPda.toBase58()}`);
      console.log("Signature:", tx);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 800 }}>
      <h1>MotionPlay Competition</h1>
      <WalletMultiButton />

      <div style={{ margin: "30px 0" }}>
        <button onClick={createCompetition} disabled={!wallet.publicKey}>
          Create Competition
        </button>
      </div>

      {status && <p><strong>{status}</strong></p>}
      {competitionPubkey && <p><strong>Competition PDA:</strong> {competitionPubkey}</p>}
    </div>
  );
}
