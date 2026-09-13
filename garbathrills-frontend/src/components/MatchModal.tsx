import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MatchedUser {
  name: string;
  photos: string[];
}

interface MatchModalProps {
  matchedUser: MatchedUser;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

const MATCH_MESSAGES = [
  'Two feet, one rhythm — the dance floor is calling.',
  'Looks like the dandiya sticks aren\'t the only thing clicking tonight.',
  'The garba circle just got a little more magical.',
  'Some connections are written in the stars, and in the swipe.',
  'Your playlists are about to sync up beautifully.',
  'This could be the start of your favorite Navratri memory.',
  'Grab your dandiya — destiny just made an introduction.',
  'The universe just played matchmaker, and it has great taste.',
];

const sparklePositions = [
  { top: '8%', left: '15%', delay: '0s' },
  { top: '12%', left: '80%', delay: '0.3s' },
  { top: '30%', left: '5%', delay: '0.6s' },
  { top: '75%', left: '10%', delay: '0.2s' },
  { top: '85%', left: '85%', delay: '0.5s' },
  { top: '20%', left: '50%', delay: '0.8s' },
  { top: '90%', left: '45%', delay: '0.1s' },
  { top: '60%', left: '92%', delay: '0.7s' },
];

const MatchModal = ({ matchedUser, onKeepSwiping, onViewMatches }: MatchModalProps) => {
  const { user } = useAuth();
  const [message] = useState(() => MATCH_MESSAGES[Math.floor(Math.random() * MATCH_MESSAGES.length)]);

  return (
    <div className="match-modal-overlay">
      <div className="match-modal">
        {sparklePositions.map((pos, i) => (
          <span
            key={i}
            className="match-sparkle"
            style={{ top: pos.top, left: pos.left, animationDelay: pos.delay }}
          />
        ))}

        <p className="match-modal-eyebrow">Garba Kismat</p>
        <h1 className="match-modal-title">It's a Match!</h1>
        <p className="match-modal-subtitle">
          You and {matchedUser.name} both said yes to dancing together
        </p>

        <div className="match-photos">
          <div className="match-photo-frame match-photo-left">
            {user?.photos?.[0] && <img src={user.photos[0]} alt={user.name} />}
          </div>
          <div className="match-heart-badge">
            <Heart size={26} fill="currentColor" />
          </div>
          <div className="match-photo-frame match-photo-right">
            {matchedUser.photos?.[0] && <img src={matchedUser.photos[0]} alt={matchedUser.name} />}
          </div>
        </div>

        <p className="match-modal-message">{message}</p>

        <div className="match-modal-actions">
          <button type="button" className="btn-secondary" onClick={onKeepSwiping}>
            Keep Swiping
          </button>
          <button type="button" onClick={onViewMatches}>
            View Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
