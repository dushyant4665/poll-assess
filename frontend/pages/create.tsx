import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => (i === idx ? value : opt)));
  };
  const addOption = () => setOptions(opts => [...opts, '']);
  const removeOption = (idx: number) => setOptions(opts => opts.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/poll/${data.id}`);
      } else {
        setError(data.error || 'Failed to create poll');
      }
    } catch {
      setError('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <form onSubmit={handleSubmit} style={{ minWidth: 320, maxWidth: 400, width: '100%', background: '#fff', padding: 36, borderRadius: 16, boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 8, color: '#333', letterSpacing: '-1px', textAlign: 'center' }}>Create Poll</h2>
        <input value={question} onChange={e => setQuestion(e.target.value)} required placeholder="Poll question" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid #764ba2', fontSize: 16, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
        {options.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <input value={opt} onChange={e => handleOptionChange(idx, e.target.value)} required placeholder={`Option ${idx + 1}`} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1.5px solid #764ba2', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            {options.length > 2 && <button type="button" onClick={() => removeOption(idx)} style={{ marginLeft: 8, color: '#ff4d4f', border: 'none', background: 'none', fontWeight: 'bold', fontSize: 20, cursor: 'pointer', lineHeight: 1 }} title="Remove">×</button>}
          </div>
        ))}
        <button type="button" onClick={addOption} style={{ marginBottom: 8, color: '#764ba2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, alignSelf: 'flex-start' }}>+ Add Option</button>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 8, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px #764ba244', transition: 'transform 0.1s', outline: 'none' }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        >{loading ? 'Creating...' : 'Create Poll'}</button>
      </form>
    </div>
  );
} 