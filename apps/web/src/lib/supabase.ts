import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Configured only when both vars are present. When false, the suppliers repo
// falls back to the in-memory mock store, so the app runs with no backend.
export const isSupabaseConfigured = Boolean(url && anonKey)

// Lazily import supabase-js only when configured, so the mock demo bundle stays
// lean and the (large) client is code-split into a chunk that is never fetched
// unless a backend is wired up.
let client: SupabaseClient | null = null
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null
  if (client) return client
  const { createClient } = await import('@supabase/supabase-js')
  client = createClient(url!, anonKey!)
  return client
}
