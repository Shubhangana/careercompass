
export type UserRole = 'candidate' | 'company';

export type Profile = {
  id: string;
  user_id: string;
  role: UserRole;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  // Candidate fields
  resume_text?: string;
  skills?: string[];
  experience_years?: number;
  bio?: string;
  // Company fields
  company_name?: string;
  company_website?: string;
  company_description?: string;
  company_logo_url?: string;
  website?: string; // Alias for company_website if needed
  description?: string; // Alias for company_description if needed
  logo_url?: string; // Alias for company_logo_url if needed
  created_at: string;
  updated_at: string;
};

export type JobPosting = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string;
  salary_range?: string;
  job_type: string; // Full-time, Remote, etc.
  requirements?: string[];
  created_at: string;
  updated_at: string;
};

export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Assignment' | 'Offer' | 'Rejected';

export type Application = {
  id: string;
  user_id: string; // Candidate ID
  job_id?: string;
  status: ApplicationStatus;
  resume_snapshot?: string; // Resume at the time of application
  created_at: string;
  updated_at: string;
  // Joined fields
  job_title?: string;
  company_name?: string;
  candidate_name?: string;
  // Manual tracking fields
  company?: string;
  role?: string;
};
