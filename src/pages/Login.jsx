import { useState } from 'react';
import { Link } from 'react-router-dom';
import flouvLogo from '../assets/flouv-logo.webp';

const Login = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(response.status === 429
          ? 'Too many attempts. Please wait a few minutes and try again.'
          : (data.detail || 'Incorrect password.'));
      }

      setSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-page {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          background: radial-gradient(120% 120% at 50% 0%, var(--flouv-blue) 0%, var(--flouv-blue-deep) 60%, oklch(0.14 0.08 264) 100%);
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }
        .login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(oklch(1 0 0 / 0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(circle at 50% 30%, black, transparent 70%);
          pointer-events: none;
        }
        .login-glow {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 560px;
          height: 560px;
          background: radial-gradient(circle, var(--flouv-green) 0%, transparent 70%);
          opacity: 0.16;
          filter: blur(10px);
          pointer-events: none;
        }
        .login-card {
          position: relative;
          background: var(--flouv-white);
          border-radius: 20px;
          padding: 44px 40px 36px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 30px 70px -20px oklch(0.14 0.08 264 / 0.55);
        }
        .login-logo {
          display: block;
          height: 24px;
          width: auto;
          margin: 0 auto 28px;
        }
        .login-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--flouv-ink);
          margin: 0 0 6px;
          text-align: center;
        }
        .login-header p {
          color: var(--flouv-muted);
          font-size: 0.9rem;
          margin: 0 0 28px;
          text-align: center;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .input-group label {
          color: var(--flouv-text);
          font-size: 0.82rem;
          font-weight: 600;
        }
        .password-field {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-field input {
          width: 100%;
          background: var(--flouv-bg-soft);
          border: 1px solid var(--flouv-border);
          border-radius: 10px;
          padding: 13px 44px 13px 15px;
          color: var(--flouv-ink);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
        }
        .password-field input:focus {
          border-color: var(--flouv-blue);
          box-shadow: 0 0 0 3px oklch(0.37 0.19 264 / 0.12);
        }
        .password-toggle {
          position: absolute;
          right: 6px;
          background: none;
          border: none;
          color: var(--flouv-muted);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 8px 10px;
          cursor: pointer;
          border-radius: 6px;
        }
        .password-toggle:hover {
          color: var(--flouv-blue);
        }
        .login-button {
          background: var(--flouv-green);
          color: var(--flouv-green-ink);
          border: none;
          border-radius: 100px;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
          margin-top: 6px;
        }
        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px -6px oklch(0.6 0.2 154 / 0.5);
        }
        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }
        .status-message {
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          text-align: center;
          font-weight: 500;
        }
        .status-message.error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.18);
          color: #b91c1c;
        }
        .status-message.success {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.18);
          color: #15803d;
        }
        .login-back-link {
          display: block;
          text-align: center;
          margin-top: 24px;
          color: var(--flouv-muted);
          font-size: 0.82rem;
          text-decoration: none;
        }
        .login-back-link:hover {
          color: var(--flouv-blue);
        }
      `}</style>
      <div className="login-page">
        <div className="login-glow" />
        <div className="login-card">
          <img src={flouvLogo} alt="FloUV" className="login-logo" />
          <div className="login-header">
            <h1>Admin Access</h1>
            <p>Sign in to manage FloUV's site content</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div className="status-message error">{error}</div>}
            {success && <div className="status-message success">Signed in — redirecting...</div>}

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading || success}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <Link to="/" className="login-back-link">← Back to flouv.us</Link>
        </div>
      </div>
    </>
  );
};

export default Login;
