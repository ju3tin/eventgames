// pages/index.tsx
'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const GamePage = () => {
  // State variables to store game data
  const [score, setScore] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [gameId, setGameId] = useState<number>(1);
  const [metadata, setMetadata] = useState<{ difficulty: string }>({ difficulty: 'easy' });
  const [username, setUsername] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Handle form submission
  const handleSubmitScore = async () => {
    if (!username) {
      setErrorMessage('Please provide a username.');
      return;
    }

    try {
      // Get the current user if logged in
      const user = supabase.auth.user();
      const profileId = user?.id;
      
      if (!profileId) {
        setErrorMessage('User is not logged in.');
        return;
      }

      // Submit the score to Supabase
      const { data, error } = await supabase
        .from('game_scores')
        .insert([
          {
            score: score,
            duration_seconds: duration,
            created_at: new Date().toISOString(),
            game_id: gameId,
            metadata: metadata, // Optional metadata (e.g., difficulty)
            profile_id: profileId, // Reference to the user's profile
            profile_username: username, // Use the username provided
          },
        ]);

      if (error) {
        setErrorMessage(`Error submitting score: ${error.message}`);
      } else {
        setSuccessMessage('Score submitted successfully!');
        setScore(0);
        setDuration(0);
        setUsername('');
      }
    } catch (error) {
      setErrorMessage(`Error: ${error}`);
    }
  };

  // Handle authentication (sign in/up)
  const handleAuth = async (email: string, password: string) => {
    const { user, error } = await supabase.auth.signIn({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage(`Authentication failed: ${error.message}`);
    } else {
      setSuccessMessage(`Welcome back, ${user?.email}`);
    }
  };

  return (
    <div>
      <h1>Game Page</h1>

      <div>
        {/* Authentication Form */}
        <div>
          <h3>Sign In</h3>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => handleAuth(username, 'password')}>Sign In</button>
        </div>

        {/* Error & Success Messages */}
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}

        {/* Game Score Form */}
        <div>
          <h3>Submit Score</h3>
          <input
            type="number"
            placeholder="Score"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Duration in seconds"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
          <select
            value={gameId}
            onChange={(e) => setGameId(Number(e.target.value))}
          >
            <option value={1}>Game 1</option>
            <option value={2}>Game 2</option>
            <option value={3}>Game 3</option>
          </select>
          <input
            type="text"
            placeholder="Metadata (e.g., difficulty)"
            value={metadata.difficulty}
            onChange={(e) => setMetadata({ difficulty: e.target.value })}
          />
          <button onClick={handleSubmitScore}>Submit Score</button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
