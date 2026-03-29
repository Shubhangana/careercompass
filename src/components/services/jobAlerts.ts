
import { searchAdzunaJobs } from './adzuna';
import { createNotification } from './notifications';
import { supabase } from '../supabase';

export const checkNewJobs = async (role: string, lastChecked: string) => {
  const jobs = await searchAdzunaJobs(role);
  
  // Filter jobs newer than lastChecked
  // Adzuna doesn't always provide precise timestamps in the search result that we can easily compare
  // but we can try to find matches that are high quality and notify
  
  const highMatches = jobs.slice(0, 3); // Just take top 3 for alert demo
  
  for (const job of highMatches) {
    await createNotification({
      title: 'New Job Alert!',
      message: `New ${job.title} position at ${job.company.display_name} matches your profile.`,
      type: 'job_match',
      metadata: { job_link: job.redirect_url, job_title: job.title }
    });
  }
};

export const startJobAlertPolling = (role: string) => {
  // Poll every 5 minutes
  const interval = setInterval(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await checkNewJobs(role, new Date().toISOString());
    }
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
};
