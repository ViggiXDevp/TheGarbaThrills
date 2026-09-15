import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, Heart, RotateCcw, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';
import MatchModal from '../components/MatchModal';
import ConfirmDialog from '../components/ConfirmDialog';

interface CandidateProfile {
  _id: string;
  name: string;
  age?: number;
  gender: string;
  bio?: string;
  interests: string[];
  photos: string[];
}

const SWIPE_THRESHOLD = 110;

const SwipeDeck = () => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [index, setIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const [matchedUser, setMatchedUser] = useState<{ name: string; photos: string[] } | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchDeck = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/swipe/deck');
      setProfiles(res.data.profiles);
      setIndex(0);
      setPhotoIndex(0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, []);

  const currentProfile = profiles[index];

  const handlePointerDown = (e: React.PointerEvent) => {
    if (exitDirection) return;
    startXRef.current = e.clientX;
    setIsDragging(true);
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startXRef.current);
  };

  const handlePointerUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      await commitSwipe('like');
    } else if (dragX < -SWIPE_THRESHOLD) {
      await commitSwipe('pass');
    } else {
      setDragX(0);
    }
  };

  const commitSwipe = (direction: 'like' | 'pass') => {
  if (!currentProfile) return;

  const swipedProfile = currentProfile;
  setExitDirection(direction === 'like' ? 'right' : 'left');

  // Fire the swipe request in the background — don't block the UI on it
  api
    .post('/swipe', { toUserId: swipedProfile._id, direction })
    .then((res) => {
      if (res.data.matched) {
        setMatchedUser({
          name: res.data.matchedUser.name,
          photos: res.data.matchedUser.photos || [],
        });
      }
    })
    .catch(() => {
      // Swipe failed silently; the deck has already moved on
    });

  setTimeout(() => {
    setIndex((i) => i + 1);
    setPhotoIndex(0);
    setDragX(0);
    setExitDirection(null);
  }, 320);
};

  const cyclePhoto = (dir: 'prev' | 'next') => {
    if (!currentProfile) return;
    const total = currentProfile.photos.length || 1;
    setPhotoIndex((p) => {
      if (dir === 'next') return (p + 1) % total;
      return (p - 1 + total) % total;
    });
  };

  const handleBlock = async () => {
    if (!currentProfile) return;
    setBlocking(true);
    try {
      await api.post(`/block/${currentProfile._id}`);
      if (reportReason) { 
        try { 
          await api.post(`/report/${currentProfile._id}`, { reason: reportReason }); 
        } catch { 
          // Non-fatal — the block itself already succeeded 
        } 
      }
      setShowBlockConfirm(false);
      setReportReason('');
      setIndex((i) => i + 1);
      setPhotoIndex(0);
    } catch {
      setError('Could not block this profile. Please try again.');
    } finally {
      setBlocking(false);
    }
  };

  const cardStyle: React.CSSProperties = exitDirection
    ? {
        transform: `translateX(${exitDirection === 'right' ? 650 : -650}px)`,
        opacity: 0,
        transition: 'transform 0.32s ease, opacity 0.32s ease',
      }
    : {
        transform: `translateX(${dragX}px)`,
        transition: isDragging ? 'none' : 'transform 0.25s ease',
      };

  return (
    <div className="swipe-page">
      <FestiveBackgroundArt />

      {matchedUser && (
        <MatchModal
          matchedUser={matchedUser}
          onKeepSwiping={() => setMatchedUser(null)}
          onViewMatches={() => navigate('/matches')}
        />
      )}

      {showBlockConfirm && currentProfile && (
        <ConfirmDialog
          title="Block this profile?"
          message={`You won't see ${currentProfile.name}'s profile again, and they won't be able to match or message you.`}
          confirmLabel="Block"
          onConfirm={handleBlock}
          onCancel={() => setShowBlockConfirm(false)}
          confirmDisabled={blocking}
        >
          <label style={{ marginBottom: 0 }}>
            Reason (optional)
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="harassment">Harassment</option>
              <option value="fake_profile">Fake Profile</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="spam">Spam</option>
              <option value="other">Other</option>
            </select>
          </label>
        </ConfirmDialog>
      )}

      <div className="swipe-page-inner">
        <div className="profile-top-bar">
          <Link to="/" className="profile-back-link">
            <ArrowLeft size={18} />
            Home
          </Link>
          <h2 className="swipe-page-title">Browse Profiles</h2>
        </div>

        {loading && <div className="loading-screen">Loading profiles...</div>}

        {!loading && error && (
          <div className="swipe-empty-state">
            <p className="error-banner">{error}</p>
            <button type="button" onClick={fetchDeck}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && !currentProfile && (
          <div className="swipe-empty-state">
            <RotateCcw size={32} className="swipe-empty-icon" />
            <h3>You're all caught up!</h3>
            <p>No more profiles to show right now. Check back later, or refresh.</p>
            <button type="button" onClick={fetchDeck}>
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && currentProfile && (
          <>
            <div
              ref={cardRef}
              className="swipe-card"
              style={cardStyle}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div className="swipe-card-photo-wrap">
                {currentProfile.photos.length > 0 ? (
                  <img
                    src={currentProfile.photos[photoIndex]}
                    alt={currentProfile.name}
                    draggable={false}
                  />
                ) : (
                  <div className="swipe-card-photo-empty">No photo</div>
                )}

                {currentProfile.photos.length > 1 && (
                  <div className="swipe-photo-dots">
                    {currentProfile.photos.map((_, i) => (
                      <span
                        key={i}
                        className={`swipe-photo-dot ${i === photoIndex ? 'swipe-photo-dot-active' : ''}`}
                      />
                    ))}
                  </div>
                )}

                {currentProfile.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="swipe-photo-tap swipe-photo-tap-left"
                      onClick={() => cyclePhoto('prev')}
                      aria-label="Previous photo"
                    />
                    <button
                      type="button"
                      className="swipe-photo-tap swipe-photo-tap-right"
                      onClick={() => cyclePhoto('next')}
                      aria-label="Next photo"
                    />
                  </>
                )}

                <button
                  type="button"
                  className="swipe-card-report-btn"
                  onClick={() => setShowBlockConfirm(true)}
                  aria-label="Block this profile"
                  title="Block"
                >
                  <ShieldAlert size={16} />
                </button>

                <div
                  className="swipe-badge swipe-badge-like"
                  style={{ opacity: dragX > 30 ? Math.min(dragX / SWIPE_THRESHOLD, 1) : 0 }}
                >
                  LIKE
                </div>
                <div
                  className="swipe-badge swipe-badge-pass"
                  style={{ opacity: dragX < -30 ? Math.min(-dragX / SWIPE_THRESHOLD, 1) : 0 }}
                >
                  PASS
                </div>

                <div className="swipe-card-info-overlay">
                  <h3>
                    {currentProfile.name}
                    {currentProfile.age ? `, ${currentProfile.age}` : ''}
                  </h3>
                  {currentProfile.bio && <p>{currentProfile.bio}</p>}
                  {currentProfile.interests.length > 0 && (
                    <div className="tag-grid swipe-card-tags">
                      {currentProfile.interests.slice(0, 4).map((tag) => (
                        <span key={tag} className="tag-pill tag-pill-selected">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="swipe-action-buttons">
              <button
                type="button"
                className="swipe-action-btn swipe-action-pass"
                onClick={() => commitSwipe('pass')}
                aria-label="Pass"
              >
                <X size={26} />
              </button>
              <button
                type="button"
                className="swipe-action-btn swipe-action-like"
                onClick={() => commitSwipe('like')}
                aria-label="Like"
              >
                <Heart size={24} fill="currentColor" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SwipeDeck;
