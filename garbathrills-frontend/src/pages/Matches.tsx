import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { api } from '../lib/api';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

interface MatchEntry {
  matchId: string;
  matchedAt: string;
  user: {
    _id: string;
    name: string;
    age?: number;
    photos: string[];
  };
  isBlockedByMe: boolean;
  unreadCount: number;
  lastMessage: {
    preview: string;
    sentByMe: boolean;
    createdAt: string;
  } | null;
}

const Matches = () => {
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matches');
        setMatches(res.data.matches);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load matches. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="swipe-page">
      <FestiveBackgroundArt />

      <div className="swipe-page-inner">
        <div className="profile-top-bar">
          <Link to="/" className="profile-back-link">
            <ArrowLeft size={18} />
            Home
          </Link>
          <h2 className="swipe-page-title">Matches</h2>
        </div>

        {loading && <div className="loading-screen">Loading...</div>}

        {!loading && error && <div className="error-banner">{error}</div>}

        {!loading && !error && matches.length === 0 && (
          <div className="swipe-empty-state">
            <MessageCircle size={32} className="swipe-empty-icon" />
            <h3>No matches yet</h3>
            <p>Keep swiping — when you and someone else both say yes, they'll show up here.</p>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="matches-list">
            {matches.map((m) => (
              <Link
                key={m.matchId}
                to={`/chat/${m.matchId}`}
                state={{ partner: { name: m.user.name, photos: m.user.photos } }}
                className="match-list-item"
              >
                <div className="match-list-avatar">
                  {m.user.photos[0] ? (
                    <img src={m.user.photos[0]} alt={m.user.name} />
                  ) : (
                    <div className="match-list-avatar-empty" />
                  )}
                </div>
                <div className="match-list-info">
                  <span className="match-list-name">
                    {m.user.name}
                    {m.user.age ? `, ${m.user.age}` : ''}
                    {m.isBlockedByMe && <span className="match-blocked-badge">Blocked</span>}
                  </span>
                  <span className="match-list-sub"> 
                    {m.isBlockedByMe 
                      ? "You've blocked this person" : m.lastMessage 
                      ? `${m.lastMessage.sentByMe ? 'You: ' : ''}${m.lastMessage.preview}` : 'Say hello 👋'} 
                  </span> 
                </div> 
                  {m.unreadCount > 0 && ( <span className="match-unread-badge">{m.unreadCount}</span> )} 
                </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
