// app/game/[slug]/GameOverClient.tsx
'use client';

import { useActionState } from 'react';
import { submitGameScore } from './actions'; // same server action as before

type Props = {
  gameId: string;
  finalScore: number;
  durationSeconds: number;
  slug: string;
  gameTitle: string;
};

export default function GameOverClient({
  gameId,
  finalScore,
  durationSeconds,
  slug,
  gameTitle,
}: Props) {
  const [state, formAction, isPending] = useActionState(submitGameScore, null);

  return (
    <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-6">{gameTitle} – Game Over!</h2>
      
      <div className="mb-8 space-y-3">
        <p className="text-2xl text-green-400">
          Score: <strong>{finalScore.toLocaleString()}</strong>
        </p>
        <p className="text-xl text-blue-300">
          Time: <strong>{durationSeconds}s</strong>
        </p>
      </div>

      {state?.success ? (
        <div className="mb-6 p-4 bg-green-900/50 rounded-lg">
          <p className="text-green-300 font-medium">{state.message}</p>
          <a
            href={`/leaderboard/${slug}`}
            className="mt-4 inline-block text-blue-400 underline hover:text-blue-300"
          >
            View Leaderboard →
          </a>
        </div>
      ) : state?.error ? (
        <p className="mb-6 p-4 bg-red-900/50 text-red-300 rounded-lg">
          {state.error}
        </p>
      ) : null}

      {!state?.success && (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="game_id" value={gameId} />
          <input type="hidden" name="score" value={finalScore} />
          <input type="hidden" name="duration_seconds" value={durationSeconds} />

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
              isPending
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isPending ? 'Submitting Score...' : 'Submit Score to Leaderboard'}
          </button>
        </form>
      )}
    </div>
  );
}