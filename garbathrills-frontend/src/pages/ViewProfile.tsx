import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

interface PublicProfile {
  name: string;
  age?: number;
  gender: string;
  bio?: string;
  interests: string[];
  photos: string[];
}

const ViewProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${userId}`);
        setProfile(res.data.user);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load this profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  return (
    <div className="profile-page">
      <FestiveBackgroundArt />
      <div className="profile-page-inner">
        <div className="profile-top-bar">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="profile-back-link"
            style={{ background: 'none', width: 'auto', padding: 0, margin: 0, boxShadow: 'none' }}
          >
            {' '}
            <ArrowLeft size={18} /> Back{' '}
          </button>
          <h2 className="swipe-page-title">Profile</h2>
        </div>

        {loading && <div className="loading-screen">Loading...</div>}
        {!loading && error && <div className="error-banner">{error}</div>}

        {!loading && !error && profile && (
          <div className="profile-view">
            {profile.photos.length > 0 ? (
              <div className="profile-photo-gallery">
                {profile.photos.map((url) => (
                  <img key={url} src={url} alt={profile.name} />
                ))}
              </div>
            ) : (
              <div className="profile-photo-empty">No photos yet</div>
            )}

            <h1 className="profile-name-age">
              {profile.name}
              {profile.age ? `, ${profile.age}` : ''}
            </h1>
            <p className="profile-gender">{profile.gender}</p>

            {profile.bio && <p className="profile-bio">{profile.bio}</p>}

            {profile.interests.length > 0 && (
              <div className="tag-grid profile-tags">
                {profile.interests.map((tag) => (
                  <span key={tag} className="tag-pill tag-pill-selected">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;