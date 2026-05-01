import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { motionplay_challenges } from '@/idl.json'; // Make sure this path is correct

// Your Program ID (update this after anchor build)
export const PROGRAM_ID = new PublicKey(
  "3UdgHxsQjfkbsc9QpRuMyrFH38vpXh6QVDS4ph4kNtmY"
);

// Create Anchor Provider from wallet
export const getProvider = (wallet: any): AnchorProvider => {
  const connection = new Connection(
    "https://api.devnet.solana.com", 
    "confirmed"
  );

  const provider = new AnchorProvider(
    connection,
    wallet,           // This should be the wallet adapter object
    {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    }
  );

  return provider;
};

// Get Program instance
export const getProgram = (wallet: any): Program => {
  const provider = getProvider(wallet);
  
  return new Program(
    motionplay_challenges as any,   // Your IDL
    PROGRAM_ID,
    provider
  );
};
