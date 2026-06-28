import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Briefcase, ArrowRight, CheckCircle, AlertCircle, MessageSquare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OnboardingPage = () => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
          setMatchId(data.match_id);
          clearInterval(interval);
          fetchQuestions(data.match_id);
        }
      } catch (e) {} finally {
        isFetching = false;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userId, matchId]);

  
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

  const fetchQuestions = async (mId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/interview/${mId}/generate`, { method: 'POST' });
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err: any) {
      setError("Failed to generate interview questions.");
    }
  };

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

    } catch (e) {
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <MessageSquare size={18} color="var(--accent-primary)" /> Targeted Validation
            </h3>
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
                      style={{ paddingLeft: '1rem', minHeight: '80px', resize: 'vertical' }}
                      value={answers[idx]}
                      onChange={(e) => {
                         const newAns = [...answers];
                         newAns[idx] = e.target.value;
                         setAnswers(newAns);
                      }}
                      placeholder="Your response..."
                    />
                  </div>
                ))}
                <button onClick={handleAnswerSubmit} className="nexus-button" disabled={isLoading} style={{ width: '100%' }}>
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
    </div>
  );
}
