
import { supabase } from '../supabase';
import { JobPosting, Application, ApplicationStatus } from '../types';

export const createJobPosting = async (job: Omit<JobPosting, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('job_postings')
    .insert([{
      ...job,
      company_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating job posting:', error);
    return null;
  }

  return data as JobPosting;
};

export const getCompanyJobPostings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company job postings:', error);
    return [];
  }

  return data as JobPosting[];
};

export const getAllJobPostings = async () => {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all job postings:', error);
    return [];
  }

  return data as JobPosting[];
};

export const getJobApplications = async (jobId: string) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*, profiles!user_id(*)')
    .eq('job_id', jobId);

  if (error) {
    console.error('Error fetching job applications:', error);
    return [];
  }

  return data.map(app => ({
    ...app,
    candidate_name: app.profiles?.full_name || app.profiles?.email
  })) as Application[];
};

export const applyToJob = async (jobId: string, resumeSnapshot: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('applications')
    .insert([{
      user_id: user.id,
      job_id: jobId,
      status: 'Applied',
      resume_snapshot: resumeSnapshot,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error applying to job:', error);
    return null;
  }

  return data as Application;
};

export const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) {
    console.error('Error updating application status:', error);
    return false;
  }

  return true;
};
