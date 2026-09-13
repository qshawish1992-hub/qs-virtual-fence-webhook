import { supabase, supabaseEnvError } from './supabaseClient'

function ensureSupabase() {
  if (supabaseEnvError) throw new Error(supabaseEnvError)
}

async function run(query) {
  ensureSupabase()
  const { data, error } = await query
  if (error) throw new Error(`تعذر تحميل بيانات Supabase: ${error.message}`)
  return data || []
}

export function getOrganizations() {
  return run(supabase.from('organizations').select('*').order('created_at', { ascending: false }))
}

export function createOrganization(data) {
  return run(supabase.from('organizations').insert(data).select().single())
}

export function getAlerts(limit = 5) {
  return run(supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(limit))
}

export function getAllAlerts() {
  return run(supabase.from('alerts').select('*').order('created_at', { ascending: false }))
}

export function createAlert(data) {
  return run(supabase.from('alerts').insert(data).select().single())
}

export function getSubscriptions() {
  return run(supabase.from('subscriptions').select('*').eq('status', 'active'))
}

export { ensureSupabase }
