import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import AuthBrandHeader from '../components/AuthBrandHeader';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset link is missing a token. Please request a new one.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
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
        <h1>Set a new password</h1>

        {error && <div className="error-banner">{error}</div>}
        {message && <div className="success-banner">{message}</div>}

        <label> 
          New password 
          <div className="password-input-wrap"> 
            <input type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required minLength={8} 
            /> 
            <button type="button" className="password-toggle-btn" 
              onClick={() => setShowPassword((v) => !v)} 
              aria-label={showPassword ? 'Hide password' : 'Show password'} 
              tabIndex={-1} > {showPassword ? <EyeOff size={17} /> : <Eye size={17} />} 
            </button> 
          </div> 
        </label>

        <label> 
          Confirm new password 
          <div className="password-input-wrap"> 
            <input type={showConfirmPassword ? 'text' : 'password'} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required minLength={8} 
            /> 
            <button type="button" className="password-toggle-btn" 
              onClick={() => setShowConfirmPassword((v) => !v)} 
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} 
              tabIndex={-1} > {showConfirmPassword ? <Eye size={17} /> : <EyeOff size={17} />} 
            </button> 
          </div> 
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="switch-link">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
