import { supabase } from '../supabase';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'job_match' | 'system' | 'course';
  read: boolean;
  created_at: string;
  metadata?: any;
};

export const getNotifications = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data as Notification[];
};

export const markAsRead = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read' | 'user_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .insert([{
      ...notification,
      user_id: user.id,
      read: false
    }]);

  if (error) {
    console.error('Error creating notification:', error);
  }
};

export const notifyJobMatches = async (jobs: any[]) => {
  const highMatches = jobs.filter(job => job.matchPercentage >= 85);
  
  for (const job of highMatches) {
    let message = `${job.title} at ${job.company} is a ${job.matchPercentage}% match for your profile.`;
    if (job.cultureFit >= 85) {
      message += ` Exceptional culture fit detected (${job.cultureFit}%).`;
    }
    
    await createNotification({
      title: 'New High-Match Job Found!',
      message,
      type: 'job_match',
      metadata: { job_link: job.link, job_title: job.title }
    });
  }
};
