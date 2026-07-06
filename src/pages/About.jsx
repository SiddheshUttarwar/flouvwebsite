import Layout from '../components/Layout.jsx';
import ceoPhoto from '../../uploads/pankajttarwar.webp';
import ctoPhoto from '../../uploads/AnkitPatras2.webp';

const TEAM = [
  {
    initials: 'PU',
    photo: ceoPhoto,
    name: 'Pankaj Uttarwar',
    title: 'Chief Executive Officer',
    bio: "Leads FloUV's commercial strategy, partnerships, and go-to-market execution — turning validated non-thermal science into a platform processors and OEMs can actually deploy.",
    linkedin: 'https://www.linkedin.com/in/pankaj-uttarwar-7a7004b/',
    email: 'pankajuttarwar@flouv.us',
    accent: 'oklch(0.55 0.19 295)',
    glow: 'oklch(0.94 0.03 295)',
  },
  {
    initials: 'AP',
    photo: ctoPhoto,
    name: 'Dr. Ankit Patras',
    title: 'Chief Technology Officer',
    bio: "Pioneered the light–matter interaction and fluid-dynamics breakthrough behind FloUV, overcoming the fundamental limits of conventional UV treatment in opaque, viscous liquids. Leads FloUV's UV-C engineering and scientific validation work.",
    linkedin: 'https://www.linkedin.com/in/ankit-patras-0a720b3a/',
    email: 'ankit.patras@flouv.us',
    accent: 'oklch(0.6 0.09 230)',
    glow: 'oklch(0.93 0.03 230)',
  },
];

export default function About() {
  return (
    <Layout active="About">
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: 'oklch(0.985 0.004 250)', color: 'oklch(0.22 0.01 250)' }}>
        {/* HERO */}
        <section
          style={{
            background: 'linear-gradient(180deg, oklch(0.96 0.006 250) 0%, oklch(0.93 0.008 255) 100%)',
            padding: '90px 56px 70px',
          }}
        >
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 16 }}>
              ABOUT FLOUV
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 46,
                lineHeight: 1.15,
                fontWeight: 700,
                margin: '0 0 24px',
                letterSpacing: '-0.02em',
                color: 'oklch(0.16 0.03 265)',
              }}
            >
              Building the future of non-thermal liquid processing
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'oklch(0.4 0.01 260)', maxWidth: 680, margin: '0 auto' }}>
              FloUV is a non-thermal UV-C processing platform engineered to deliver uniform microbial
              inactivation in opaque and viscous liquids — preserving native proteins, bioactives, and
              functional quality without heat. We're building line-ready technology from validated science,
              not a lab curiosity.
            </p>
          </div>
        </section>

        {/* TEAM */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '110px 56px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
            LEADERSHIP
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 56px', letterSpacing: '-0.01em' }}>
            The team behind FloUV
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {TEAM.map((person) => (
              <div key={person.name} style={{ padding: 40, background: 'oklch(0.99 0.002 250)', border: '1px solid oklch(0.9 0.005 250)', borderTop: `3px solid ${person.accent}` }}>
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 12,
                      objectFit: 'cover',
                      marginBottom: 24,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 12,
                      background: person.glow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 24,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 40,
                      fontWeight: 700,
                      color: person.accent,
                    }}
                  >
                    {person.initials}
                  </div>
                )}
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 600, margin: '0 0 4px' }}>
                  {person.name}
                </h3>
                <div style={{ fontSize: 14, fontWeight: 600, color: person.accent, marginBottom: 16 }}>{person.title}</div>
                <p style={{ fontSize: 15, color: 'oklch(0.4 0.01 250)', lineHeight: 1.65, margin: '0 0 24px' }}>{person.bio}</p>
                <div style={{ display: 'flex', gap: 20 }}>
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 14, fontWeight: 600, color: 'oklch(0.18 0.02 260)', textDecoration: 'none' }}
                  >
                    LinkedIn →
                  </a>
                  <a
                    href={`mailto:${person.email}`}
                    style={{ fontSize: 14, fontWeight: 600, color: 'oklch(0.18 0.02 260)', textDecoration: 'none' }}
                  >
                    {person.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: 'linear-gradient(135deg, oklch(0.18 0.025 255), oklch(0.22 0.06 290))',
            padding: '120px 56px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 40,
              fontWeight: 700,
              margin: '0 0 20px',
              letterSpacing: '-0.01em',
              color: 'oklch(0.98 0.005 250)',
            }}
          >
            Got any questions?
          </h2>
          <p style={{ fontSize: 17, color: 'oklch(0.75 0.02 260)', margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Reach out directly to our leadership team via email or LinkedIn above, or send a general inquiry
            below.
          </p>
          <a
            href="mailto:pankajuttarwar@flouv.us"
            style={{
              background: 'oklch(0.98 0.005 250)',
              color: 'oklch(0.16 0.02 260)',
              padding: '17px 34px',
              borderRadius: 3,
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 700,
              display: 'inline-block',
            }}
          >
            Email FloUV
          </a>
        </section>
      </div>
    </Layout>
  );
}
