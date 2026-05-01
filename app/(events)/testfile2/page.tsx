"use client";

import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Page() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  // ======================
  // PROGRAM ID
  // ======================
  const programId = new PublicKey(
    "DNjSQoQ7u9Zrfot4uaATGbszQyF8HhRpbYGBy11eMQ7t"
  );

  // ======================
  // PASTE YOUR IDL HERE
  // ======================
  const IDL: any = {
  "version": "0.1.0",
  "name": "motionplay_challenges",
  "instructions": [
    {
      "name": "createChallenge",
      "accounts": [
        {
          "name": "challenge",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "gameId",
          "type": "u64"
        },
        {
          "name": "randomString",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "finishTime",
          "type": "i64"
        },
        {
          "name": "entryFee",
          "type": "u64"
        },
        {
          "name": "maxParticipants",
          "type": "u16"
        }
      ]
    },
    {
      "name": "joinChallenge",
      "accounts": [
        {
          "name": "challenge",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "participant",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "participantTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "distributePrizes",
      "accounts": [
        {
          "name": "challenge",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "platformTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner1",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Challenge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "randomString",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "finishTime",
            "type": "i64"
          },
          {
            "name": "entryFee",
            "type": "u64"
          },
          {
            "name": "maxParticipants",
            "type": "u16"
          },
          {
            "name": "currentParticipants",
            "type": "u16"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "vaultAuthorityBump",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidTime",
      "msg": "Invalid start or finish time"
    },
    {
      "code": 6001,
      "name": "NameTooLong",
      "msg": "Name is too long"
    },
    {
      "code": 6002,
      "name": "DescriptionTooLong",
      "msg": "Description is too long"
    },
    {
      "code": 6003,
      "name": "InvalidRandomString",
      "msg": "Random string must be exactly 8 characters"
    },
    {
      "code": 6004,
      "name": "MaxParticipantsReached",
      "msg": "Maximum number of participants reached"
    },
    {
      "code": 6005,
      "name": "ChallengeNotActive",
      "msg": "Challenge is not active"
    },
    {
      "code": 6006,
      "name": "Unauthorized",
      "msg": "Only admin or creator can perform this action"
    },
    {
      "code": 6007,
      "name": "ChallengeNotEnded",
      "msg": "Challenge has not ended yet"
    },
    {
      "code": 6008,
      "name": "ChallengeStillActive",
      "msg": "Challenge is still active"
    },
    {
      "code": 6009,
      "name": "ArithmeticOverflow",
      "msg": "Arithmetic overflow"
    }
  ]
};

  const mint = new PublicKey("YOUR_TOKEN_MINT_ADDRESS");

  const provider = new anchor.AnchorProvider(
    connection,
    wallet as any,
    { commitment: "processed" }
  );

  const program = new anchor.Program(IDL, programId, provider);

  // ======================
  // CONSTANTS
  // ======================
  const randomString = "abc12345"; // MUST be 8 chars

  // IMPORTANT: admin = wallet for now
  const admin = wallet.publicKey!;
  const creator = wallet.publicKey!;

  // ======================
  // PDAs (MATCH RUST EXACTLY)
  // ======================
  const [challengePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      admin.toBuffer(),
      Buffer.from(randomString),
    ],
    programId
  );

  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), challengePda.toBuffer()],
    programId
  );

  const escrowVault = getAssociatedTokenAddressSync(
    mint,
    vaultAuthority,
    true
  );

  // ======================
  // CREATE CHALLENGE
  // ======================
  const createChallenge = async () => {
    try {
      setLoading(true);

      await program.methods
        .createChallenge(
          "Test Challenge",
          "My first challenge",
          new anchor.BN(1),
          randomString,
          new anchor.BN(Math.floor(Date.now() / 1000)),
          new anchor.BN(Math.floor(Date.now() / 1000) + 3600),
          new anchor.BN(1_000_000),
          10
        )
        .accounts({
          challenge: challengePda,
          vaultAuthority,
          escrowVault,
          mint,
          admin,
          creator,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram:
            anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert("Challenge created");
    } catch (e) {
      console.error(e);
      alert("Create failed");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // JOIN CHALLENGE
  // ======================
  const joinChallenge = async () => {
    try {
      setLoading(true);

      const participantTokenAccount = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey!
      );

      await program.methods
        .joinChallenge()
        .accounts({
          challenge: challengePda,
          escrowVault,
          vaultAuthority,
          participant: wallet.publicKey!,
          participantTokenAccount,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert("Joined");
    } catch (e) {
      console.error(e);
      alert("Join failed");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // DISTRIBUTE PRIZES
  // ======================
  const distributePrizes = async () => {
    try {
      setLoading(true);

      const platformTreasury = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey!
      );

      const winner1 = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey!
      );

      await program.methods
        .distributePrizes()
        .accounts({
          challenge: challengePda,
          escrowVault,
          vaultAuthority,
          signer: wallet.publicKey!,
          platformTreasury,
          winner1,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert("Distributed");
    } catch (e) {
      console.error(e);
      alert("Distribute failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <WalletMultiButton />

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={createChallenge} disabled={loading}>
          Create
        </button>

        <button onClick={joinChallenge} disabled={loading}>
          Join
        </button>

        <button onClick={distributePrizes} disabled={loading}>
          Distribute
        </button>
      </div>
    </div>
  );
}
