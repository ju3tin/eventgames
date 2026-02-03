import { User } from '@supabase/supabase-js'; // Make sure to import the right type

const handleSubmitScore = async () => {
  if (!username) {
    setErrorMessage('Please provide a username.');
    return;
  }

  try {
    // Get the current user if logged in
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      setErrorMessage(`Error fetching user: ${error.message}`);
      return;
    }

    if (!user) {
      setErrorMessage('User is not logged in.');
      return;
    }

    const profileId = user.id; // Now TypeScript will understand that user has an `id`

    // Submit the score to Supabase
    const { data, error: insertError } = await supabase
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

    if (insertError) {
      setErrorMessage(`Error submitting score: ${insertError.message}`);
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
