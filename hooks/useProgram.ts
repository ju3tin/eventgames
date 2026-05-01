"use client";

import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import IDL from "@/idl.json";
import { getProvider } from "@/lib/anchor";
import { getProgram } from "@/lib/program";

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    return getProvider(connection, wallet);
  }, [connection, wallet.publicKey]);

  const program = useMemo(() => {
    return getProgram(provider, IDL);
  }, [provider]);

  return { program, provider, wallet };
}
