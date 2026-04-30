'use client';

import { useState } from 'react';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import idlJson from '@/idl/test.json';

// ================== IDL CONFIG ==================
const IDL = idlJson as any;

// ================== DEVNET CONFIG ==================
const PROGRAM_ID = new PublicKey('7mCaQvGKDicYCH2ruxF6uD9W8QJpk4hE2cWLmimU8iuT');
const DEVNET_RPC = 'https://api.devnet.solana.com';

const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

const VAULT_AUTHORITY_SEED = Buffer.from('vault_authority');
const ESCROW_VAULT_SEED = Buffer.from('escrow_vault');

export default function CreateChallengePage() {
  const wallet = useWallet();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameId: '1',
    prizeRule: 'WinnerTakesAll' as 'WinnerTakesAll' | 'Top3Split' | 'ParticipationRewards' | 'ScoreMultiplier',
    startDate: '',
    startTime: '',
    finishDate: '',
    finishTime: '',
    entryFee: '1000000',
    maxParticipants: '100',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const devnetConnection = new Connection(DEVNET_RPC, 'confirmed');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createChallenge = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.publicKey) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const provider = new AnchorProvider(
        devnetConnection,
        wallet as any,
        { commitment: 'confirmed' }
      );

      // ✅ Correct way for Anchor v0.30+
      const program = new Program(IDL, provider);

      // Create Unix timestamps
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const finishDateTime = new Date(`${formData.finishDate}T${formData.finishTime}`);

      const startTs = Math.floor(startDateTime.getTime() / 1000);
      const finishTs = Math.floor(finishDateTime.getTime() / 1000);

      // Derive PDAs
      const [challengePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('challenge'), wallet.publicKey.toBuffer(), Buffer.from(formData.name)],
        PROGRAM_ID
      );

      const [vaultAuthority] = PublicKey.findProgramAddressSync([VAULT_AUTHORITY_SEED], PROGRAM_ID);

      const [escrowVault] = PublicKey.findProgramAddressSync(
        [ESCROW_VAULT_SEED, challengePda.toBuffer()],
        PROGRAM_ID
      );

      const txSignature = await program.methods
        .createChallenge(
          formData.name,
          formData.description,
          new BN(formData.gameId),
          { [formData.prizeRule]: {} } as any,
          new BN(startTs),
          new BN(0),
          new BN(finishTs),
          new BN(0),
          new BN(formData.entryFee),
          parseInt(formData.maxParticipants)
        )
        .accounts({
          challenge: challengePda,
          vaultAuthority: vaultAuthority,
          escrowVault: escrowVault,
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
        message: `Challenge created successfully on Devnet! Tx: ${txSignature}`
      });

      console.log('✅ Transaction:', `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
    } catch (error: any) {
      console.error(error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to create challenge. Check console for details.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Create MotionPlay Challenge</h1>
            <p className="text-green-400 mt-1">● Connected to Devnet</p>
          </div>
          <WalletMultiButton />
        </div>

        <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-300 p-4 rounded-xl mb-6 text-sm">
          <strong>Devnet Tips:</strong><br />
          • Get test SOL from: https://faucet.solana.com<br />
          • Get test USDC from a faucet<br />
          • Use Phantom / Solflare in Devnet mode
        </div>

        <form onSubmit={createChallenge} className="space-y-6 bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <div>
            <label className="block text-sm mb-2 font-medium">Challenge Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Summer Clash #1"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Compete in the ultimate motion play challenge..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Game ID</label>
              <input
                type="number"
                name="gameId"
                value={formData.gameId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Prize Rule</label>
              <select
                name="prizeRule"
                value={formData.prizeRule}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              >
                <option value="WinnerTakesAll">Winner Takes All</option>
                <option value="Top3Split">Top 3 Split</option>
                <option value="ParticipationRewards">Participation Rewards</option>
                <option value="ScoreMultiplier">Score Multiplier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Finish Date</label>
              <input
                type="date"
                name="finishDate"
                value={formData.finishDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Finish Time</label>
              <input
                type="time"
                name="finishTime"
                value={formData.finishTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Entry Fee (in smallest units)</label>
              <input
                type="number"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">For USDC: 1000000 = 1 USDC</p>
            </div>
            <div>
              <label className="block text-sm mb-2">Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !wallet.publicKey}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-xl font-semibold text-lg transition-colors"
          >
            {loading ? 'Creating Challenge on Devnet...' : 'Create Challenge'}
          </button>
        </form>

        {status && (
          <div className={`mt-6 p-5 rounded-2xl text-sm ${
            status.type === 'success' 
              ? 'bg-green-900/50 border border-green-700' 
              : 'bg-red-900/50 border border-red-700'
          }`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
