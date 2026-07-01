import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Users, ShieldCheck, UserCircle, ExternalLink, X, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Candidate {
  user_id: string;
  github_username: string;
  linkedin_url: string;
  skills: string[];
  confidence_score: number;
  status: string;
  created_at: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const HRDashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Candidate; direction: 'asc' | 'desc' } | null>(null);
  const [selectedQa, setSelectedQa] = useState<{questions: string[], answers: string[]} | null>(null);
  const [isQaModalOpen, setIsQaModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/candidates`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setCandidates(data);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleViewQa = async (userId: string) => {
    setIsQaModalOpen(true);
    setSelectedUserId(userId);
    setQaLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/candidates/${userId}/qa`);
      if (res.ok) {
        const data = await res.json();
        setSelectedQa(data);
      }
    } catch (error) {
      console.error("Failed to fetch QA:", error);
    } finally {
      setQaLoading(false);
    }
  };

  const handleAddCustomQuestion = async () => {
    if (!newQuestion.trim() || !selectedUserId) return;
    setIsAddingQuestion(true);
    try {
      const res = await fetch(`${API_BASE}/api/candidates/${selectedUserId}/custom_questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: [newQuestion.trim()] })
      });
      if (res.ok) {
        setNewQuestion('');
        alert("Custom question added successfully! It will be asked during the candidate's interview.");
      } else {
        alert('Failed to add custom question.');
      }
    } catch (error) {
      console.error("Failed to add custom question:", error);
      alert('Error adding custom question.');
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/candidates/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setCandidates(candidates.map(c => 
          c.user_id === userId ? { ...c, status: newStatus } : c
        ));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSort = (key: keyof Candidate) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.github_username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    if (a[key] < b[key]) {
      return direction === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="w-full max-w-container-max mx-auto px-gutter py-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-2">Recruitment Dashboard</h2>
            <p className="font-body-md text-text-secondary">Overview of all candidates and their validation scores.</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-3 items-center bg-surface-subtle border border-border-low-contrast rounded-lg px-3 py-2 shadow-sm">
              <Search size={18} className="text-text-tertiary" />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none font-body-sm text-text-primary placeholder:text-text-tertiary"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`flex gap-2 items-center border rounded-lg px-3 py-2 shadow-sm transition-colors text-sm font-medium ${
                showFilters || statusFilter !== 'all' 
                ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20' 
                : 'bg-surface-subtle border-border-low-contrast text-text-primary hover:bg-surface-base'
              }`}
            >
              <Filter size={18} /> Filters
            </button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-6 bg-surface-base border border-border-low-contrast p-5 rounded-xl shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-subtle border border-border-low-contrast rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors cursor-pointer min-w-[150px]"
              >
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="pending_validation">Pending Validation</option>
                <option value="validated">Validated</option>
                <option value="mutual_accepted">Mutual Accepted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Sort By Confidence</label>
              <select 
                value={sortConfig?.key === 'confidence_score' ? sortConfig.direction : 'none'}
                onChange={(e) => {
                  if (e.target.value === 'none') {
                    setSortConfig(null);
                  } else {
                    setSortConfig({ key: 'confidence_score', direction: e.target.value as 'asc' | 'desc' });
                  }
                }}
                className="bg-surface-subtle border border-border-low-contrast rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors cursor-pointer min-w-[150px]"
              >
                <option value="none">None (Default)</option>
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Total Candidates Stats */}
          <motion.div 
            className="md:col-span-3 bg-surface-base border border-border-low-contrast rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-outline-variant"
            variants={itemVariants}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-2.5 bg-surface-subtle rounded-xl border border-border-low-contrast text-primary shadow-sm">
                <Users size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-headline-xl text-[4rem] font-bold text-text-primary tracking-tight leading-none mb-2">
                {candidates.length}
              </div>
              <p className="font-label-md text-text-secondary uppercase tracking-widest text-xs">Total</p>
            </div>
          </motion.div>

          {/* Approved Candidates Stats */}
          <motion.div 
            className="md:col-span-3 bg-surface-base border border-border-low-contrast rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-status-success"
            variants={itemVariants}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-status-success/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-2.5 bg-status-success/10 rounded-xl border border-status-success/20 text-status-success shadow-sm">
                <CheckCircle size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-headline-xl text-[4rem] font-bold text-text-primary tracking-tight leading-none mb-2">
                {candidates.filter(c => ['approved', 'validated', 'mutual_accepted'].includes(c.status)).length}
              </div>
              <p className="font-label-md text-text-secondary uppercase tracking-widest text-xs">Approved</p>
            </div>
          </motion.div>

          {/* Pending Candidates Stats */}
          <motion.div 
            className="md:col-span-3 bg-surface-base border border-border-low-contrast rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-[#8b5cf6]"
            variants={itemVariants}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-2.5 bg-[#8b5cf6]/10 rounded-xl border border-[#8b5cf6]/20 text-[#8b5cf6] shadow-sm">
                <Clock size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-headline-xl text-[4rem] font-bold text-text-primary tracking-tight leading-none mb-2">
                {candidates.filter(c => ['processing', 'pending_validation'].includes(c.status)).length}
              </div>
              <p className="font-label-md text-text-secondary uppercase tracking-widest text-xs">Pending</p>
            </div>
          </motion.div>

          {/* Rejected Candidates Stats */}
          <motion.div 
            className="md:col-span-3 bg-surface-base border border-border-low-contrast rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-status-warning"
            variants={itemVariants}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-status-warning/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-2.5 bg-status-warning/10 rounded-xl border border-status-warning/20 text-status-warning shadow-sm">
                <XCircle size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-headline-xl text-[4rem] font-bold text-text-primary tracking-tight leading-none mb-2">
                {candidates.filter(c => c.status === 'rejected').length}
              </div>
              <p className="font-label-md text-text-secondary uppercase tracking-widest text-xs">Rejected</p>
            </div>
          </motion.div>
          

          
          {/* Candidates Table */}
          <motion.div 
            className="md:col-span-12 bg-surface-base border border-border-low-contrast rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-outline-variant"
            variants={itemVariants}
          >
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-border-low-contrast text-text-tertiary font-label-sm uppercase tracking-wider">
                     <th className="py-4 px-2 font-medium cursor-pointer hover:text-text-primary transition-colors" onClick={() => handleSort('github_username')}>
                       <div className="flex items-center gap-1">
                         Candidate {sortConfig?.key === 'github_username' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                       </div>
                     </th>
                     <th className="py-4 px-2 font-medium">Links</th>
                     <th className="py-4 px-2 font-medium">Skills</th>
                     <th className="py-4 px-2 font-medium cursor-pointer hover:text-text-primary transition-colors text-center" onClick={() => handleSort('created_at')}>
                        <div className="flex items-center justify-center gap-1">
                         Submitted {sortConfig?.key === 'created_at' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                     </th>
                     <th className="py-4 px-2 font-medium cursor-pointer hover:text-text-primary transition-colors text-center" onClick={() => handleSort('confidence_score')}>
                        <div className="flex items-center justify-center gap-1">
                         Confidence {sortConfig?.key === 'confidence_score' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                     </th>
                     <th className="py-4 px-2 font-medium text-center">Q&A</th>
                     <th className="py-4 px-2 font-medium text-right">Status</th>
                     <th className="py-4 px-2 font-medium text-center">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="font-body-sm text-text-secondary">
                   {isLoading ? (
                     <tr>
                       <td colSpan={8} className="py-8 text-center text-text-tertiary">
                         <div className="flex justify-center items-center gap-2">
                           <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                           Loading candidates...
                         </div>
                       </td>
                     </tr>
                   ) : sortedCandidates.length === 0 ? (
                     <tr>
                       <td colSpan={8} className="py-8 text-center text-text-tertiary">No candidates found.</td>
                     </tr>
                   ) : (
                     sortedCandidates.map((candidate) => (
                       <tr key={candidate.user_id} className="border-b border-border-low-contrast/50 hover:bg-surface-subtle transition-colors group">
                         <td className="py-4 px-2">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-surface-base border border-border-low-contrast flex items-center justify-center text-text-tertiary group-hover:text-primary transition-colors overflow-hidden shrink-0">
                                <img src={`https://github.com/${candidate.github_username}.png`} alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
                                <UserCircle size={20} className="hidden" style={{display: 'none'}} />
                             </div>
                             <span className="font-label-md text-text-primary group-hover:text-primary transition-colors">
                               {candidate.github_username}
                             </span>
                           </div>
                         </td>
                         <td className="py-4 px-2">
                           <div className="flex gap-2">
                              <a href={`https://github.com/${candidate.github_username}`} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary transition-colors" title="GitHub">
                                 <ExternalLink size={16} />
                              </a>
                              {candidate.linkedin_url && (
                                <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-[#0a66c2] transition-colors" title="LinkedIn">
                                   <ExternalLink size={16} />
                                </a>
                              )}
                           </div>
                         </td>
                         <td className="py-4 px-2">
                           <div className="flex flex-wrap gap-1">
                             {candidate.skills && candidate.skills.slice(0, 3).map((skill, i) => (
                               <span key={i} className="text-xs bg-surface-base border border-border-low-contrast px-2 py-0.5 rounded text-text-secondary">
                                 {skill}
                               </span>
                             ))}
                             {candidate.skills && candidate.skills.length > 3 && (
                               <span className="text-xs bg-surface-base border border-border-low-contrast px-2 py-0.5 rounded text-text-tertiary">
                                 +{candidate.skills.length - 3}
                               </span>
                             )}
                           </div>
                         </td>
                         <td className="py-4 px-2 text-center text-text-tertiary">
                            {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                         </td>
                         <td className="py-4 px-2 text-center">
                            <span className="font-headline-sm text-text-primary group-hover:text-primary transition-colors">
                               {(candidate.confidence_score * 100).toFixed(0)}%
                            </span>
                         </td>
                         <td className="py-4 px-2 text-center">
                            <button 
                              onClick={() => handleViewQa(candidate.user_id)}
                              className="px-3 py-1 bg-surface-subtle border border-border-low-contrast rounded hover:bg-surface-base text-sm font-medium transition-colors"
                            >
                              View Q&A
                            </button>
                         </td>
                         <td className="py-4 px-2 text-right">
                           {candidate.status === 'validated' || candidate.status === 'mutual_accepted' || candidate.status === 'approved' ? (
                             <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-status-success bg-status-success/10 px-2.5 py-1 rounded-full border border-status-success/20">
                               <ShieldCheck size={14} /> {candidate.status.replace('_', ' ')}
                             </span>
                           ) : candidate.status === 'processing' ? (
                             <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 rounded-full border border-[#8b5cf6]/20">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse"></div> Processing
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-status-warning bg-status-warning/10 px-2.5 py-1 rounded-full border border-status-warning/20">
                               <div className="w-1.5 h-1.5 rounded-full bg-status-warning"></div> {candidate.status.replace('_', ' ')}
                             </span>
                           )}
                         </td>
                         <td className="py-4 px-2 text-center">
                           <div className="flex gap-2 justify-center">
                             <button
                               onClick={() => handleStatusUpdate(candidate.user_id, 'approved')}
                               disabled={candidate.status === 'approved' || candidate.status === 'rejected' || candidate.status === 'mutual_accepted' || candidate.status === 'validated'}
                               className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                 candidate.status === 'approved' || candidate.status === 'rejected' || candidate.status === 'mutual_accepted' || candidate.status === 'validated'
                                 ? 'bg-surface-subtle text-text-tertiary cursor-not-allowed border border-border-low-contrast opacity-50' 
                                 : 'bg-status-success/10 text-status-success hover:bg-status-success/20 border border-status-success/20'
                               }`}
                             >
                               Approve
                             </button>
                             <button
                               onClick={() => handleStatusUpdate(candidate.user_id, 'rejected')}
                               disabled={candidate.status === 'approved' || candidate.status === 'rejected' || candidate.status === 'mutual_accepted' || candidate.status === 'validated'}
                               className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                 candidate.status === 'approved' || candidate.status === 'rejected' || candidate.status === 'mutual_accepted' || candidate.status === 'validated'
                                 ? 'bg-surface-subtle text-text-tertiary cursor-not-allowed border border-border-low-contrast opacity-50' 
                                 : 'bg-status-warning/10 text-status-warning hover:bg-status-warning/20 border border-status-warning/20'
                               }`}
                             >
                               Reject
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </motion.div>
          
        </div>
      </motion.div>

      {/* Q&A Modal */}
      {isQaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface-base border border-border-low-contrast rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-border-low-contrast flex justify-between items-center bg-surface-subtle">
              <h3 className="font-headline-sm text-text-primary">Candidate Q&A</h3>
              <button 
                onClick={() => { setIsQaModalOpen(false); setSelectedQa(null); setSelectedUserId(null); setNewQuestion(''); }}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {qaLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : selectedQa && selectedQa.questions && selectedQa.questions.length > 0 ? (
                <div className="space-y-6">
                  {selectedQa.questions.map((q, i) => (
                    <div key={i} className="space-y-2">
                      <p className="font-medium text-text-primary"><span className="text-primary mr-2">Q{i+1}:</span> {q}</p>
                      <p className="text-text-secondary bg-surface-subtle p-3 rounded-lg border border-border-low-contrast">
                        {selectedQa.answers && selectedQa.answers[i] ? selectedQa.answers[i] : 'No answer provided'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-tertiary">
                  No Q&A data available for this candidate.
                </div>
              )}
            </div>
            
            {/* Add Custom Question Section */}
            <div className="p-6 border-t border-border-low-contrast bg-surface-subtle flex flex-col gap-3">
              <h4 className="font-headline-sm text-text-primary text-sm">Add Custom Question</h4>
              <p className="text-xs text-text-tertiary mb-1">
                Add a specific question you want the AI to ask this candidate during their interview.
              </p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="e.g. Can you explain your experience with WebSockets?" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-1 bg-surface-base border border-border-low-contrast rounded-lg px-4 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors placeholder:text-text-tertiary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomQuestion();
                    }
                  }}
                />
                <button 
                  onClick={handleAddCustomQuestion}
                  disabled={!newQuestion.trim() || isAddingQuestion}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                    !newQuestion.trim() || isAddingQuestion
                    ? 'bg-surface-base text-text-tertiary cursor-not-allowed border border-border-low-contrast' 
                    : 'bg-primary text-white hover:bg-primary/90 border border-primary'
                  }`}
                >
                  {isAddingQuestion ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
