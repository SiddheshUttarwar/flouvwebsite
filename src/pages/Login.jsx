import React, { useState } from 'react';

const Login = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid password');
      }
      
      setSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 800);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <style>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--flouv-blue) 0%, var(--flouv-blue-deep) 100%);
          font-family: 'Inter', 'Roboto', sans-serif;
        }
        .login-card {
          background: oklch(0.94 0.02 264 / 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid oklch(0.94 0.02 264 / 0.1);
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px oklch(0.3 0.05 264 / 0.5);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .login-header h1 {
          color: #ffffff;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          text-align: center;
        }
        .login-header p {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
          text-align: center;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          color: #e2e8f0;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .input-group input {
          background: oklch(0.3 0.05 264 / 0.2);
          border: 1px solid oklch(0.94 0.02 264 / 0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #ffffff;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .input-group input:focus {
          border-color: var(--flouv-blue);
          box-shadow: 0 0 0 2px oklch(0.37 0.19 264 / 0.2);
          background: oklch(0.3 0.05 264 / 0.3);
        }
        .login-button {
          background: var(--flouv-green);
          color: var(--flouv-green-ink);
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }
        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px oklch(0.6 0.2 154 / 0.4);
        }
        .login-button:active {
          transform: translateY(0);
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 14px;
          border-radius: 10px;
          font-size: 0.9rem;
          text-align: center;
          font-weight: 500;
        }
        .success-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #22c55e;
          padding: 14px;
          border-radius: 10px;
          font-size: 0.9rem;
          text-align: center;
          font-weight: 500;
        }
      `}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Admin Access</h1>
            <p>Please sign in to continue</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Successfully logged in! Token saved.</div>}
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            
            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
