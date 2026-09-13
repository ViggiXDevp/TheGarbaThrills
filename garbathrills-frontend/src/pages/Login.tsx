import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AuthBrandHeader from '../components/AuthBrandHeader';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <FestiveBackgroundArt />
      <AuthBrandHeader />
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to continue</p>

        {error && <div className="error-banner">{error}</div>}

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
            onChange={(e) => setPassword(e.target.value)} required 
            /> 
            <button type="button" className="password-toggle-btn" 
              onClick={() => setShowPassword((v) => !v)} 
              aria-label={showPassword ? 'Hide password' : 'Show password'} 
              tabIndex={-1} > {showPassword ? <Eye size={17} /> : <EyeOff size={17} />} 
            </button> 
          </div> 
        </label>

        <div className="forgot-link">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="switch-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
