import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, X, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';
import MatchModal from '../components/MatchModal';
import ConfirmDialog from '../components/ConfirmDialog';

interface LikerProfile {
  _id: string;
  name: string;
  age?: number;
  bio?: string;
  interests: string[];
  photos: string[];
}

const LikesYou = () => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<LikerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [actingId, setActingId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<{ name: string; photos: string[] } | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const fetchLikes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/swipe/likes-received');
      setProfiles(res.data.profiles);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load likes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  const selectedProfile = profiles.find((p) => p._id === selectedId) || null;

  const selectProfile = (id: string) => {
    setSelectedId(id);
    setPhotoIndex(0);
  };

  const cyclePhoto = (dir: 'prev' | 'next') => {
    if (!selectedProfile) return;
    const total = selectedProfile.photos.length || 1;
    setPhotoIndex((p) => {
      if (dir === 'next') return (p + 1) % total;
      return (p - 1 + total) % total;
    });
  };

  const respondTo = async (profile: LikerProfile, direction: 'like' | 'pass') => {
    setActingId(profile._id);
    try {
      const res = await api.post('/swipe', { toUserId: profile._id, direction });
      if (res.data.matched) {
        setMatchedUser({ name: profile.name, photos: profile.photos });
      }
      setProfiles((prev) => prev.filter((p) => p._id !== profile._id));
      setSelectedId(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  const handleBlock = async () => {
    if (!selectedProfile) return;
    setBlocking(true);
    try {
      await api.post(`/block/${selectedProfile._id}`);
      if (reportReason) { 
        try { 
          await api.post(`/report/${selectedProfile._id}`, { reason: reportReason }); 
        } catch { 
          // Non-fatal — the block itself already succeeded 
        } 
      }
      setProfiles((prev) => prev.filter((p) => p._id !== selectedProfile._id));
      setSelectedId(null);
      setShowBlockConfirm(false);
      setReportReason('');
    } catch {
      setError('Could not block this profile. Please try again.');
    } finally {
      setBlocking(false);
    }
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

      {showBlockConfirm && selectedProfile && (
        <ConfirmDialog
          title="Block this profile?"
          message={`You won't see ${selectedProfile.name}'s profile again, and they won't be able to match or message you.`}
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
          <h2 className="swipe-page-title">Likes You</h2>
        </div>

        {loading && <div className="loading-screen">Loading...</div>}

        {!loading && error && <div className="error-banner">{error}</div>}

        {!loading && !error && profiles.length === 0 && (
          <div className="swipe-empty-state">
            <Heart size={32} className="swipe-empty-icon" />
            <h3>No likes yet</h3>
            <p>Once someone likes your profile, they'll show up here.</p>
          </div>
        )}

        {!loading && !error && profiles.length > 0 && !selectedProfile && (
          <div className="likes-grid">
            {profiles.map((p) => (
              <button
                key={p._id}
                type="button"
                className="likes-grid-item"
                onClick={() => selectProfile(p._id)}
              >
                {p.photos[0] ? (
                  <img src={p.photos[0]} alt={p.name} />
                ) : (
                  <div className="likes-grid-item-empty" />
                )}
                <span className="likes-grid-item-name">
                  {p.name}
                  {p.age ? `, ${p.age}` : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        {selectedProfile && (
          <>
            <div className="swipe-card">
              <div className="swipe-card-photo-wrap">
                {selectedProfile.photos.length > 0 ? (
                  <img
                    src={selectedProfile.photos[photoIndex]}
                    alt={selectedProfile.name}
                    draggable={false}
                  />
                ) : (
                  <div className="swipe-card-photo-empty">No photo</div>
                )}

                {selectedProfile.photos.length > 1 && (
                  <div className="swipe-photo-dots">
                    {selectedProfile.photos.map((_, i) => (
                      <span
                        key={i}
                        className={`swipe-photo-dot ${i === photoIndex ? 'swipe-photo-dot-active' : ''}`}
                      />
                    ))}
                  </div>
                )}

                {selectedProfile.photos.length > 1 && (
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

                <div className="swipe-card-info-overlay">
                  <h3>
                    {selectedProfile.name}
                    {selectedProfile.age ? `, ${selectedProfile.age}` : ''}
                  </h3>
                  {selectedProfile.bio && <p>{selectedProfile.bio}</p>}
                  {selectedProfile.interests.length > 0 && (
                    <div className="tag-grid swipe-card-tags">
                      {selectedProfile.interests.slice(0, 4).map((tag) => (
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
                onClick={() => respondTo(selectedProfile, 'pass')}
                disabled={actingId === selectedProfile._id}
                aria-label="Pass"
              >
                <X size={26} />
              </button>
              <button
                type="button"
                className="swipe-action-btn swipe-action-like"
                onClick={() => respondTo(selectedProfile, 'like')}
                disabled={actingId === selectedProfile._id}
                aria-label="Like back"
              >
                <Heart size={24} fill="currentColor" />
              </button>
            </div>

            <button
              type="button"
              className="btn-secondary likes-back-btn"
              onClick={() => setSelectedId(null)}
            >
              <ArrowLeft size={14} />
              See who else likes you
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LikesYou;
