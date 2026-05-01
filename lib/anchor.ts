import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";

export function getProvider(connection: Connection, wallet: any) {
  if (!wallet?.publicKey) return null;

  return new anchor.AnchorProvider(
    connection,
    wallet as anchor.Wallet,
    { commitment: "processed" }
  );
}
