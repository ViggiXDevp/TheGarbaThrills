import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AuthBrandHeader from '../components/AuthBrandHeader';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

const SignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gender) {
      setError('Please select a gender');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', { name, email, password, gender });
      setUser(res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <FestiveBackgroundArt />
      <AuthBrandHeader />
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="subtitle">Find your Garba partner for the night</p>

        {error && <div className="error-banner">{error}</div>}

        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label> 
          Password 
          <div className="password-input-wrap"> 
            <input type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required minLength={8} 
            /> 
            <button type="button" className="password-toggle-btn" 
              onClick={() => setShowPassword((v) => !v)} 
              aria-label={showPassword ? 'Hide password' : 'Show password'} 
              tabIndex={-1} > {showPassword ? <Eye size={17} /> : <EyeOff size={17} />} 
            </button> 
          </div> 
        </label>

        <label>
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value as any)} required>
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="switch-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
