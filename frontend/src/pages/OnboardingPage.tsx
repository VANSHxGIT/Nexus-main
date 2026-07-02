import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Briefcase, ArrowRight, CheckCircle, AlertCircle, MessageSquare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProctoringView } from '../components/ProctoringView';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [validationScore, setValidationScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thoughtLog, setThoughtLog] = useState<{step: string, agent: string, status: string}[]>([]);
  const [cameraCovered, setCameraCovered] = useState(false);
  const [showPicErrorModal, setShowPicErrorModal] = useState(false);

  const fetchQuestions = useCallback(async (mId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/interview/${mId}/generate`, { method: 'POST' });
      const data = await res.json();
      setQuestions(data.questions);
    } catch {
      setError("Failed to generate interview questions.");
    }
  }, []);

  // Poll for match status
  useEffect(() => {
    if (!userId || matchId) return;

    let isFetching = false;
    const interval = setInterval(async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const res = await fetch(`${API_BASE}/api/user/${userId}/status`);
        const data = await res.json();
        if (data.status === 'pending_validation' && data.match_id) {
          if (!data.profile_pic_url) {
            setShowPicErrorModal(true);
            clearInterval(interval);
            return;
          }
          setMatchId(data.match_id);
          clearInterval(interval);
          fetchQuestions(data.match_id);
        }
      } catch {
        // Ignore errors during polling
      } finally {
        isFetching = false;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userId, matchId, fetchQuestions]);

  
  useEffect(() => {
    if (!userId || matchId) return;
    const es = new EventSource(`${API_BASE}/api/stream/${userId}`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.step === 'complete') {
        es.close();
        return;
      }
      setThoughtLog(prev => {
        
        if (prev.some(log => log.status === data.status && log.agent === data.agent)) return prev;
        return [...prev, data];
      });
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [userId, matchId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    let resumeText = undefined;
    if (resumeFile) {
        setIsParsingResume(true);
        const formData = new FormData();
        formData.append('file', resumeFile);
        try {
            const parseRes = await fetch(`${API_BASE}/api/parse_resume`, {
                method: 'POST',
                body: formData
            });
            if (parseRes.ok) {
                const parseData = await parseRes.json();
                resumeText = parseData.resume_text;
            } else {
                console.warn("Failed to parse resume");
            }
        } catch (err) {
            console.warn("Error parsing resume", err);
        }
        setIsParsingResume(false);
    }

    const githubUsername = githubUrl.split('/').pop() || githubUrl;

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            github_username: githubUsername, 
            linkedin_url: linkedinUrl,
            resume_text: resumeText
        }),
      });

      if (!res.ok) throw new Error('Failed to register.');
      const data = await res.json();
      setUserId(data.user_id);
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!matchId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/interview/${matchId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setValidationScore(data.validation_score);
      
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch {
      setError("Failed to submit answers.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Nexus</h1>
        <p style={{ margin: 0 }}>Autonomous Team Assembly Infrastructure</p>
      </div>

      <motion.div className="surface-card" layout transition={{ duration: 0.3, ease: 'easeInOut' }}>
        {!userId ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="github">GitHub Profile</label>
              <input
                id="github"
                type="text"
                className="form-input"
                placeholder="Username or URL"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
              />
              <Code size={18} className="input-icon" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="linkedin">LinkedIn Profile URL</label>
              <input
                id="linkedin"
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                required
              />
              <Briefcase size={18} className="input-icon" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="resume">Resume (Optional PDF/TXT)</label>
              <input
                id="resume"
                type="file"
                accept=".pdf,.txt"
                className="form-input"
                style={{ paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              <FileText size={18} className="input-icon" />
            </div>

            <button type="submit" className="nexus-button" disabled={isLoading || !githubUrl || !linkedinUrl} style={{ width: '100%', marginTop: '1rem' }}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                  <div className="skeleton" style={{width: '16px', height: '16px', borderRadius: '50%'}} /> 
                  {isParsingResume ? "Parsing Resume..." : "Initiating SYNAPSE..."}
                </span>
              ) : (
                <>Initialize Assembly <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        ) : !matchId ? (
          <motion.div className="thought-log" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="thought-log-header">
              <span className="thought-log-dot red"></span>
              <span className="thought-log-dot yellow"></span>
              <span className="thought-log-dot green"></span>
              <span className="thought-log-title">Agent Trace</span>
            </div>
            <div className="thought-log-body">
              <AnimatePresence initial={false}>
                {thoughtLog.length === 0 ? (
                  <motion.div key="init" layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="thought-step active">
                    <span className="step-indicator"></span>
                    <span>Initializing cognitive pipeline...</span>
                    <span className="blink-cursor">_</span>
                  </motion.div>
                ) : (
                  thoughtLog.map((log, i) => (
                    <motion.div key={i} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`thought-step ${i === thoughtLog.length - 1 ? 'active' : 'done'}`}>
                      <span className="step-indicator"></span>
                      <span className="step-agent">[{log.agent}]</span>
                      <span>{log.status}</span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: '5%' }}
                animate={{ width: thoughtLog.length === 0 ? '5%' : `${Math.min(95, thoughtLog.length * 15)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ) : validationScore === null ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{
            backgroundColor: cameraCovered ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
            padding: cameraCovered ? '1.5rem' : '0',
            borderRadius: 'var(--radius-lg)',
            border: cameraCovered ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
            transition: 'all 0.3s ease',
            margin: cameraCovered ? '-1.5rem' : '0'
          }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: cameraCovered ? 'var(--status-error)' : 'var(--text-primary)' }}>
              <MessageSquare size={18} color={cameraCovered ? 'var(--status-error)' : 'var(--accent-primary)'} /> Targeted Validation
            </h3>
            
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
              <ProctoringView matchId={matchId} onWarningChange={setCameraCovered} />
            </div>

            {questions.length === 0 ? (
              <div style={{ padding: '1rem 0' }}>
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {questions.map((q, idx) => (
                  <div key={idx}>
                    <p style={{ fontSize: '13px', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{q}</p>
                    <textarea
                      className="form-input"
                      style={{ 
                        paddingLeft: '1rem', 
                        minHeight: '80px', 
                        resize: 'vertical',
                        backgroundColor: cameraCovered ? '#d1d5db' : undefined,
                        cursor: cameraCovered ? 'not-allowed' : 'text'
                      }}
                      value={answers[idx]}
                      onChange={(e) => {
                         const newAns = [...answers];
                         newAns[idx] = e.target.value;
                         setAnswers(newAns);
                      }}
                      placeholder={cameraCovered ? "Camera covered. Action disabled." : "Your response..."}
                      disabled={cameraCovered}
                    />
                  </div>
                ))}
                <button onClick={handleAnswerSubmit} className="nexus-button" disabled={isLoading || cameraCovered} style={{ width: '100%' }}>
                  {isLoading ? (
                     <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                       <div className="skeleton" style={{width: '16px', height: '16px', borderRadius: '50%'}} /> 
                       Evaluating...
                     </span>
                  ) : "Submit Validation"}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={40} color="var(--status-success)" style={{ marginBottom: '1rem' }} />
            <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Validation Complete</strong>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your technical profile has been verified with a confidence score of {(validationScore * 100).toFixed(0)}%.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Routing to dashboard...</p>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', color: 'var(--status-error)' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '13px' }}>Connection Error</strong><br/>
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {showPicErrorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="surface-card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '2.5rem' }}>
            <AlertCircle size={48} color="var(--status-error)" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Profile Picture Required</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '14px', lineHeight: '1.5' }}>
              We could not validate your identity. Please ensure your LinkedIn profile has a public profile picture, then apply again.
            </p>
            <button 
              className="nexus-button" 
              style={{ width: '100%' }}
              onClick={() => { setShowPicErrorModal(false); navigate('/'); }}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
