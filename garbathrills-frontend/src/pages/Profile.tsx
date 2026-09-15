import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PhotoManager from '../components/PhotoManager';
import InterestTagPicker from '../components/InterestTagPicker';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

const MAX_INTERESTS = 8;

type LookingFor = 'male' | 'female' | 'other' | 'anyone';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [photos, setPhotos] = useState<string[]>(user?.photos || []);
  const [lookingFor, setLookingFor] = useState<LookingFor | ''>(user?.lookingFor || '');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    const fetchTags = async () => {
      try {
        const res = await api.get('/profile/interest-tags');
        setAvailableTags(res.data.tags);
      } catch {
        setError('Could not load interest tags. Please try again.');
      }
    };
    fetchTags();
  }, [isEditing]);

  const startEditing = () => {
    setAge(user?.age ? String(user.age) : '');
    setBio(user?.bio || '');
    setInterests(user?.interests || []);
    setPhotos(user?.photos || []);
    setLookingFor(user?.lookingFor || '');
    setError('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setError('');

    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 18) {
      setError('You must be at least 18 to use TheGarbaThrills');
      return;
    }

    if (photos.length === 0) {
      setError('Please keep at least 1 photo');
      return;
    }

    if (interests.length === 0) {
      setError('Please select at least 1 interest');
      return;
    }

    if (!lookingFor) {
      setError('Please select who you are hoping to meet');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/profile', { age: ageNum, bio, interests, lookingFor });
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <FestiveBackgroundArt />
      <div className="profile-page-inner">
        <div className="profile-top-bar">
          <Link to="/" className="profile-back-link">
            <ArrowLeft size={18} />
            Home
          </Link>
          {!isEditing && (
            <button type="button" className="edit-profile-btn" onClick={startEditing}>
              <Pencil size={14} />
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {!isEditing ? (
          <div className="profile-view">
            {photos.length > 0 ? (
              <div className="profile-photo-gallery">
                {photos.map((url) => (
                  <img key={url} src={url} alt={user.name} />
                ))}
              </div>
            ) : (
              <div className="profile-photo-empty">No photos yet</div>
            )}

            <h1 className="profile-name-age">
              {user.name}
              {user.age ? `, ${user.age}` : ''}
            </h1>
            <p className="profile-gender">{user.gender}</p>
            {user.lookingFor && (
              <p className="profile-looking-for">Looking for: {user.lookingFor}</p>
            )}

            {user.bio && <p className="profile-bio">{user.bio}</p>}

            {user.interests.length > 0 && (
              <div className="tag-grid profile-tags">
                {user.interests.map((tag) => (
                  <span key={tag} className="tag-pill tag-pill-selected">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="profile-email">{user.email}</p>
          </div>
        ) : (
          <div className="profile-edit">
            <label>
              Age
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={18}
                max={100}
              />
            </label>

            <label>
              Bio <span className="char-count">{bio.length}/150</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                maxLength={150}
                rows={3}
              />
            </label>

            <label>
              Who are you hoping to meet?
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value as LookingFor)}
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="anyone">Anyone</option>
              </select>
            </label>

            <div className="field-label">
              Your Photos ({photos.length}/3)
              <PhotoManager photos={photos} onPhotosChange={setPhotos} maxPhotos={3} />
            </div>

            <div className="field-label">
              Interests ({interests.length}/{MAX_INTERESTS})
              <InterestTagPicker
                availableTags={availableTags}
                selected={interests}
                onChange={setInterests}
                maxTags={MAX_INTERESTS}
              />
            </div>

            <div className="profile-edit-actions">
              <button type="button" className="btn-secondary" onClick={cancelEditing}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;