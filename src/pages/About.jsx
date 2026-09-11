import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import InquiryModal from '../components/InquiryModal.jsx';
import ceoPhoto from '../../uploads/pankajttarwar.webp';
import ctoPhoto from '../../uploads/AnkitPatras2.webp';
import elefqLogo from '../../uploads/ELEFQ_Logo.webp';
import elefqWordmark from '../../uploads/ELEFQ_Wordmark.webp';
import juicingSystemsLogo from '../../uploads/JuicingSystems_Logo.webp';
import whcLabLogo from '../../uploads/WHCLab_Logo.webp';

const PERFORMANCE_ICONS = {
  // Falling demand — bar heights step down, with the trend line calling it out
  efficiency: (
    <>
      <path d="M5 33h30" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M10 33V16M20 33v-8M30 33v-3"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M8 10.5 30 22.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M24.5 22.2 30.6 22.8 30 16.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </>
  ),
  // An inline module dropped into a line that already exists
  integration: (
    <>
      <path d="M3 20h9M28 20h9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="12" y="11" width="16" height="18" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M17.5 16.5h5M17.5 23.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};

export const PERFORMANCE = [
  {
    title: 'Process efficiency',
    body: 'FloUV delivers precise, non-thermal UV-C treatment with low energy demand — reducing thermal load, preserving product value, and improving overall operational efficiency in complex liquid processing.',
    icon: 'efficiency',
  },
  {
    title: 'Easy integration',
    body: 'FloUV is designed for seamless integration into existing processing lines, working alongside thermal, membrane, and aseptic systems. Our team provides end-to-end technical support, from system integration and commissioning to validation and scale-up.',
    icon: 'integration',
  },
];

export const TEAM = [
  {
    initials: 'PU',
    photo: ceoPhoto,
    name: 'Pankaj Uttarwar',
    title: 'Chief Executive Officer',
    bio: "Leads FloUV's commercial strategy, partnerships, and go-to-market execution — turning validated non-thermal science into a platform processors and OEMs can actually deploy.",
    linkedin: 'https://www.linkedin.com/in/pankaj-uttarwar-7a7004b/',
    email: 'pankajuttarwar@flouv.us',
    accent: 'var(--flouv-blue-soft)',
    glow: 'var(--flouv-blue-tint)',
  },
  {
    initials: 'AP',
    photo: ctoPhoto,
    name: 'Dr. Ankit Patras',
    title: 'Chief Technology Officer',
    bio: "Pioneered the light–matter interaction and fluid-dynamics breakthrough behind FloUV, overcoming the fundamental limits of conventional UV treatment in opaque, viscous liquids. Leads FloUV's UV-C engineering and scientific validation work.",
    linkedin: 'https://www.linkedin.com/in/ankit-patras-0a720b3a/',
    email: 'ankit.patras@flouv.us',
    accent: 'var(--flouv-blue-soft)',
    glow: 'var(--flouv-blue-tint)',
  },
];

export const PARTNER_FORMS = [
  {
    label: 'INDEPENDENT CONSULTANTS',
    title: 'Specialists who bring FloUV into client projects',
    body: 'Process, food-safety and validation consultants already advising processors on alternatives to heat, who want a non-thermal option they can stand behind technically — and the evidence package to defend it.',
  },
  {
    label: 'ENGINEERING FIRMS',
    title: 'Integrators delivering complete lines',
    body: 'Process-engineering and EPC firms specifying whole production lines, where FloUV becomes the non-thermal treatment step inside a wider design. Our engineering team supports the interface, hydraulics, controls and validation strategy.',
  },
  {
    label: 'EQUIPMENT MANUFACTURERS',
    title: 'Global OEMs strengthening a proven tech stack',
    body:
      'Global manufacturers with mature, proven equipment stacks, where deep UV-C engineering has always sat too far from the core to build in-house. FloUV integrates as the validated non-thermal step, adding substantial capability to what they already sell.',
  },
];

export const SCIENCE_PATH = [
  {
    step: '01',
    title: 'Optical characterization',
    body: 'Your liquid measured on the actual stream — absorption, scattering and viscosity at treatment temperature. Always the first engagement, because everything downstream depends on it.',
  },
  {
    step: '02',
    title: 'Dose–response',
    body: 'Your target organisms run against a collimated beam to establish a fluid-specific D₁₀ — not a value borrowed from a different matrix.',
  },
  {
    step: '03',
    title: 'Challenge studies',
    body: 'Log-reduction evidence against the pathogen of concern, generated in your product rather than a convenient surrogate.',
  },
  {
    step: '04',
    title: 'Biodosimetry',
    body: 'Delivered reduction equivalent fluence per unicell pass, measured at representative flow rather than inferred from lamp power.',
  },
  {
    step: '05',
    title: 'Pilot trials',
    body: 'Configuration confirmed on the 640 LPH unicell — and, because every larger system is built from that same cell, valid at the scale you actually need.',
  },
  {
    step: '06',
    title: 'Validation support',
    body: 'The documented evidence package your approvals and regulatory process requires, assembled from the work above.',
  },
];

function PartnerLogoSlot({ name }) {
  return (
    <div
      style={{
        border: '2px dashed oklch(1 0 0 / 0.32)',
        borderRadius: 10,
        background: 'oklch(1 0 0 / 0.06)',
        minHeight: 104,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '16px 12px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 17 }}>🖼️</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: 'oklch(0.9 0.02 260)' }}>
        {name}
      </div>
      <div style={{ fontSize: 11, color: 'oklch(0.72 0.03 260)' }}>logo goes here</div>
    </div>
  );
}

// Partner marks are dark artwork on white or transparent backgrounds, so they sit on a
// white tile rather than straight on the dark case-study card.
function LogoTile({ children }) {
  return (
    <div
      style={{
        background: 'oklch(1 0 0)',
        borderRadius: 10,
        minHeight: 104,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '16px 14px',
      }}
    >
      {children}
    </div>
  );
}

function ElefqLogos() {
  return (
    <LogoTile>
      <img
        src={elefqLogo}
        alt="ELEFQ Market Solutions logo"
        style={{ height: 56, width: 56, objectFit: 'contain', flexShrink: 0 }}
      />
      <img
        src={elefqWordmark}
        alt="ELEFQ Market Solutions wordmark"
        style={{ height: 36, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
      />
    </LogoTile>
  );
}

function WhcLabLogo() {
  return (
    <LogoTile>
      <img
        src={whcLabLogo}
        alt="WHC Lab logo"
        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
      />
    </LogoTile>
  );
}

function JuicingSystemsLogo() {
  return (
    <LogoTile>
      <img
        src={juicingSystemsLogo}
        alt="Juicing Systems logo"
        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
      />
    </LogoTile>
  );
}

export default function About() {
  const [modal, setModal] = useState(null);

  return (
    <Layout active="About">
      <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)', color: 'var(--flouv-ink)' }}>
        {/* HERO */}
        <section
          style={{
            background: 'linear-gradient(180deg, var(--flouv-bg-soft) 0%, var(--flouv-blue-tint) 100%)',
            padding: '50px 56px 40px',
          }}
        >
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 16 }}>
              ABOUT FLOUV
            </div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 46,
                lineHeight: 1.15,
                fontWeight: 700,
                margin: '0 0 24px',
                letterSpacing: '-0.02em',
                color: 'var(--flouv-blue)',
              }}
            >
              Building the future of non-thermal liquid processing
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', maxWidth: 680, margin: '0 auto' }}>
              FloUV is a non-thermal UV-C processing platform engineered to deliver uniform microbial
              inactivation in opaque and viscous liquids — preserving native proteins, bioactives, and
              functional quality without heat. We're building line-ready technology from validated science,
              not a lab curiosity.
            </p>
          </div>
        </section>

        {/* PERFORMANCE MATTERS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '76px 56px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
            PERFORMANCE MATTERS
          </div>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 38, fontWeight: 700, margin: '0 0 40px', letterSpacing: '-0.01em' }}>
            Not a lab curiosity — a line-ready platform
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
            {PERFORMANCE.map((benefit) => (
              <div key={benefit.title} style={{ padding: 36, border: '1px solid var(--flouv-border)', borderRadius: 10 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'var(--flouv-blue-tint)',
                    color: 'var(--flouv-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
                    {PERFORMANCE_ICONS[benefit.icon]}
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 10px' }}>
                  {benefit.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--flouv-text)', lineHeight: 1.6, margin: 0 }}>{benefit.body}</p>
              </div>
            ))}
          </div>
          <Link to="/technology" style={{ color: 'var(--flouv-blue)', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
            Visit Technology →
          </Link>
        </section>

        {/* TEAM */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '54px 56px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
            LEADERSHIP
          </div>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 40px', letterSpacing: '-0.01em' }}>
            The team behind FloUV
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {TEAM.map((person) => (
              <div key={person.name} style={{ padding: 32, background: 'var(--flouv-white)', border: '1px solid var(--flouv-border)', borderTop: `3px solid ${person.accent}`, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 12,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 12,
                      background: person.glow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 40,
                      fontWeight: 700,
                      color: person.accent,
                    }}
                  >
                    {person.initials}
                  </div>
                )}
                <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 21, fontWeight: 600, margin: '0 0 4px' }}>
                  {person.name}
                </h3>
                <div style={{ fontSize: 14, fontWeight: 600, color: person.accent, marginBottom: 16 }}>{person.title}</div>
                <p style={{ fontSize: 14.5, color: 'var(--flouv-text)', lineHeight: 1.65, margin: '0 0 18px' }}>{person.bio}</p>
                <div style={{ display: 'flex', gap: 20 }}>
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 14, fontWeight: 600, color: 'var(--flouv-blue)', textDecoration: 'none' }}
                  >
                    LinkedIn →
                  </a>
                  <a
                    href={`mailto:${person.email}`}
                    style={{ fontSize: 14, fontWeight: 600, color: 'var(--flouv-blue)', textDecoration: 'none' }}
                  >
                    {person.email}
                  </a>
                </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PARTNERSHIP */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '54px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              PARTNER WITH FLOUV
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              Together we can build novel processes that solve major industrial problems
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', maxWidth: 820, margin: '0 0 36px' }}>
              The hardest problems in liquid processing are not waiting on a better pump. They are waiting on a
              process that does not exist yet — and those get built jointly, by people who bring the problem and
              people who bring the science. That is what a FloUV partnership is for. It takes several forms, and
              the people who approach us come from every application on our map — dairy, juices, beverages and
              ingredients, brewing, biofermentation and water.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 72 }}>
              {PARTNER_FORMS.map((form) => (
                <div
                  key={form.label}
                  style={{
                    padding: 36,
                    background: 'var(--flouv-white)',
                    border: '1px solid var(--flouv-border)',
                    borderTop: '3px solid var(--flouv-blue)',
                  }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--flouv-muted)', marginBottom: 14 }}>
                    {form.label}
                  </div>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.3 }}>
                    {form.title}
                  </h3>
                  <p style={{ fontSize: 14.5, color: 'var(--flouv-text)', lineHeight: 1.65, margin: 0 }}>{form.body}</p>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              HOW WE COLLABORATE
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              A new liquid enters our map by measurement, never by analogy
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', maxWidth: 820, margin: '0 0 40px' }}>
              When a partner brings us an application we have not treated before, our scientific team runs the same
              characterization protocol end to end alongside theirs. Nothing is assumed from a similar-looking
              product — every configuration traces back to a measurement made on the real stream.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
              {SCIENCE_PATH.map((item) => (
                <div key={item.step} style={{ padding: '28px 26px', background: 'var(--flouv-white)', border: '1px solid var(--flouv-border)' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--flouv-blue)', marginBottom: 8 }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 16.5, fontWeight: 600, margin: '0 0 10px' }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--flouv-text)', lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '40px 44px', background: 'var(--flouv-white)', border: '1px solid var(--flouv-border)', borderLeft: '3px solid var(--flouv-blue)' }}>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 600, margin: '0 0 14px' }}>
                Where the science is actually made
              </h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.75, color: 'var(--flouv-text)', margin: '0 0 14px', maxWidth: 900 }}>
                The platform was developed at Tennessee State University, and our research programme with TSU
                remains the engine behind it — more than 30 peer-reviewed publications now underpin the technology.
                That programme is deliberately open-ended: it exists to discover where non-thermal UV-C can go next,
                not merely to document where it has already been.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.75, color: 'var(--flouv-text)', margin: 0, maxWidth: 900 }}>
                The FloUV Innovation &amp; Science facility in Nashville was built for exactly this kind of discovery
                work — collimated-beam systems, spectrophotometry, microbiology and a pilot 640 LPH reactor under one
                roof, so a novel application can move from optical measurement to a validated configuration without
                ever leaving the building.
              </p>
            </div>
          </div>
        </section>

        {/* CASE STUDY — WHC LABS */}
        <section style={{ padding: '50px 56px' }}>
          <div style={{ maxWidth: 940, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              CASE STUDY · WHC LABS
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, margin: '0 0 22px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              What a collaboration actually looks like
            </h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--flouv-text)', margin: '0 0 16px' }}>
                WHC Labs brought the joint team a biofermentation problem: sterilizing cell culture media. The matrix
              measured 85.55 cm⁻¹ absorbance at 254 nm — dense enough that a specification borrowed from another
              product would have been worthless.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--flouv-text)', margin: '0 0 32px' }}>
                So nobody quoted a system. The two scientific teams characterized the media optically, then ran a
              Salmonella Muenchen challenge across three sequential passes — a 99.4% reduction at a cumulative REF of
              9.24 mJ/cm², establishing an apparent D₁₀ of roughly 4.10 mJ/cm² per log. That dose–response is the
              real deliverable: it sets what a 5-log target needs and lets performance be projected for other
              organisms. The work toward full sterilization duty continues from measured ground.
              </p>

            <div
              style={{
                padding: '30px 32px',
                background: 'var(--flouv-blue-deep)',
                color: 'oklch(0.98 0 0)',
                borderRadius: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 200px',
                gap: 32,
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                  Let’s build the process that doesn’t exist yet
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'oklch(0.85 0.02 260)', margin: '0 0 20px' }}>
                  Every novel process we have built started this way — a measurement on a real stream, and two teams
                  willing to find out. Bring us the problem the industry has learned to live with.
                </p>
                <button
                  onClick={() => setModal('collaboration')}
                  style={{
                    background: 'var(--flouv-green)',
                    color: 'var(--flouv-green-ink)',
                    border: 'none',
                    padding: '14px 26px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Start a collaboration →
                </button>
              </div>
              <WhcLabLogo />
            </div>
          </div>
        </section>

        {/* CASE STUDY — JUICING SYSTEMS */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '50px 56px' }}>
          <div style={{ maxWidth: 940, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              CASE STUDY · JUICING SYSTEMS
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, margin: '0 0 22px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              How an established supplier brought new technology to its customers
            </h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--flouv-text)', margin: '0 0 16px' }}>
                Juicing Systems sells complete juice and cider lines across Canada and the USA, backed by installation,
              service, training, parts and financing. Their founder frames a sale as the start of the relationship
              rather than the end of it — and the offering keeps growing as their customers’ ambitions do.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--flouv-text)', margin: '0 0 32px' }}>
                Thermal pasteurization their catalogue already covered well. What customers increasingly asked for
              was a non-thermal option alongside it — and that is what this collaboration adds. FloUV’s UV-C stage is
              specified, installed, commissioned, serviced and financed as part of the line itself, by the same people
              who build the rest of it. As our exclusive partner for apple cider pasteurization, Juicing Systems now
              brings that choice to hundreds of small producers through the supplier they already work with, while
              FloUV reaches a market it would have taken years to build alone.
              </p>

            <div
              style={{
                padding: '30px 32px',
                background: 'var(--flouv-blue-deep)',
                color: 'oklch(0.98 0 0)',
                borderRadius: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 200px',
                gap: 32,
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                  Bring something new to the customers who already trust you
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'oklch(0.85 0.02 260)', margin: '0 0 20px' }}>
                  If you supply or service equipment in food and beverage processing, FloUV widens what you can offer
                  without changing how you work — innovation your customers get from the people they already call.
                </p>
                <button
                  onClick={() => setModal('distribution')}
                  style={{
                    background: 'var(--flouv-green)',
                    color: 'var(--flouv-green-ink)',
                    border: 'none',
                    padding: '14px 26px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Explore a distribution partnership →
                </button>
              </div>
              <JuicingSystemsLogo />
            </div>
          </div>
        </section>

        {/* CASE STUDY — ELEFQ */}
        <section style={{ padding: '50px 56px' }}>
          <div style={{ maxWidth: 940, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              CASE STUDY · ELEFQ MARKET SOLUTIONS
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, margin: '0 0 22px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              How a consultancy widened what it could offer its network
            </h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--flouv-text)', margin: '0 0 16px' }}>
                ELEFQ Market Solutions works out of Hamburg and Kiel on market access for process technology. Its founders
              bring more than 25 years across European dairy and liquid food processing — including VP-level
              operational responsibility inside a global dairy equipment group — and the network that comes with a
              career spent in those rooms.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--flouv-text)', margin: '0 0 32px' }}>
                As Dirk Dubiel puts it, producers want “two things at once: better products and lower operational costs.”
              Non-thermal UV-C speaks to both, and adopts incrementally — standalone, as a pre-treatment that lightens
              the thermal load, or as a post-treatment step — so nobody has to tear out the plant they already run.
              Since April 2026 ELEFQ has been our exclusive European agent for dairy and first point of contact across
              Europe: a consulting practice built on relationships, now carrying a technology those relationships were
              already asking about.
              </p>

            <div
              style={{
                padding: '30px 32px',
                background: 'var(--flouv-blue-deep)',
                color: 'oklch(0.98 0 0)',
                borderRadius: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 200px',
                gap: 32,
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                  Widen what your advice can deliver
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'oklch(0.85 0.02 260)', margin: '0 0 20px' }}>
                  If you advise processors on liquid handling, thermal load or shelf life, FloUV extends what you can put
                  in front of them — with the validation evidence to back the recommendation.
                </p>
                <button
                  onClick={() => setModal('representation')}
                  style={{
                    background: 'var(--flouv-green)',
                    color: 'var(--flouv-green-ink)',
                    border: 'none',
                    padding: '14px 26px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Talk to us about representation →
                </button>
              </div>
              <ElefqLogos />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: 'linear-gradient(135deg, var(--flouv-blue), var(--flouv-blue-deep))',
            padding: '60px 56px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 40,
              fontWeight: 700,
              margin: '0 0 20px',
              letterSpacing: '-0.01em',
              color: 'oklch(0.98 0 0)',
            }}
          >
            Got any questions?
          </h2>
          <p style={{ fontSize: 17, color: 'oklch(1 0 0 / 0.7)', margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Reach out directly to our leadership team via email or LinkedIn above, or send a general inquiry
            below.
          </p>
          <button
            onClick={() => setModal('general')}
            style={{
              background: 'var(--flouv-green)',
              color: 'var(--flouv-green-ink)',
              border: 'none',
              padding: '17px 34px',
              borderRadius: 3,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
            }}
          >
            Send us a message
          </button>
        </section>
      </div>
      {modal && <InquiryModal mode={modal} onClose={() => setModal(null)} />}
    </Layout>
  );
}
