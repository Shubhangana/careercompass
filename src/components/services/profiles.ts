
import { supabase } from '../supabase';
import { Profile, UserRole } from '../types';

export const getProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
};

export const updateProfile = async (profileUpdate: Partial<Profile>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profileUpdate, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data as Profile;
};

export const createProfile = async (role: UserRole, details: Partial<Profile> = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      user_id: user.id,
      role,
      email: user.email,
      ...details,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data as Profile;
};

export const getAllCandidates = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'candidate');

  if (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }

  return data as Profile[];
};
