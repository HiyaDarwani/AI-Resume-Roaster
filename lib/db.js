// lib/db.js
// Supabase client — optional persistence layer
// If env vars are missing, exports null gracefully so the app still works

import { createClient } from '@supabase/supabase-js';

let supabase = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Save a roast session to Supabase
 * @param {Object} data - { userId, userEmail, resumeText, roastResult }
 * @returns {Promise<string|null>} The saved session ID, or null if Supabase not configured
 */
export async function saveRoastSession({ userId, userEmail, resumeText, roastResult }) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('roast_sessions')
      .insert([{
        user_id: userId,
        user_email: userEmail,
        resume_text: resumeText.substring(0, 5000), // Store first 5000 chars
        roast_result: roastResult,
        created_at: new Date().toISOString(),
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch (err) {
    console.error('Supabase save error:', err);
    return null;
  }
}

/**
 * Get a roast session by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getRoastSession(id) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('roast_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

export { supabase };
