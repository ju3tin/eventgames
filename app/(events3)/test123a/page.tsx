'use client';

import { useState } from 'react';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import idlJson from '@/idl2.json'; // <- update path to your IDL

// ================== IDL CONFIG ==================
const IDL = idlJson as any;

// ================== DEVNET CONFIG ==================
const PROGRAM_ID = new PublicKey('2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ');
const DEVNET_RPC = 'https://api.devnet.solana.com';

const VAULT_SEED = Buffer.from('vault');
const COMPETITION_SEED = Buffer.from('competition');

export default function CreateCompetitionPage() {
  const wallet = useWallet();

  const [formData, setFormData] = useState({
    username: '',
    description: '',
    gameId: '1',
    startDate: '',
    startTime: '',
    finishDate: '',
    finishTime: '',
    entryFee: '100000000',
    maxParticipants: '100',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const connection = new Connection(DEVNET_RPC, 'confirmed');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const startTs = Math.floor(new Date(`${formData.startDate}T${formData.startTime || '00:00'}`).getTime() / 1000);
      const finishTs = Math.floor(new Date(`${formData.finishDate}T${formData.finishTime || '23:59'}`).getTime() / 1000);

      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new Program(IDL, PROGRAM_ID, provider);

      // Derive PDAs
      const [compPda] = PublicKey.findProgramAddressSync(
        [
          COMPETITION_SEED,
          wallet.publicKey.toBuffer(),
          Buffer.from(new Uint8Array(new BigUint64Array([BigInt(formData.gameId)]).buffer)),
          Buffer.from(formData.username.trim()),
        ],
        PROGRAM_ID
      );

      const [vaultPda] = PublicKey.findProgramAddressSync([VAULT_SEED, compPda.toBuffer()], PROGRAM_ID);

      // Call Anchor method
      const tx = await program.methods
        .createCompetition({
          username: formData.username.trim(),
          description: formData.description.trim(),
          gameId: new BN(formData.gameId),
          randomString: formData.username.trim(),
          startTime: new BN(startTs),
          finishTime: new BN(finishTs),
          entryFee: new BN(formData.entryFee),
          maxParticipants: Number(formData.maxParticipants),
        })
        .accounts({
          creator: wallet.publicKey,
          competition: compPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus({ type: 'success', message: `✅ Competition created! Tx: ${tx}` });
    } catch (err: any) {
      console.error('Error creating competition:', err);
      setStatus({ type: 'error', message: err.message || 'Failed to create competition' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Create MotionPlay Competition</h1>
            <p className="text-green-400 mt-1">● Connected to Devnet</p>
          </div>
          <WalletMultiButton />
        </div>

        <form onSubmit={createCompetition} className="space-y-6 bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <div>
            <label className="block text-sm mb-2 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Justin"
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
              placeholder="Test Competition on Devnet..."
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
              <label className="block text-sm mb-2">Entry Fee (Lamports)</label>
              <input
                type="number"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <button
            type="submit"
            disabled={loading || !wallet.publicKey}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-xl font-semibold text-lg transition-colors"
          >
            {loading ? 'Creating Competition...' : 'Create Competition'}
          </button>
        </form>

        {status && (
          <div
            className={`mt-6 p-5 rounded-2xl text-sm ${
              status.type === 'success'
                ? 'bg-green-900/50 border border-green-700'
                : 'bg-red-900/50 border border-red-700'
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
