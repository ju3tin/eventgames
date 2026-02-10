// types/profile.ts

/**
 * Base profile shape coming from Supabase `public.profiles` table
 */
export interface Profile {
  id: string;                    // uuid
  username: string;              // unique, used as slug
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}

/**
 * Minimal version – used in lists / grids where we don't need everything
 */
export interface ProfileListItem {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  // bio?: string | null;        // optional – can be included or not
}

/**
 * Shape of your /api/profile1 response (based on the example you showed)
 */
export interface ProfileApiResponse {
  success: boolean;
  data: ProfileListItem[];       // or Profile[] if you return full data
  // count?: number;             // optional – if you add pagination later
  // error?: string | null;      // optional – if success: false
}

/**
 * Shape of a single profile response (useful if you create /api/profile/[username])
 */
export interface SingleProfileApiResponse {
  success: boolean;
  data: Profile | null;
  error?: string | null;
}

/**
 * For form / update payloads (when user edits their profile)
 */
export type ProfileUpdateInput = Partial<
  Pick<
    Profile,
    "full_name" | "avatar_url" | "website" | "bio"
  >
>;

/**
 * Optional: if you're using Supabase client types (more precise)
 * You can also generate these automatically with:
 * npx supabase gen types typescript --local > types/supabase.ts
 */
// export type DbProfile = Database['public']['Tables']['profiles']['Row'];

export type { Profile as DbProfile }; // alias if you prefer