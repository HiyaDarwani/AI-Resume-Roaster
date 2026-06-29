// lib/db.js
// Supabase client and operations layer (optional persistence & rate limit counting)
// If environment variables are missing, exports null gracefully and uses local memory fallbacks.

import { createClient } from '@supabase/supabase-js';

let supabase = null;

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here'
) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Synchronize user profile into Supabase database upon successful OAuth sign-in.
 * Required to ensure FK references on public.roasts work correctly.
 */
export async function syncUser({ id, email, name, image }) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id,
          email,
          name,
          image,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[db] User sync error:', err.message);
    return null;
  }
}

/**
 * Save a completed resume roast to the Supabase database.
 */
export async function saveRoastSession({ userId, filename, resumeText, roastResult }) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('roasts')
      .insert([
        {
          user_id:       userId,
          filename,
          resume_text:   resumeText.substring(0, 8000), // Clamp stored characters for size safety
          roast_json:    roastResult,
          overall_score: roastResult.overallScore ?? 50,
          roast_level:   roastResult.roastLevel ?? 'medium',
          created_at:    new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch (err) {
    console.error('[db] Save roast session error:', err.message);
    return null;
  }
}

/**
 * Query Supabase to count the number of roasts a user has requested in the last hour.
 * Used by the rate limiter for API abuse protection.
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getRecentRoastCount(userId) {
  if (!supabase) return 0;

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from('roasts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);

    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.error('[db] Get recent roast count error:', err.message);
    return 0;
  }
}

/**
 * Fetch a saved roast by its UUID
 */
export async function getRoastSession(id) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('roasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[db] Fetch roast session error:', err.message);
    return null;
  }
}

export { supabase };
