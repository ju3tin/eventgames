'use client';

import React, { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { IDL } from '@/idl1'; // make sure path is correct

const PROGRAM_ID = new PublicKey("2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ");

export default function CompetitionPage() {
  const wallet = useWallet();
  const [competitionPubkey, setCompetitionPubkey] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Solana devnet connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Create an AnchorProvider
  const getProvider = (): AnchorProvider => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      throw new Error("Please connect your wallet");
    }
    return new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  };

  // Create Competition
  const createCompetition = async () => {
    if (!wallet.publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const provider = getProvider();
      const program = new Program(IDL as any, PROGRAM_ID, provider);

      // Competition parameters
      const username = "Justin";
      const description = "Test Competition on Devnet";
      const gameId = 123;
      const randomString = `motion_${Date.now()}`;
      const startTime = Math.floor(Date.now() / 1000);
      const finishTime = startTime + 86400; // 24 hours
      const entryFee = 100_000_000; // 0.1 SOL
      const maxParticipants = 100;

      // Derive PDAs
      const [compPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("competition"),
          wallet.publicKey.toBuffer(),
          Buffer.from(new Uint8Array(new BigUint64Array([BigInt(gameId)]).buffer)),
          Buffer.from(randomString),
        ],
        PROGRAM_ID
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), compPda.toBuffer()],
        PROGRAM_ID
      );

      // Call Anchor program method
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
      setStatus(`✅ Competition Created Successfully! Transaction: ${tx}`);
      console.log("Transaction:", tx);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>MotionPlay Competition</h1>
      <WalletMultiButton />

      <div style={{ marginTop: 30 }}>
        <button
          onClick={createCompetition}
          disabled={!wallet.publicKey}
          style={{ padding: "15px 30px", fontSize: "18px" }}
        >
          Create Competition
        </button>
      </div>

      {status && <p style={{ marginTop: 20, fontWeight: "bold" }}>{status}</p>}
      {competitionPubkey && (
        <p>
          <strong>Competition PDA:</strong> {competitionPubkey}
        </p>
      )}
    </div>
  );
}
