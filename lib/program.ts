import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export function getProgram(provider: anchor.AnchorProvider | null, idl: any) {
  if (!provider) return null;

  return new anchor.Program(
    idl as anchor.Idl,
    PROGRAM_ID,
    provider
  );
}
