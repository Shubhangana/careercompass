import { supabase } from '../supabase';
import { Application, ApplicationStatus } from '../types';

export type { Application, ApplicationStatus };

export const getApplications = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  return data as Application[];
};

export const createApplication = async (application: Partial<Application>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('applications')
    .insert([{
      ...application,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating application:', error);
    return null;
  }

  return data as Application;
};

export const updateApplicationStatus = async (id: string, status: ApplicationStatus) => {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating application status:', error);
  }
};

export const deleteApplication = async (id: string) => {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application:', error);
  }
};
