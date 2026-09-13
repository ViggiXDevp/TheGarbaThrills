import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import AuthBrandHeader from '../components/AuthBrandHeader';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
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
        <h1>Reset your password</h1>
        <p className="subtitle">Enter your email and we'll send you a reset link</p>

        {error && <div className="error-banner">{error}</div>}
        {message && <div className="success-banner">{message}</div>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="switch-link">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
