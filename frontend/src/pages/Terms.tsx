
import '../index.css';

export const Terms = () => {
  return (
    <div className="nexus-container legal-page">
      <div className="nexus-card" style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'left' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Terms & Conditions</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last Updated: June 2026</p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          By initiating the SYNAPSE protocol, you agree to these Terms. Nexus Network provides an automated, cognitive matchmaking infrastructure. 
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Automated Provisioning</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Nexus operates autonomously. Upon successful technical validation, you will be instantly provisioned access to external third-party services (e.g., GitHub Repositories, Discord servers). We do not guarantee continuous uptime of these third-party services.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Cryptographic Non-Repudiation</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          All matching decisions and profile sanitizations are logged permanently via SHA-256 transaction hashes. This ensures algorithmic transparency. You acknowledge that validation decisions made by the CORTEX and VALIDATOR nodes are final.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. DPDP Act Compliance</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your usage of this platform is subject to the rights granted to you under the Digital Personal Data Protection Act, 2023. Please refer to our Privacy Policy for details on exercising your rights as a Data Principal.
        </p>
      </div>
    </div>
  );
};
