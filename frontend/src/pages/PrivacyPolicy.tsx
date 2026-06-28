
import '../index.css';

export const PrivacyPolicy = () => {
  return (
    <div className="nexus-container legal-page">
      <div className="nexus-card" style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'left' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last Updated: June 2026</p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Introduction</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Nexus Network ("Data Fiduciary") complies strictly with the Digital Personal Data Protection (DPDP) Act, 2023. We are committed to mathematically securing your data and ensuring transparent automated processing.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Data We Collect</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          We process only the personal data you explicitly submit or authorize us to access, strictly limited to:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Public GitHub profile metrics (Languages, top repositories, commits)</li>
          <li>LinkedIn URL representations (Titles, inferred industry keywords)</li>
        </ul>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Purpose of Processing</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your data is processed exclusively by our SYNAPSE and CORTEX agent nodes for the sole purpose of technical evaluation and team provisioning. It is not sold to third parties. Every evaluation is logged with a SHA-256 cryptographic trace for non-repudiation.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Your Rights as a Data Principal</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Under the DPDP Act 2023, you have the right to:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Access the summary of personal data being processed.</li>
          <li>Request erasure of your data from our cognitive indexes.</li>
          <li>Nominate a representative in the event of incapacity.</li>
        </ul>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. Grievance Redressal</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          For inquiries or erasure requests, contact our Data Protection Officer at privacy@nexus-network.xyz.
        </p>
      </div>
    </div>
  );
};
