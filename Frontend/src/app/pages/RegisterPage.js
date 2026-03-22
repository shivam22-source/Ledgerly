import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.register(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.5px' }}>
            Ledgerly<span style={{ color: '#63d39f' }}>.</span>
          </div>
          <div style={{ fontSize: 13, color: '#4a5568', marginTop: 6 }}>
            Your personal finance dashboard
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>
          Create account
        </h2>
        <p style={{ fontSize: 13, color: '#4a5568', marginBottom: 24 }}>
          Start tracking your finances today
        </p>

        {error && <div className="error-msg">{error}</div>}

        {success && (
          <div style={{
            background: 'rgba(99,211,159,0.1)', border: '1px solid rgba(99,211,159,0.2)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            color: '#63d39f', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
          }}>
            ✅ Registered! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#4a5568' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#63d39f', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;