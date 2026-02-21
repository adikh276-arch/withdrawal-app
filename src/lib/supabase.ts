import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase: SupabaseClient | null =
  config.supabaseUrl && config.supabaseAnonKey
    ? createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

export async function setUserContext(userId: number) {
  if (!supabase) return;
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: String(userId),
      is_local: true,
    });
  } catch (e) {
    console.warn('Could not set user context:', e);
  }
}

export async function upsertUser(userId: number) {
  if (!supabase) return;
  await setUserContext(userId);
  await supabase.from('users').upsert({ id: userId }, { onConflict: 'id' });
}

export async function loadQuitDate(userId: number): Promise<string | null> {
  if (!supabase) return null;
  await setUserContext(userId);
  const { data } = await supabase
    .from('withdrawal_profiles')
    .select('quit_date')
    .eq('user_id', userId)
    .single();
  return data?.quit_date || null;
}

export async function saveQuitDate(userId: number, quitDate: string) {
  if (!supabase) return;
  await setUserContext(userId);
  await supabase
    .from('withdrawal_profiles')
    .upsert({ user_id: userId, quit_date: quitDate }, { onConflict: 'user_id' });
}

export async function saveSymptomLog(
  userId: number,
  severity: number,
  physicalSymptoms: string[],
  mentalSymptoms: string[],
  sleepSymptoms: string[],
  copingMethods: string[]
) {
  if (!supabase) return;
  await setUserContext(userId);
  await supabase.from('withdrawal_logs').insert({
    user_id: userId,
    severity,
    physical_symptoms: physicalSymptoms,
    mental_symptoms: mentalSymptoms,
    sleep_symptoms: sleepSymptoms,
    coping_methods: copingMethods,
  });
}

export async function fetchCravingInsight(userId: number): Promise<string | null> {
  if (!supabase) return null;
  try {
    await setUserContext(userId);
    const { data } = await supabase
      .from('craving_logs')
      .select('intensity, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (!data || data.length < 2) return null;
    const first = data[0].intensity;
    const last = data[data.length - 1].intensity;
    if (first <= 0) return null;
    const drop = Math.round(((first - last) / first) * 100);
    if (drop > 0) return `Your craving intensity has dropped ${drop}% since day 1`;
    return null;
  } catch {
    return null;
  }
}

export async function fetchSleepInsight(userId: number): Promise<string | null> {
  if (!supabase) return null;
  try {
    await setUserContext(userId);
    const { data } = await supabase
      .from('sleep_logs')
      .select('quality, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (!data || data.length < 2) return null;
    const first = data[0].quality;
    const last = data[data.length - 1].quality;
    if (first <= 0) return null;
    const improvement = Math.round(((last - first) / first) * 100);
    if (improvement > 0) return `Sleep has improved ${improvement}% since nicotine cleared (day 3)`;
    return null;
  } catch {
    return null;
  }
}
