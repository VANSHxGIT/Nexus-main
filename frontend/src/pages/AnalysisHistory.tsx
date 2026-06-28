import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const AnalysisHistory = () => {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        
        <motion.div variants={itemVariants} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)' }}>Analysis History</h2>
            <p style={{ margin: 0 }}>Cryptographic ledger of all previous cognitive profile scans.</p>
          </div>
          <div className="form-group" style={{ margin: 0, minWidth: '250px' }}>
             <Search size={16} className="input-icon" style={{ top: '0.85rem' }} />
             <input type="text" className="form-input" placeholder="Search by trace ID or role..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>TRACE ID</th>
                <th>DATE</th>
                <th>TARGET ROLE</th>
                <th>MATCH CONFIDENCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-tertiary)' }}>0x7f8a9...b4c2</td>
                <td>Today</td>
                <td>Backend AI Engineer</td>
                <td>94%</td>
                <td><span className="badge success">VALIDATED</span></td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-tertiary)' }}>0x3e1f2...d9a1</td>
                <td>Oct 12, 2025</td>
                <td>Fullstack Engineer</td>
                <td>78%</td>
                <td><span className="badge warning">GAP DETECTED</span></td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-tertiary)' }}>0x9a4c1...e7f5</td>
                <td>Jul 04, 2025</td>
                <td>Frontend Architect</td>
                <td>82%</td>
                <td><span className="badge success">VALIDATED</span></td>
              </tr>
            </tbody>
          </table>
        </motion.div>
        
      </motion.div>
    </div>
  );
};
