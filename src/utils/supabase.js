import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only initialise the client when both vars are present — avoids a crash
// if the env vars haven't been added to the deployment yet.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabase) {
  console.warn('[rfw] Supabase not configured — VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing. Storage will be unavailable until these are set.')
}
