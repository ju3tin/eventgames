'use client';

import React, { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { IDL } from '@/idl1'; // ← Update the path if your IDL is elsewhere

const PROGRAM_ID = new PublicKey("2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ");

export default function CompetitionPage() {
  const wallet = useWallet();
  const [competitionPubkey, setCompetitionPubkey] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const getProvider = () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Please connect your wallet");
    }
    return new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  };

  const createCompetition = async () => {
    if (!wallet.publicKey) return alert("Connect your wallet first");

    try {
      const provider = getProvider();
      const program = new Program(IDL as any, PROGRAM_ID, provider);

      const username = "Justin";
      const description = "Test Competition on Devnet";
      const gameId = 123;
      const randomString = `motion_${Date.now()}`;
      const startTime = Math.floor(Date.now() / 1000);
      const finishTime = startTime + 86400; // 24h
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
      setStatus("✅ Competition Created Successfully!");
      console.log("Transaction:", tx);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  const enterCompetition = async () => {
    if (!wallet.publicKey || !competitionPubkey) return alert("Connect wallet and set Competition");

    try {
      const provider = getProvider();
      const program = new Program(IDL as any, PROGRAM_ID, provider);

      const compPubkey = new PublicKey(competitionPubkey);

      const [playerEntryPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("entry"),
          compPubkey.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), compPubkey.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods.enter().accounts({
        player: wallet.publicKey,
        competition: compPubkey,
        playerEntry: playerEntryPda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      }).rpc();

      setStatus("✅ Entered Competition! Tx: " + tx);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  const finalizeCompetition = async (winner: string) => {
    if (!wallet.publicKey || !competitionPubkey) return alert("Connect wallet and set Competition");

    try {
      const provider = getProvider();
      const program = new Program(IDL as any, PROGRAM_ID, provider);

      const compPubkey = new PublicKey(competitionPubkey);

      const tx = await program.methods.finalize(new PublicKey(winner))
        .accounts({
          competition: compPubkey,
          authority: wallet.publicKey,
        })
        .rpc();

      setStatus("✅ Competition Finalized! Tx: " + tx);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  const claimPrize = async () => {
    if (!wallet.publicKey || !competitionPubkey) return alert("Connect wallet and set Competition");

    try {
      const provider = getProvider();
      const program = new Program(IDL as any, PROGRAM_ID, provider);

      const compPubkey = new PublicKey(competitionPubkey);
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), compPubkey.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods.claimPrize().accounts({
        competition: compPubkey,
        claimant: wallet.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      }).rpc();

      setStatus("✅ Prize Claimed! Tx: " + tx);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>MotionPlay Competition</h1>
      <WalletMultiButton />

      <div style={{ marginTop: 30, display: 'flex', gap: 10 }}>
        <button onClick={createCompetition} disabled={!wallet.publicKey}>Create Competition</button>
        <button onClick={enterCompetition} disabled={!wallet.publicKey || !competitionPubkey}>Enter Competition</button>
        <button onClick={() => finalizeCompetition(wallet.publicKey?.toBase58() || "")} disabled={!wallet.publicKey || !competitionPubkey}>Finalize Competition</button>
        <button onClick={claimPrize} disabled={!wallet.publicKey || !competitionPubkey}>Claim Prize</button>
      </div>

      {status && <p style={{ marginTop: 20, fontWeight: "bold" }}>{status}</p>}
      {competitionPubkey && <p><strong>Competition PDA:</strong> {competitionPubkey}</p>}
    </div>
  );
}
