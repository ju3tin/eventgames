'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const PROGRAM_ID = '2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ';

interface Competition {
  pubkey: string;
  description: string;
  creator: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  totalPrize: number;
  finishTime: number;
  status: 'active' | 'ended' | 'cancelled';
  winner: string;
  gameId: number;
}

function ClientWalletButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <WalletMultiButton />;
}

type Filter = 'all' | 'active' | 'ended';
type Sort   = 'prize' | 'players' | 'ending';

export default function CompetitionsPage() {
  const wallet = useWallet();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState<Filter>('all');
  const [sort, setSort]                 = useState<Sort>('prize');
  const [search, setSearch]             = useState('');
  const [joiningPda, setJoiningPda]     = useState('');
  const [joinStatus, setJoinStatus]     = useState<Record<string, string>>({});
  const [joinedComps, setJoinedComps]   = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { Connection, PublicKey, clusterApiUrl } = await import('@solana/web3.js');
      const { AnchorProvider, Program }              = await import('@coral-xyz/anchor');
      const { IDL }                                   = await import('@/idl1');

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const provider   = new AnchorProvider(
        connection,
        wallet as any ?? {
          publicKey: null,
          signTransaction: async (t: any) => t,
          signAllTransactions: async (t: any) => t,
        },
        { commitment: 'confirmed' }
      );
      const program = new Program(IDL as any, provider) as any;
      const all     = await program.account.competition.all();

      const mapped: Competition[] = all.map(({ publicKey, account: a }: any) => ({
        pubkey:              publicKey.toBase58(),
        description:         a.description,
        creator:             a.creator.toBase58(),
        entryFee:            a.entryFee.toNumber() / 1e9,
        maxParticipants:     a.maxParticipants,
        currentParticipants: a.currentParticipants,
        totalPrize:          a.totalPrize.toNumber() / 1e9,
        finishTime:          a.finishTime.toNumber(),
        status:              a.status.ended ? 'ended' : a.status.cancelled ? 'cancelled' : 'active',
        winner:              a.winner?.toBase58?.() ?? '',
        gameId:              a.gameId?.toNumber?.() ?? 0,
      }));

      setCompetitions(mapped);
    } catch (e: any) {
      setError('Failed to load competitions: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Check which active competitions the connected wallet has already joined
  const checkJoinedComps = useCallback(async (comps: Competition[]) => {
    if (!wallet.publicKey) { setJoinedComps(new Set()); return; }
    try {
      const { Connection, PublicKey, clusterApiUrl } = await import('@solana/web3.js');
      const { AnchorProvider, Program }              = await import('@coral-xyz/anchor');
      const { IDL }                                   = await import('@/idl1');
      const programId  = new PublicKey(PROGRAM_ID);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const provider   = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program    = new Program(IDL as any, provider) as any;

      const active = comps.filter(c => c.status === 'active');
      const results = await Promise.allSettled(
        active.map(async (comp) => {
          const compPda    = new PublicKey(comp.pubkey);
          const [entryPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('entry'), compPda.toBuffer(), wallet.publicKey!.toBuffer()], programId
          );
          await program.account.playerEntry.fetch(entryPda);
          return comp.pubkey;
        })
      );

      const joined = new Set<string>();
      results.forEach((r) => { if (r.status === 'fulfilled') joined.add(r.value); });
      setJoinedComps(joined);
    } catch { /* silent */ }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (competitions.length) checkJoinedComps(competitions);
  }, [competitions, checkJoinedComps]);


  const handleJoin = async (comp: Competition) => {
    if (!wallet.publicKey) return alert('Connect wallet first.');
    setJoiningPda(comp.pubkey);
    setJoinStatus(s => ({ ...s, [comp.pubkey]: '' }));
    try {
      const { Connection, PublicKey, SystemProgram, clusterApiUrl } = await import('@solana/web3.js');
      const { AnchorProvider, Program }                             = await import('@coral-xyz/anchor');
      const { IDL }                                                  = await import('@/idl1');

      const programId  = new PublicKey(PROGRAM_ID);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const provider   = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program    = new Program(IDL as any, provider) as any;
      const compPda    = new PublicKey(comp.pubkey);

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), compPda.toBuffer()], programId
      );
      const [entryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('entry'), compPda.toBuffer(), wallet.publicKey.toBuffer()], programId
      );

      await program.methods.enter()
        .accounts({ player: wallet.publicKey, competition: compPda,
          playerEntry: entryPda, vault: vaultPda, systemProgram: SystemProgram.programId })
        .rpc();

      setJoinStatus(s => ({ ...s, [comp.pubkey]: '✅ Joined!' }));
      setJoinedComps(prev => new Set([...prev, comp.pubkey]));
      fetchAll();
    } catch (e: any) {
      setJoinStatus(s => ({ ...s, [comp.pubkey]: '❌ ' + e.message }));
    } finally {
      setJoiningPda('');
    }
  };

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const now = Date.now() / 1000;

  const visible = competitions
    .filter(c => {
      if (filter === 'active')  return c.status === 'active';
      if (filter === 'ended')   return c.status === 'ended';
      return true;
    })
    .filter(c =>
      !search.trim() ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.pubkey.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'prize')   return b.totalPrize - a.totalPrize;
      if (sort === 'players') return b.currentParticipants - a.currentParticipants;
      if (sort === 'ending')  return a.finishTime - b.finishTime;
      return 0;
    });

  const counts = {
    all:    competitions.length,
    active: competitions.filter(c => c.status === 'active').length,
    ended:  competitions.filter(c => c.status === 'ended').length,
  };

  const timeLeft = (ts: number) => {
    const diff = ts - now;
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    if (h > 48) return `${Math.floor(h / 24)}d left`;
    if (h > 0)  return `${h}h ${m}m left`;
    return `${m}m left`;
  };

  return (
    <main style={s.main}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>MotionPlay</h1>
          <p style={s.subtitle}>Live Competitions</p>
        </div>
        <ClientWalletButton />
      </div>

      {/* Controls */}
      <div style={s.controls}>
        {/* Filter tabs */}
        <div style={s.filterTabs}>
          {(['all', 'active', 'ended'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...s.filterTab, ...(filter === f ? s.filterTabActive : {}) }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ ...s.badge, ...(filter === f ? s.badgeActive : {}) }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <div style={s.rightControls}>
          {/* Search */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search competitions…"
              style={s.search}
            />
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value as Sort)} style={s.select}>
            <option value="prize">Sort: Prize Pool</option>
            <option value="players">Sort: Players</option>
            <option value="ending">Sort: Ending Soon</option>
          </select>

          {/* Refresh */}
          <button onClick={fetchAll} disabled={loading} style={s.refreshBtn} title="Refresh">
            <span style={{ display: 'inline-block', animation: loading ? 'spin 0.7s linear infinite' : 'none' }}>
              ↻
            </span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p style={s.error}>{error}</p>}

      {/* Loading skeleton */}
      {loading && !competitions.length && (
        <div style={s.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={s.skeleton} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && visible.length === 0 && (
        <div style={s.empty}>
          <p style={{ fontSize: 40, margin: '0 0 12px' }}>🏆</p>
          <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>No competitions found</p>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
            {search ? 'Try a different search.' : 'Check back soon or create one!'}
          </p>
        </div>
      )}

      {/* Grid */}
      {visible.length > 0 && (
        <div style={s.grid}>
          {visible.map(comp => {
            const isActive   = comp.status === 'active';
            const fillPct    = Math.round((comp.currentParticipants / comp.maxParticipants) * 100);
            const isJoining  = joiningPda === comp.pubkey;
            const jStatus    = joinStatus[comp.pubkey] ?? '';
            const isCreator  = wallet.publicKey?.toBase58() === comp.creator;
            const hasJoined  = joinedComps.has(comp.pubkey);
            const playUrl    = `/gameplay?comp=${encodeURIComponent(comp.pubkey)}&gameId=${comp.gameId}`;

            return (
              <div key={comp.pubkey} style={{
                ...s.card,
                ...(isActive ? {} : s.cardDim),
              }}>
                {/* Status pill */}
                <div style={s.cardTop}>
                  <span style={{ ...s.pill, ...(isActive ? s.pillActive : s.pillEnded) }}>
                    {isActive ? '● Live' : comp.status === 'ended' ? 'Ended' : 'Cancelled'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isCreator && <span style={s.pillCreator}>You created</span>}
                    {hasJoined && <span style={s.pillJoined}>✓ Entered</span>}
                  </div>
                </div>

                {/* Title */}
                <h3 style={s.cardTitle}>{comp.description || 'Untitled Competition'}</h3>

                {/* Prize */}
                <div style={s.prizeRow}>
                  <span style={s.prizeLabel}>Prize Pool</span>
                  <span style={s.prizeValue}>{comp.totalPrize.toFixed(3)} SOL</span>
                </div>

                {/* Stats row */}
                <div style={s.statsRow}>
                  <div style={s.stat}>
                    <span style={s.statLabel}>Entry Fee</span>
                    <span style={s.statVal}>{comp.entryFee} SOL</span>
                  </div>
                  <div style={s.statDivider} />
                  <div style={s.stat}>
                    <span style={s.statLabel}>Game ID</span>
                    <span style={s.statVal}>#{comp.gameId}</span>
                  </div>
                  <div style={s.statDivider} />
                  <div style={s.stat}>
                    <span style={s.statLabel}>Ends</span>
                    <span style={{ ...s.statVal, color: isActive && comp.finishTime - now < 3600 ? '#ef4444' : '#111827' }}>
                      {timeLeft(comp.finishTime)}
                    </span>
                  </div>
                </div>

                {/* Participants bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={s.barLabels}>
                    <span style={s.barLabel}>{comp.currentParticipants} / {comp.maxParticipants} players</span>
                    <span style={s.barLabel}>{fillPct}%</span>
                  </div>
                  <div style={s.barTrack}>
                    <div style={{ ...s.barFill, width: `${fillPct}%`, background: fillPct > 80 ? '#ef4444' : '#9945FF' }} />
                  </div>
                </div>

                {/* Winner (if ended) */}
                {comp.status === 'ended' && comp.winner && comp.winner !== '11111111111111111111111111111111' && (
                  <div style={s.winnerRow}>
                    🏆 <span style={s.winnerLabel}>Winner</span>
                    <span style={s.winnerAddr}>
                      {comp.winner.slice(0, 6)}…{comp.winner.slice(-4)}
                      {comp.winner === wallet.publicKey?.toBase58() && (
                        <span style={{ color: '#9945FF', marginLeft: 6, fontFamily: 'Arial' }}>you!</span>
                      )}
                    </span>
                  </div>
                )}

                {/* PDA */}
                <p style={s.pda} title={comp.pubkey}>
                  {comp.pubkey.slice(0, 8)}…{comp.pubkey.slice(-6)}
                </p>

                {/* Action */}
                {isActive && (
                  <div>
                    {hasJoined ? (
                      <a href={playUrl} style={s.playBtn}>
                        ▶ Play Now
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => handleJoin(comp)}
                          disabled={isJoining || !wallet.publicKey || comp.currentParticipants >= comp.maxParticipants}
                          style={{
                            ...s.joinBtn,
                            opacity: (!wallet.publicKey || comp.currentParticipants >= comp.maxParticipants) ? 0.45 : 1,
                            cursor:  (!wallet.publicKey || comp.currentParticipants >= comp.maxParticipants) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isJoining ? 'Joining…' :
                           comp.currentParticipants >= comp.maxParticipants ? 'Full' : 'Join Competition'}
                        </button>
                        {jStatus && (
                          <p style={{ ...s.jStatus, color: jStatus.startsWith('✅') ? '#15803d' : '#dc2626' }}>
                            {jStatus}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  main:         { maxWidth: 1200, margin: '0 auto', padding: '40px 24px', fontFamily: 'Arial, sans-serif' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  title:        { fontSize: 28, fontWeight: 700, margin: '0 0 4px' },
  subtitle:     { fontSize: 14, color: '#6b7280', margin: 0 },

  controls:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 12, flexWrap: 'wrap' as const },
  filterTabs:   { display: 'flex', gap: 4 },
  filterTab:    { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#6b7280' },
  filterTabActive: { borderColor: '#9945FF', background: '#faf5ff', color: '#9945FF' },
  badge:        { fontSize: 11, padding: '2px 6px', borderRadius: 100, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 },
  badgeActive:  { background: '#ede9fe', color: '#7c3aed' },

  rightControls:{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const },
  searchWrap:   { position: 'relative' as const, display: 'flex', alignItems: 'center' },
  searchIcon:   { position: 'absolute' as const, left: 10, fontSize: 13, pointerEvents: 'none' as const },
  search:       { padding: '8px 12px 8px 30px', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none', width: 200 },
  select:       { padding: '8px 12px', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none', background: '#fff', cursor: 'pointer' },
  refreshBtn:   { padding: '8px 12px', fontSize: 18, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', lineHeight: 1 },

  error:        { color: '#dc2626', fontSize: 14, padding: '12px 16px', background: '#fef2f2', borderRadius: 8, marginBottom: 20 },

  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  skeleton:     { height: 280, borderRadius: 16, background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'pulse 1.4s ease-in-out infinite' },

  empty:        { textAlign: 'center' as const, padding: '80px 24px', border: '1px dashed #e5e7eb', borderRadius: 16 },

  card:         { border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px', background: '#fff', display: 'flex', flexDirection: 'column' as const, gap: 0, transition: 'box-shadow 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardDim:      { opacity: 0.75 },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle:    { fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 16px', lineHeight: 1.4 },

  pill:         { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100 },
  pillActive:   { background: '#dcfce7', color: '#15803d' },
  pillEnded:    { background: '#f3f4f6', color: '#6b7280' },
  pillCreator:  { fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 100, background: '#faf5ff', color: '#9945FF', border: '1px solid #ede9fe' },
  pillJoined:   { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },

  prizeRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf5ff', borderRadius: 10, padding: '10px 14px', marginBottom: 14 },
  prizeLabel:   { fontSize: 12, color: '#7c3aed', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  prizeValue:   { fontSize: 20, fontWeight: 700, color: '#9945FF' },

  statsRow:     { display: 'flex', marginBottom: 16, border: '1px solid #f3f4f6', borderRadius: 10, overflow: 'hidden' },
  stat:         { flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column' as const, gap: 3 },
  statDivider:  { width: 1, background: '#f3f4f6' },
  statLabel:    { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 500 },
  statVal:      { fontSize: 14, fontWeight: 600, color: '#111827' },

  barLabels:    { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  barLabel:     { fontSize: 12, color: '#6b7280' },
  barTrack:     { height: 6, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 100, transition: 'width 0.3s' },

  winnerRow:    { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fefce8', borderRadius: 8 },
  winnerLabel:  { color: '#92400e', fontWeight: 600 },
  winnerAddr:   { fontFamily: 'monospace', color: '#78350f', fontSize: 12 },

  pda:          { fontSize: 11, color: '#d1d5db', fontFamily: 'monospace', margin: '0 0 14px', letterSpacing: '0.03em' },

  joinBtn:      { width: '100%', padding: '11px', fontSize: 15, fontWeight: 600, background: '#9945FF', color: '#fff', border: 'none', borderRadius: 10, marginTop: 4, cursor: 'pointer' },
  playBtn:      { display: 'block', width: '100%', padding: '11px', fontSize: 15, fontWeight: 700, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, marginTop: 4, textAlign: 'center' as const, textDecoration: 'none', boxSizing: 'border-box' as const },
  jStatus:      { fontSize: 13, margin: '8px 0 0', wordBreak: 'break-word' as const },
};
