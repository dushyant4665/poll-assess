import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL!, { autoConnect: false });

export default function PollPage() {
  const router = useRouter();
  const { id } = router.query;
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polls/${id}`)
      .then(res => res.json())
      .then(data => { setPoll(data); setLoading(false); })
      .catch(() => { setError('Poll not found'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    socket.connect();
    socket.emit('joinPoll', id);
    socket.on('voteUpdate', (data) => {
      setPoll(data);
    });
    return () => {
      socket.off('voteUpdate');
      socket.disconnect();
    };
  }, [id]);

  const handleVote = async (optionIdx: number) => {
    if (voting || voted) return;
    setVoting(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polls/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIdx }),
      });
      if (res.ok) setVoted(true);
      else {
        const data = await res.json();
        setError(data.error || 'Failed to vote');
      }
    } catch {
      setError('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>Loading...</div>;
  if (error || !poll) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'red' }}>{error || 'Poll not found'}</div>;

  const totalVotes = poll.options.reduce((sum: number, o: any) => sum + o.votes, 0);
  const barColors = ['#667eea', '#764ba2', '#43cea2', '#185a9d', '#ff6a00', '#f7971e'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ minWidth: 320, maxWidth: 420, width: '100%', background: '#fff', padding: 36, borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 18, color: '#333', letterSpacing: '-1px', textAlign: 'center' }}>{poll.question}</h2>
        {poll.options.map((opt: any, idx: number) => {
          const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return (
            <div key={idx} style={{ marginBottom: 18 }}>
              <button
                disabled={voted || voting}
                onClick={() => handleVote(idx)}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid #764ba2', background: voted ? '#f3f3f3' : '#f9f9f9', cursor: voted ? 'not-allowed' : 'pointer', marginBottom: 6, fontWeight: 600, fontSize: 16, color: '#333', transition: 'background 0.2s' }}
              >
                {opt.text}
              </button>
              <div style={{ height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden', marginBottom: 2 }}>
                <div style={{ width: percent + '%', height: '100%', background: barColors[idx % barColors.length], transition: 'width 0.5s', borderRadius: 6 }} />
              </div>
              <span style={{ fontSize: 13, color: '#555' }}>{opt.votes} votes ({percent}%)</span>
            </div>
          );
        })}
        <div style={{ marginTop: 18, fontSize: 15, color: '#555', textAlign: 'center' }}>Total votes: {totalVotes}</div>
        {voted && <div style={{ marginTop: 16, color: '#43cea2', fontWeight: 700, textAlign: 'center', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>✔️</span> Thank you for voting! Results update live.
        </div>}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
} 