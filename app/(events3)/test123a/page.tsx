'use client';

import React, { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { IDL } from '@/idl1';        // ← Make sure path is correct

const PROGRAM_ID = new PublicKey("2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ");

export default function CompetitionPage() {
  const wallet = useWallet();
  const [competitionPubkey, setCompetitionPubkey] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const getProvider = (): AnchorProvider => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Please connect your wallet");
    }
    return new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
  };

  const createCompetition = async () => {
    if (!wallet.publicKey) return alert("Connect wallet first!");

    try {
      const provider = getProvider();
      
      // ✅ Correct Program initialization
      const program = new Program(IDL, PROGRAM_ID, provider);

      const username = "Justin";
      const description = "Test Competition on Devnet";
      const gameId = 123;
      const randomString = `motion_${Date.now()}`;
      const startTime = Math.floor(Date.now() / 1000);
      const finishTime = startTime + 86400; // 24 hours
      const entryFee = 100_000_000; // 0.1 SOL
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
      setStatus(`✅ Success! Competition PDA: ${compPda.toBase58()}`);
      console.log("Transaction signature:", tx);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 900 }}>
      <h1>MotionPlay - Create Competition</h1>
      <WalletMultiButton />

      <div style={{ margin: "30px 0" }}>
        <button onClick={createCompetition} disabled={!wallet.publicKey} style={{ padding: "12px 24px", fontSize: "16px" }}>
          Create New Competition
        </button>
      </div>

      {status && <p><strong>{status}</strong></p>}
      {competitionPubkey && (
        <p><strong>Competition Address:</strong> {competitionPubkey}</p>
      )}
    </div>
  );
}
