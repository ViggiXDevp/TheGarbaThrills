import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PhotoManager from '../components/PhotoManager';
import InterestTagPicker from '../components/InterestTagPicker';
import AuthBrandHeader from '../components/AuthBrandHeader';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

const MAX_INTERESTS = 8;

type LookingFor = 'male' | 'female' | 'other' | 'anyone';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [photos, setPhotos] = useState<string[]>(user?.photos || []);
  const [lookingFor, setLookingFor] = useState<LookingFor | ''>(user?.lookingFor || '');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/profile/interest-tags');
        setAvailableTags(res.data.tags);
      } catch {
        setError('Could not load interest tags. Please refresh the page.');
      }
    };
    fetchTags();
  }, []);

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 18) {
      setError('You must be at least 18 to use TheGarbaThrills');
      return;
    }

    if (!bio.trim()) {
      setError('Please write a short bio');
      return;
    }

    if (photos.length === 0) {
      setError('Please upload at least 1 photo');
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
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <FestiveBackgroundArt />
      <AuthBrandHeader />
      <form className="auth-card profile-setup-card" onSubmit={handleSubmit}>
        <h1>Complete Your Profile</h1>
        <p className="subtitle">A few details before you start swiping</p>

        {error && <div className="error-banner">{error}</div>}

        <label>
          Age
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={18}
            max={100}
            required
          />
        </label>

        <label>
          Bio <span className="char-count">{bio.length}/150</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 150))}
            maxLength={150}
            placeholder="A short line about you..."
            rows={3}
          />
        </label>

        <label>
          Who are you hoping to meet?
          <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value as LookingFor)} required>
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

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
