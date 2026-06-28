import { motion } from 'framer-motion';
import { Settings2, Link2, Shield } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const Settings = () => {
  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        
        <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Preferences</h2>
          <p>Manage your account settings, integrations, and telemetry options.</p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.div variants={itemVariants} className="surface-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings2 size={20} color="var(--text-tertiary)" /> Profile Configuration
            </h3>
            <div className="form-group">
              <label className="form-label">Primary Target Role</label>
              <input type="text" className="form-input" defaultValue="Backend AI Engineer" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Secondary Roles</label>
              <input type="text" className="form-input" defaultValue="Machine Learning Engineer, Systems Architect" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="surface-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Link2 size={20} color="var(--text-tertiary)" /> External Integrations
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '14px' }}>GitHub</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>Connected as @EobardThawne2</p>
              </div>
              <button className="nexus-button secondary" style={{ fontSize: '12px', padding: '0.4rem 0.8rem' }}>Manage</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '14px' }}>LinkedIn</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>Connected as /in/sumeer-khattar</p>
              </div>
              <button className="nexus-button secondary" style={{ fontSize: '12px', padding: '0.4rem 0.8rem' }}>Manage</button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="surface-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Shield size={20} color="var(--text-tertiary)" /> Privacy & Security
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Cryptographic Telemetry</h4>
                <p style={{ fontSize: '13px', margin: 0, maxWidth: '400px' }}>Allow anonymized cognitive metrics to be sent to Nexus Core for model alignment.</p>
              </div>
              <div style={{ width: '40px', height: '22px', background: 'var(--accent-primary)', borderRadius: '11px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} />
              </div>
            </div>
          </motion.div>

        </div>
        
      </motion.div>
    </div>
  );
};
