'use client';

import { useState } from 'react';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import idlJson from '@/idl/test.json';

// ================= CONFIG =================
const PROGRAM_ID = new PublicKey('7mCaQvGKDicYCH2ruxF6uD9W8QJpk4hE2cWLmimU8iuT');
const DEVNET_RPC = 'https://api.devnet.solana.com';

const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

const VAULT_AUTHORITY_SEED = Buffer.from('vault_authority');
const ESCROW_VAULT_SEED = Buffer.from('escrow_vault');

const IDL = idlJson as any;

// ================= HELPERS =================
const safeBN = (value: string | number, fallback = '0') => {
  try {
    if (value === '' || value === undefined || value === null) {
      return new BN(fallback);
    }
    return new BN(value.toString());
  } catch {
    return new BN(fallback);
  }
};

const getErrorMessage = (error: any) => {
  if (error?.message) return error.message;
  return 'Transaction failed';
};

// ================= COMPONENT =================
export default function CreateChallengePage() {
  const wallet = useWallet();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameId: '1',
    prizeRule: 'WinnerTakesAll',
    startDate: '',
    startTime: '',
    finishDate: '',
    finishTime: '',
    entryFee: '1000000',
    maxParticipants: '100',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const connection = new Connection(DEVNET_RPC, 'confirmed');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createChallenge = async (e: any) => {
    e.preventDefault();

    if (!wallet.publicKey) {
      setStatus({ type: 'error', message: 'Connect wallet first' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // ================= TIME =================
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const finish = new Date(`${formData.finishDate}T${formData.finishTime}`);

      const startTs = Math.floor(start.getTime() / 1000);
      const finishTs = Math.floor(finish.getTime() / 1000);

      // ================= PROVIDER =================
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: 'confirmed',
      });

      const program = new Program(IDL, PROGRAM_ID, provider);

      // ================= PDA =================
      const [challengePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('challenge'),
          wallet.publicKey.toBuffer(),
          Buffer.from(formData.name.trim()),
        ],
        PROGRAM_ID
      );

      const [vaultAuthority] = PublicKey.findProgramAddressSync(
        [VAULT_AUTHORITY_SEED, challengePda.toBuffer()],
        PROGRAM_ID
      );

      const [escrowVault] = PublicKey.findProgramAddressSync(
        [ESCROW_VAULT_SEED, challengePda.toBuffer()],
        PROGRAM_ID
      );

      // ================= ENUM =================
      const prizeRuleMap: any = {
        WinnerTakesAll: { winnerTakesAll: {} },
        Top3Split: { top3Split: {} },
        ParticipationRewards: { participationRewards: {} },
        ScoreMultiplier: { scoreMultiplier: {} },
      };

      // ================= TX =================
      const tx = await program.methods
        .createChallenge(
          formData.name.trim(),
          formData.description.trim(),
          safeBN(formData.gameId, '1'),
          prizeRuleMap[formData.prizeRule],
          safeBN(startTs),
          new BN(0),
          safeBN(finishTs),
          new BN(0),
          safeBN(formData.entryFee, '1000000'),
          Number(formData.maxParticipants || 100)
        )
        .accounts({
          challenge: challengePda,
          vaultAuthority,
          escrowVault,
          mint: USDC_MINT,
          admin: wallet.publicKey,
          creator: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus({
        type: 'success',
        message: `✅ Success: ${tx}`,
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white bg-black min-h-screen">
      <div className="max-w-xl mx-auto space-y-6">

        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Create Challenge</h1>
          <WalletMultiButton />
        </div>

        <form onSubmit={createChallenge} className="space-y-4">

          <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-3 bg-gray-800 rounded" required />
          <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-3 bg-gray-800 rounded" required />

          <input type="number" name="gameId" placeholder="Game ID" onChange={handleChange} className="w-full p-3 bg-gray-800 rounded" />

          <select name="prizeRule" onChange={handleChange} className="w-full p-3 bg-gray-800 rounded">
            <option>WinnerTakesAll</option>
            <option>Top3Split</option>
            <option>ParticipationRewards</option>
            <option>ScoreMultiplier</option>
          </select>

          <input type="date" name="startDate" onChange={handleChange} required className="w-full p-3 bg-gray-800 rounded" />
          <input type="time" name="startTime" onChange={handleChange} required className="w-full p-3 bg-gray-800 rounded" />

          <input type="date" name="finishDate" onChange={handleChange} required className="w-full p-3 bg-gray-800 rounded" />
          <input type="time" name="finishTime" onChange={handleChange} required className="w-full p-3 bg-gray-800 rounded" />

          <input type="number" name="entryFee" placeholder="Entry Fee" onChange={handleChange} className="w-full p-3 bg-gray-800 rounded" />
          <input type="number" name="maxParticipants" placeholder="Max Participants" onChange={handleChange} className="w-full p-3 bg-gray-800 rounded" />

          <button disabled={loading} className="w-full p-4 bg-blue-600 rounded">
            {loading ? 'Creating...' : 'Create Challenge'}
          </button>

        </form>

        {status && (
          <div className={status.type === 'error' ? 'text-red-400' : 'text-green-400'}>
            {status.message}
          </div>
        )}

      </div>
    </div>
  );
}
