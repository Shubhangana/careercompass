
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Briefcase, 
  Users, 
  FileText, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  User,
  Building2,
  Calendar,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { JobPosting, Application, Profile, ApplicationStatus } from '../types';
import { createJobPosting, getCompanyJobPostings, getJobApplications, updateApplicationStatus } from '../services/jobPostings';
import { getAllCandidates } from '../services/profiles';
import { matchCandidatesToJob, CandidateMatch } from '../services/ai';
import { toast } from 'sonner';

export const CompanyDashboard: React.FC<{ profile: Profile; onLogout: () => void }> = ({ profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'profile'>('jobs');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'Full-time',
    salary_range: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  const fetchJobs = async () => {
    const data = await getCompanyJobPostings();
    setJobs(data);
  };

  const fetchCandidates = async () => {
    const data = await getAllCandidates();
    setCandidates(data);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const job = await createJobPosting(newJob);
    if (job) {
      toast.success('Job posted successfully!');
      setIsPostingJob(false);
      setNewJob({ title: '', description: '', location: '', job_type: 'Full-time', salary_range: '' });
      fetchJobs();
    }
  };

  const handleSelectJob = async (job: JobPosting) => {
    setSelectedJob(job);
    const apps = await getJobApplications(job.id);
    setApplications(apps);
    
    // Auto-match candidates for this job
    setIsMatching(true);
    try {
      const matchResults = await matchCandidatesToJob(job.description, candidates);
      setMatches(matchResults);
    } catch (error) {
      console.error('Matching failed:', error);
    } finally {
      setIsMatching(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: ApplicationStatus) => {
    const success = await updateApplicationStatus(appId, status);
    if (success) {
      toast.success(`Status updated to ${status}`);
      if (selectedJob) {
        const apps = await getJobApplications(selectedJob.id);
        setApplications(apps);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              J
            </div>
            <span className="text-xl font-bold text-slate-900">JobAI Pro</span>
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'jobs' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Briefcase className="w-5 h-5" />
              Job Postings
            </button>
            <button 
              onClick={() => setActiveTab('candidates')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'candidates' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Users className="w-5 h-5" />
              Candidate Pool
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Building2 className="w-5 h-5" />
              Company Profile
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                {profile.company_name?.[0] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{profile.company_name || 'Company'}</p>
                <p className="text-xs text-slate-500 truncate">{profile.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'jobs' && (
            <motion.div 
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
                  <p className="text-slate-500">Manage your open positions and track applicants.</p>
                </div>
                <button 
                  onClick={() => setIsPostingJob(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Post New Job
                </button>
              </div>

              {isPostingJob && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Create Job Advertisement</h2>
                  <form onSubmit={handlePostJob} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newJob.title}
                        onChange={e => setNewJob({...newJob, title: e.target.value})}
                        placeholder="e.g. Senior Frontend Engineer"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description & Requirements</label>
                      <textarea 
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newJob.description}
                        onChange={e => setNewJob({...newJob, description: e.target.value})}
                        placeholder="Describe the role, responsibilities, and requirements..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newJob.location}
                        onChange={e => setNewJob({...newJob, location: e.target.value})}
                        placeholder="e.g. Remote, New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newJob.salary_range}
                        onChange={e => setNewJob({...newJob, salary_range: e.target.value})}
                        placeholder="e.g. $120k - $150k"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end gap-3 mt-2">
                      <button 
                        type="button"
                        onClick={() => setIsPostingJob(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700"
                      >
                        Post Job
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map(job => (
                  <div 
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    className={`bg-white border p-6 rounded-2xl cursor-pointer transition-all hover:shadow-md ${selectedJob?.id === job.id ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{job.title}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                        {job.job_type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{job.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{job.location}</span>
                      <span className="text-indigo-600 font-medium flex items-center gap-1">
                        View Applicants
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedJob && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Applicants for {selectedJob.title}</h2>
                    <div className="flex gap-2">
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                        {applications.length} Applied
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* AI Matching Section */}
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Search className="w-5 h-5 text-indigo-300" />
                        <h3 className="font-bold">AI Candidate Matching</h3>
                        {isMatching && <Clock className="w-4 h-4 animate-spin" />}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {matches.slice(0, 3).map(match => (
                          <div key={match.candidateId} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold truncate">{match.candidateName}</p>
                              <span className="text-indigo-300 font-bold">{match.matchPercentage}%</span>
                            </div>
                            <p className="text-xs text-indigo-100 line-clamp-2 mb-3">{match.matchReason}</p>
                            <div className="flex flex-wrap gap-1">
                              {match.skillsMatch.slice(0, 2).map(s => (
                                <span key={s} className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Applications List */}
                    {applications.map(app => (
                      <div key={app.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{app.candidate_name}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Applied {new Date(app.created_at).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                                app.status === 'Interviewing' ? 'bg-purple-100 text-purple-700' :
                                app.status === 'Assignment' ? 'bg-orange-100 text-orange-700' :
                                app.status === 'Offer' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'Interviewing')}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Schedule Interview"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'Assignment')}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Send Assignment"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'Offer')}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Make Offer"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <div className="w-px h-8 bg-slate-100 mx-2" />
                          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                            View Resume
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'candidates' && (
            <motion.div 
              key="candidates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Candidate Pool</h1>
              <p className="text-slate-500 mb-8">Browse all candidates in our network.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map(candidate => (
                  <div key={candidate.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {candidate.full_name?.[0] || candidate.email?.[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{candidate.full_name || 'Candidate'}</h3>
                        <p className="text-xs text-slate-500">{candidate.experience_years || 0} Years Experience</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">{candidate.bio || 'No bio provided.'}</p>
                    <div className="flex flex-wrap gap-1 mb-6">
                      {candidate.skills?.slice(0, 4).map(skill => (
                        <span key={skill} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <button className="w-full py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      View Full Profile
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h1 className="text-2xl font-bold text-slate-900 mb-8">Company Profile</h1>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profile.company_name || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profile.company_website || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profile.company_description || ''}
                      readOnly
                    />
                  </div>
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
