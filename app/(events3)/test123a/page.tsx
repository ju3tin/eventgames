import React, { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { IDL } from './idl'; // ← We'll create this

require('@solana/wallet-adapter-react-ui/styles.css');

const PROGRAM_ID = new PublicKey("2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ");
const network = WalletAdapterNetwork.Devnet;

function AppContent() {
  const wallet = useWallet();
  const [competitionPubkey, setCompetitionPubkey] = useState<string>("");
  const [status, setStatus] = useState("");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const getProvider = () => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    return new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  };

  // Create Competition
  const createCompetition = async () => {
    if (!wallet.publicKey) return alert("Connect wallet first");

    const provider = getProvider();
    const program = new Program(IDL as any, PROGRAM_ID, provider);

    const username = "Justin";
    const description = "My First MotionPlay Challenge";
    const gameId = 1;
    const randomString = `comp_${Date.now()}`;
    const startTime = Math.floor(Date.now() / 1000);
    const finishTime = startTime + 86400; // 24 hours
    const entryFee = 0.1 * web3.LAMPORTS_PER_SOL;
    const maxParticipants = 50;

    const [compPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("competition"),
        wallet.publicKey.toBuffer(),
        new web3.BN(gameId).toArrayLike(Buffer, "le", 8),
        Buffer.from(randomString),
      ],
      PROGRAM_ID
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), compPda.toBuffer()],
      PROGRAM_ID
    );

    try {
      const tx = await program.methods
        .createCompetition({
          username,
          description,
          gameId: new web3.BN(gameId),
          randomString,
          startTime: new web3.BN(startTime),
          finishTime: new web3.BN(finishTime),
          entryFee: new web3.BN(entryFee),
          maxParticipants,
        })
        .accounts({
          creator: wallet.publicKey,
          competition: compPda,
          vault: vaultPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setCompetitionPubkey(compPda.toBase58());
      setStatus(`Competition created! PDA: ${compPda.toBase58()}`);
      console.log("Transaction:", tx);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // Enter Competition
  const enterCompetition = async () => {
    if (!competitionPubkey) return alert("Create competition first");

    const provider = getProvider();
    const program = new Program(IDL as any, PROGRAM_ID, provider);

    const compKey = new PublicKey(competitionPubkey);
    const [playerEntryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("entry"), compKey.toBuffer(), wallet.publicKey!.toBuffer()],
      PROGRAM_ID
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), compKey.toBuffer()],
      PROGRAM_ID
    );

    try {
      const tx = await program.methods.enter()
        .accounts({
          player: wallet.publicKey,
          competition: compKey,
          playerEntry: playerEntryPda,
          vault: vaultPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setStatus("✅ Successfully entered the competition!");
      console.log("Enter tx:", tx);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>MotionPlay - Competition</h1>
      <WalletMultiButton />

      <div style={{ margin: "30px 0" }}>
        <button onClick={createCompetition} disabled={!wallet.publicKey}>
          Create New Competition
        </button>

        <button onClick={enterCompetition} disabled={!competitionPubkey || !wallet.publicKey} style={{ marginLeft: 20 }}>
          Enter Competition
        </button>
      </div>

      {status && <p><strong>{status}</strong></p>}

      {competitionPubkey && (
        <p><strong>Competition PDA:</strong> {competitionPubkey}</p>
      )}
    </div>
  );
}

export default function App() {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AppContent />
      </WalletModalProvider>
    </WalletProvider>
  );
}
