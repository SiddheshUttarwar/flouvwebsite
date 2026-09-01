import { useState } from 'react';
import { Link } from 'react-router-dom';
import flouvLogo from '../assets/flouv-logo.png';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Technology', to: '/technology' },
  { label: 'Industries', to: '/industries' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
];

const FLOUV_LOCATIONS = [
  { name: 'FloUV USA HQ', address: '257 Dink Rut Rd, Portland, TN 37148' },
  {
    name: 'FloUV Innovation & Science',
    address: '3500 John A Merritt Blvd, 3204 Agriculture Biotechnology Building, Nashville, TN 37209-1561',
  },
];

const PARTNER_LOCATIONS = [
  {
    name: 'Canada/USA Distribution (Cider Processing)',
    company: 'Juicing Systems',
    address: '10030 Ricardo Rd, Coldstream, BC V1B 3C1, Canada',
    phone: '+1-778-943-2249',
  },
  {
    name: 'EU Dairy Processing Technical Services',
    company: 'ELEFQ',
    address: 'Ludwig-Erhard-Str. 18, 20459 Hamburg, Germany',
    web: 'dubielconsulting.de',
    email: 'info@dubielconsulting.de',
  },
  {
    name: 'Mexico Distribution',
    address: 'Miguel Glinka 78, Héroes de Nacozári, Gustavo A. Madero, 07780 Ciudad de México, CDMX, Mexico',
    phone: '+52-55-5752-9600',
  },
];

function LocationEntry({ location }) {
  const lineStyle = { fontSize: 13, color: 'oklch(0.85 0.02 260)', lineHeight: 1.5 };
  const linkStyle = { ...lineStyle, textDecoration: 'none', display: 'block' };

  return (
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--flouv-white)', marginBottom: 2 }}>
        {location.name}
      </div>
      {location.company && (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--flouv-green)', marginBottom: 3 }}>
          {location.company}
        </div>
      )}
      <div style={lineStyle}>{location.address}</div>
      {location.phone && <div style={{ ...lineStyle, marginTop: 2 }}>Ph: {location.phone}</div>}
      {location.web && (
        <a href={`https://${location.web}`} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, marginTop: 2 }}>
          {location.web}
        </a>
      )}
      {location.email && (
        <a href={`mailto:${location.email}`} style={linkStyle}>
          {location.email}
        </a>
      )}
    </div>
  );
}

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
          background: 'var(--flouv-white)',
          backdropFilter: 'blur(14px)',
          border: '1px solid var(--flouv-border-soft)',
          borderRadius: 100,
          boxShadow: '0 8px 30px oklch(0.3 0.05 264 / 0.12)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={flouvLogo} alt="FloUV" style={{ height: 22, width: 'auto', display: 'block' }} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: active === link.label ? 'var(--flouv-blue)' : 'var(--flouv-text)',
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
            background: 'var(--flouv-green)',
            color: 'var(--flouv-green-ink)',
            padding: '10px 22px',
            borderRadius: 100,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Blog
        </Link>
      </header>

      {children}

      <footer
        style={{
          borderTop: '1px solid var(--flouv-border)',
          background: 'var(--flouv-blue-deep)',
          color: 'var(--flouv-white)',
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
            <div style={{ marginBottom: 12, background: 'var(--flouv-white)', display: 'inline-block', padding: '6px 10px', borderRadius: 8 }}>
              <img src={flouvLogo} alt="FloUV" style={{ height: 20, width: 'auto', display: 'block' }} />
            </div>
            <p style={{ fontSize: 13, color: 'oklch(0.85 0.02 260)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Non-thermal UV-C processing for dairy, juices, and beverages.
            </p>

            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Stay in the loop
            </div>
            <p style={{ fontSize: 13, color: 'oklch(0.85 0.02 260)', margin: '0 0 14px' }}>
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
                  border: '1px solid oklch(0.4 0.05 264)',
                  background: 'oklch(0.28 0.08 264)',
                  color: 'var(--flouv-white)',
                  borderRadius: 100,
                  fontSize: 13.5,
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--flouv-green)',
                  color: 'var(--flouv-green-ink)',
                  border: 'none',
                  borderRadius: 100,
                  padding: '10px 20px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Sign Up
              </button>
            </form>
            {subscribed && (
              <div style={{ fontSize: 13, color: 'oklch(0.85 0.02 260)', marginTop: -16, marginBottom: 24 }}>
                Thanks — you're on the list.
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.75 0.03 260)', marginBottom: 8 }}>
              FOLLOW US
            </div>
            <a
              href="https://www.linkedin.com/company/flouv/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13.5, color: 'var(--flouv-white)', textDecoration: 'none' }}
            >
              LinkedIn →
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 36 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.75 0.03 260)', marginBottom: 16 }}>
                FLOUV OFFICES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {FLOUV_LOCATIONS.map((office) => (
                  <LocationEntry key={office.name} location={office} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.75 0.03 260)', marginBottom: 16 }}>
                DISTRIBUTION &amp; TECHNICAL PARTNERS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {PARTNER_LOCATIONS.map((partner) => (
                  <LocationEntry key={partner.name} location={partner} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            paddingTop: 24,
            borderTop: '1px solid oklch(0.4 0.05 264)',
            fontSize: 13,
            color: 'oklch(0.75 0.03 260)',
          }}
        >
          © 2026 Flouv. Non-thermal UV-C processing.
        </div>
      </footer>
    </div>
  );
}
