import { motion, type Variants } from 'framer-motion';
import { ShieldCheck, Activity, Terminal, CheckCircle2, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const Dashboard = () => {
  const handleExport = () => {
    const reportData = {
      title: "Nexus Cryptographic Footprint Report",
      globalMatchScore: 94,
      status: "Validated",
      actionableIntelligence: [
        "Review Architectural Blindspots: SYNAPSE detected a potential gap in distributed caching strategies based on your repository history.",
        "Connect Communication Channels: Join the dedicated Discord matrix for your assigned pod."
      ],
      recentActivity: [
        { timestamp: "Just now", agent: "VALIDATOR", operation: "Cryptographic answer evaluation", status: "COMPLETED" },
        { timestamp: "2 minutes ago", agent: "SYNAPSE", operation: "Cognitive profile sanitization protocol", status: "COMPLETED" },
        { timestamp: "5 minutes ago", agent: "GATEWAY", operation: "Footprint extraction (GitHub, LinkedIn)", status: "COMPLETED" }
      ],
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-report-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-container-max mx-auto px-gutter py-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-2">Command Center</h2>
            <p className="font-body-md text-text-secondary">Your cryptographic footprint has been validated and ingested.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="bg-primary text-on-primary hover:bg-primary-fixed-variant px-4 py-2 rounded-lg font-label-md transition-all duration-200 shadow-sm"
            >
              Export Report
            </button>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Score Card */}
          <motion.div 
            className="md:col-span-4 bg-surface-base border border-border-low-contrast rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-outline-variant"
            variants={itemVariants}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-2.5 bg-surface-subtle rounded-xl border border-border-low-contrast text-status-success shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <span className="bg-status-success/10 text-status-success border border-status-success/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
                Validated
              </span>
            </div>
            <div className="relative z-10">
              <div className="font-headline-xl text-[4rem] font-bold text-text-primary tracking-tight leading-none mb-2 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-[#8b5cf6] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                94<span className="text-3xl text-text-tertiary">%</span>
              </div>
              <p className="font-label-md text-text-secondary uppercase tracking-widest text-xs">Global Match Score</p>
            </div>
          </motion.div>

          {/* Actionable Intelligence */}
          <motion.div 
            className="md:col-span-8 bg-surface-base border border-border-low-contrast rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-outline-variant"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-sm text-text-primary flex items-center gap-2">
                <Activity size={20} className="text-primary" /> Actionable Intelligence
              </h3>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="group flex gap-4 p-4 rounded-xl border border-border-low-contrast bg-surface-subtle hover:bg-surface-base hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="mt-1 text-status-success">
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-label-md text-text-primary mb-1 group-hover:text-primary transition-colors">Review Architectural Blindspots</h4>
                  <p className="font-body-sm text-text-secondary">SYNAPSE detected a potential gap in distributed caching strategies based on your repository history.</p>
                </div>
                <div className="flex items-center text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="group flex gap-4 p-4 rounded-xl border border-border-low-contrast bg-surface-subtle hover:bg-surface-base hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-text-tertiary group-hover:border-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="font-label-md text-text-primary mb-1 group-hover:text-primary transition-colors">Connect Communication Channels</h4>
                  <p className="font-body-sm text-text-secondary">Join the dedicated Discord matrix for your assigned pod.</p>
                </div>
                <div className="flex items-center text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Agent Activity */}
          <motion.div 
            className="md:col-span-12 bg-surface-base border border-border-low-contrast rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-outline-variant"
            variants={itemVariants}
          >
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-headline-sm text-text-primary flex items-center gap-2">
                  <Terminal size={20} className="text-text-secondary" /> Recent Agent Activity
               </h3>
               <Link to="/analysis-history" className="text-sm font-label-md text-primary hover:text-primary-fixed-variant flex items-center gap-1 transition-colors group">
                 View Full Trace <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
               </Link>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-border-low-contrast text-text-tertiary font-label-sm uppercase tracking-wider">
                     <th className="py-4 px-2 font-medium">Timestamp</th>
                     <th className="py-4 px-2 font-medium">Agent Identifier</th>
                     <th className="py-4 px-2 font-medium">Operation</th>
                     <th className="py-4 px-2 font-medium text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="font-body-sm text-text-secondary">
                   <tr className="border-b border-border-low-contrast/50 hover:bg-surface-subtle transition-colors group">
                     <td className="py-4 px-2">Just now</td>
                     <td className="py-4 px-2"><span className="font-label-md text-primary bg-primary/5 px-2 py-1 rounded">VALIDATOR</span></td>
                     <td className="py-4 px-2 text-text-primary group-hover:text-primary transition-colors">Cryptographic answer evaluation</td>
                     <td className="py-4 px-2 text-right">
                       <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-status-success bg-status-success/10 px-2.5 py-1 rounded-full border border-status-success/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></div> Completed
                       </span>
                     </td>
                   </tr>
                   <tr className="border-b border-border-low-contrast/50 hover:bg-surface-subtle transition-colors group">
                     <td className="py-4 px-2">2 minutes ago</td>
                     <td className="py-4 px-2"><span className="font-label-md text-[#8b5cf6] bg-[#8b5cf6]/5 px-2 py-1 rounded">SYNAPSE</span></td>
                     <td className="py-4 px-2 text-text-primary group-hover:text-primary transition-colors">Cognitive profile sanitization protocol</td>
                     <td className="py-4 px-2 text-right">
                       <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-status-success bg-status-success/10 px-2.5 py-1 rounded-full border border-status-success/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-status-success"></div> Completed
                       </span>
                     </td>
                   </tr>
                   <tr className="hover:bg-surface-subtle transition-colors group">
                     <td className="py-4 px-2">5 minutes ago</td>
                     <td className="py-4 px-2"><span className="font-label-md text-status-warning bg-status-warning/10 px-2 py-1 rounded">GATEWAY</span></td>
                     <td className="py-4 px-2 text-text-primary group-hover:text-primary transition-colors">Footprint extraction (GitHub, LinkedIn)</td>
                     <td className="py-4 px-2 text-right">
                       <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-status-success bg-status-success/10 px-2.5 py-1 rounded-full border border-status-success/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-status-success"></div> Completed
                       </span>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </motion.div>
          
        </div>
      </motion.div>
    </div>
  );
};
