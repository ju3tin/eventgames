import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export function getChallengePda(admin: PublicKey, random: string) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      admin.toBuffer(),
      Buffer.from(random),
    ],
    PROGRAM_ID
  )[0];
}

export function getVaultAuthority(challenge: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault_authority"),
      challenge.toBuffer(),
    ],
    PROGRAM_ID
  )[0];
}
