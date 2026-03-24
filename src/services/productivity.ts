import { supabase } from './api/supabase';

export interface ProductivityLog {
  id?: string;
  user_id: string;
  company_id: string;
  log_day: string; // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  focus_secs: number;
  strategic_secs: number;
  pauses_count: number;
  cycles_count: number;
}

export const syncProductivityLog = async (log: ProductivityLog) => {
  const { data, error } = await supabase
    .from('me_productivity_logs')
    .upsert({
      user_id: log.user_id,
      company_id: log.company_id,
      log_day: log.log_day,
      start_time: log.start_time,
      end_time: log.end_time,
      focus_secs: log.focus_secs,
      strategic_secs: log.strategic_secs,
      pauses_count: log.pauses_count,
      cycles_count: log.cycles_count,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, company_id, log_day' });

  if (error) {
    console.error('Error syncing productivity log:', error);
    return null;
  }
  return data;
};

export const getTeamProductivity = async (companyId: string) => {
  const { data, error } = await supabase
    .from('me_productivity_logs')
    .select(`
      *,
      profiles:user_id ( full_name, avatar_url ),
      members:company_members!inner ( role, me_level )
    `)
    .eq('company_id', companyId)
    .eq('log_day', new Date().toISOString().split('T')[0]);

  if (error) {
    console.error('Error fetching team productivity:', error);
    return [];
  }
  return data;
};
