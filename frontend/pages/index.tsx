import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 24px #0002', textAlign: 'center', minWidth: 320 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, color: '#333', letterSpacing: '-1px' }}>Real-Time Voting App</h1>
        <p style={{ color: '#666', marginBottom: 32, fontSize: '1.1rem' }}>Create a poll and watch results update live!</p>
        <Link href="/create">
          <button style={{ padding: '14px 40px', fontSize: '1.1rem', borderRadius: 8, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px #764ba244', transition: 'transform 0.1s', outline: 'none' }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
} 