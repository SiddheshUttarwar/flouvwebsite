import { useState } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Technology', to: '/technology' },
  { label: 'Industries', to: '/industries' },
  { label: 'About', to: '/about' },
];

const OFFICES = [
  { name: 'FloUV USA HQ', address: '257 Dink Rut Rd, Portland, TN 37148' },
  {
    name: 'FloUV Innovation & Science',
    address: '3500 John A Merritt Blvd, 3204 Agriculture Biotechnology Building, Nashville, TN 37209-1561',
  },
  {
    name: 'FloUV Fabrication Works',
    address: 'Gat No 50, Near Bharat Weigh Bridge, Talwade Pune, India',
    phone: '+91-75079000025',
  },
  {
    name: 'Canada Distribution',
    address: '10030 Ricardo Rd, Coldstream, BC V1B 3C1, Canada',
    phone: '+1-778-943-2249',
  },
  {
    name: 'Mexico Distribution',
    address: 'Miguel Glinka 78, Héroes de Nacozári, Gustavo A. Madero, 07780 Ciudad de México, CDMX, Mexico',
    phone: '+52-55-5752-9600',
  },
];

export default function Layout({ active, children }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          position: 'sticky',
          top: 24,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 26px',
          maxWidth: 1200,
          margin: '24px auto 0',
          background: 'oklch(0.99 0.002 250 / 0.75)',
          backdropFilter: 'blur(14px)',
          border: '1px solid oklch(1 0 0 / 0.6)',
          borderRadius: 100,
          boxShadow: '0 8px 30px oklch(0.4 0.02 260 / 0.1)',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.01em',
            color: 'oklch(0.18 0.02 260)',
            textDecoration: 'none',
          }}
        >
          FloUV
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: active === link.label ? 'oklch(0.18 0.02 260)' : 'oklch(0.4 0.01 260)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active === link.label ? 600 : 500,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/blog"
          style={{
            background: 'oklch(0.55 0.19 295)',
            color: 'oklch(0.99 0.005 250)',
            padding: '10px 22px',
            borderRadius: 100,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Blog
        </Link>
      </header>

      {children}

      <footer
        style={{
          borderTop: '1px solid oklch(0.9 0.005 250)',
          padding: '64px 56px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: 40,
            marginBottom: 48,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>
              FLOUV
            </div>
            <p style={{ fontSize: 13, color: 'oklch(0.5 0.01 250)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Non-thermal UV-C processing for dairy, juices, and beverages.
            </p>

            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Stay in the loop
            </div>
            <p style={{ fontSize: 13, color: 'oklch(0.5 0.01 250)', margin: '0 0 14px' }}>
              Sign up with your email address to receive news and updates.
            </p>
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                style={{
                  padding: '10px 14px',
                  border: '1px solid oklch(0.85 0.005 255)',
                  borderRadius: 100,
                  fontSize: 13.5,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'oklch(0.18 0.02 260)',
                  color: 'oklch(0.98 0.005 250)',
                  border: 'none',
                  borderRadius: 100,
                  padding: '10px 20px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                Sign Up
              </button>
            </form>
            {subscribed && (
              <div style={{ fontSize: 13, color: 'oklch(0.55 0.19 295)', marginTop: -16, marginBottom: 24 }}>
                Thanks — you're on the list.
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.5 0.01 250)', marginBottom: 8 }}>
              FOLLOW US
            </div>
            <a
              href="https://www.linkedin.com/company/flouv/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13.5, color: 'oklch(0.4 0.01 250)', textDecoration: 'none' }}
            >
              LinkedIn →
            </a>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.5 0.01 250)', marginBottom: 16 }}>
              FLOUV OFFICES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              {OFFICES.map((office) => (
                <div key={office.name}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'oklch(0.22 0.01 250)', marginBottom: 4 }}>
                    {office.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'oklch(0.5 0.01 250)', lineHeight: 1.5 }}>{office.address}</div>
                  {office.phone && (
                    <div style={{ fontSize: 13, color: 'oklch(0.5 0.01 250)', marginTop: 2 }}>Ph: {office.phone}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            paddingTop: 24,
            borderTop: '1px solid oklch(0.9 0.005 250)',
            fontSize: 13,
            color: 'oklch(0.5 0.01 250)',
          }}
        >
          © 2026 Flouv. Non-thermal UV-C processing.
        </div>
      </footer>
    </div>
  );
}
