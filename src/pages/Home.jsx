import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import InquiryModal from '../components/InquiryModal.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import climateImpactImage from '../../uploads/flouv-climate-impact.webp';
import thermalComparisonImage from '../../uploads/thermal-vs-nonthermal.webp';
import lactoferrinImage from '../../uploads/lactoferrin-bioactive.webp';
import liquidsAliveImage from '../../uploads/when-liquid-stays-alive.webp';
import differentiateImage from '../../uploads/differentiate-product.webp';
import heroImage from '../../uploads/home-hero-banner.webp';
import howItWorksImage from '../../uploads/reactor-inside.webp';

export const SUSTAINABILITY_STATS = [
  { value: '~82%', label: 'Lower energy intensity (EEO) than HTST thermal pasteurization' },
  { value: '85–90%', label: 'Lower CO₂ emissions per m³ treated, grid-average electricity' },
  { value: '~60%', label: 'Less water use — no chilled-water loop or thermal CIP cycles' },
  { value: '<2 months', label: 'Typical carbon payback period per installed system' },
];

export const HOW_IT_WORKS = [
  {
    tag: '01 — FLOW',
    title: 'Engineered fluid path',
    body: 'Liquid moves through geometry built for uniform exposure, even in dense, light-scattering products.',
  },
  {
    tag: '02 — EXPOSE',
    title: 'Precision UV-C dose',
    body: 'Pathogens are inactivated at the cellular level — no added heat, no pressure spike.',
  },
  {
    tag: '03 — PRESERVE',
    title: 'Native quality, intact',
    body: 'Proteins stay native, flavor stays true, and nutritional value stays where it started.',
  },
];

export const FLOUV_INSIGHTS = [
  {
    label: 'Product Integrity',
    title: 'When liquids stay alive',
    body: 'With FloUV non-thermal UV-C, liquids move as they should — native proteins remain intact, bioactives stay functional, and quality is preserved without heat, pressure, or disruption.',
    cta: 'Learn more',
    to: '/industries?tab=juices',
    visual: 'Molecular preservation visual — UV-C dose vs. intact proteins',
    image: liquidsAliveImage,
  },
  {
    label: 'Why It Matters',
    title: "Heat solves safety. It also solves away your product's value.",
    body: "Thermal pasteurization denatures heat-sensitive proteins and degrades flavor to hit safety targets. FloUV delivers the same regulatory safety outcome, cold — proteins stay native, flavor stays true.",
    cta: 'Learn more',
    to: '/industries?tab=dairy',
    visual: 'Thermal vs. non-thermal comparison visual',
    image: thermalComparisonImage,
  },
  {
    label: 'Preserving Milk Bioactives',
    title: 'Lactoferrin and IgA, kept functional',
    body: 'Lactoferrin and IgA are heat-sensitive milk bioactives significantly degraded during conventional thermal processing. FloUV preserves up to ~80% of native activity through non-thermal UV-C treatment.',
    cta: 'Request case study',
    report: { kind: 'CASE STUDY', title: 'Lactoferrin and IgA retention in UV-C treated milk' },
    visual: 'Lab / bioactive analysis visual',
    image: lactoferrinImage,
  },
  {
    label: 'Partner With FloUV',
    title: 'Differentiate your products with non-thermal FloUV processing',
    body: 'Liquids flow as they should — moving naturally through the process while being made safe by light, not heat. Retain structure, nutrition, and value, just as intended.',
    cta: 'Talk to our team',
    meeting: true,
    visual: 'Ambient reactor / product visual',
    image: differentiateImage,
  },
];

export const SOLUTIONS = [
  {
    title: 'For processors',
    body: 'Innovate your product line with a non-thermal solution — FloUV drops into dairy, juice, and beverage lines you already run, without a full redesign.',
    accent: 'var(--flouv-blue-soft)',
  },
  {
    title: 'For OEMs & distributors',
    body: 'Expand your portfolio with next-generation liquid processing technology, through a FloUV platform or distribution partnership tailored to your business model.',
    accent: 'var(--flouv-blue-soft)',
  },
];

const INDUSTRY_ICONS = {
  drop: (
    <path d="M20 4C13 13 8 19 8 25a12 12 0 0 0 24 0c0-6-5-12-12-21z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
  ),
  citrus: (
    <>
      <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M20 6v28M6 20h28M10 10l20 20M30 10 10 30" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
    </>
  ),
  bottle: (
    <path
      d="M16 4h8v6.5l3.5 5V33a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V15.5l3.5-5V4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  ),
  flask: (
    <path
      d="M16 4h8v9l8 16a3 3 0 0 1-2.7 4.3H10.7A3 3 0 0 1 8 29l8-16V4z M15 4h10 M12.5 25h15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  capsule: (
    <>
      <rect x="6" y="16" width="28" height="12" rx="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <line x1="20" y1="16" x2="20" y2="28" stroke="currentColor" strokeWidth="2.4" />
    </>
  ),
  can: (
    <>
      <rect x="12" y="7" width="16" height="27" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M12 13h16M12 28h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M17.5 10.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};

const INDUSTRIES = [
  { id: 'dairy', title: 'Dairy', body: 'Milk, whey, bioactive recovery', icon: 'drop' },
  { id: 'juices', title: 'Juices', body: 'Cold-pressed quality at scale', icon: 'citrus' },
  { id: 'beverages', title: 'Beverages', body: 'Next-gen drinks, without heat', icon: 'bottle' },
  { id: 'brewing', title: 'Brewing', body: 'Shelf life without losing freshness', icon: 'can' },
  { id: 'biofermentation', title: 'Biofermentation', body: 'Debottleneck feed sterilization', icon: 'flask' },
  { id: 'water', title: 'Water & AOP', body: 'Advanced oxidation you can prove', icon: 'drop' },
];

export default function Home() {
  const [modal, setModal] = useState(null);

  return (
    <Layout active="Home">
      <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)', color: 'var(--flouv-ink)' }}>
        {/* HERO — full-bleed photo, centered overlay text (Tesla-style) */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: 'clamp(360px, 42vw, 640px)',
            minHeight: 360,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <img
            src={heroImage}
            alt="Dairy chiller, liquid processing line, and cold-pressed juice cooler"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, oklch(0.2 0.1 264 / 0.29) 0%, oklch(0.2 0.1 264 / 0.24) 45%, oklch(0.2 0.1 264 / 0.52) 100%)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px 80px', maxWidth: 780 }}>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 52,
                lineHeight: 1.1,
                fontWeight: 600,
                margin: '0 0 18px',
                letterSpacing: '-0.02em',
                color: 'oklch(1 0 0)',
              }}
            >
              Non-thermal safety for liquids that matter
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.5, color: 'oklch(0.95 0 0)', maxWidth: 560, margin: '0 auto 36px' }}>
              FloUV brings precision UV-C processing to opaque liquids — protecting quality, nutrition, and value.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button
                onClick={() => setModal({ mode: 'meeting' })}
                style={{
                  background: 'var(--flouv-green)',
                  color: 'var(--flouv-green-ink)',
                  border: 'none',
                  padding: '13px 28px',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                }}
              >
                Book a meeting
              </button>
              <Link
                to="/technology"
                style={{
                  background: 'oklch(0.2 0.1 264 / 0.35)',
                  color: 'oklch(1 0 0)',
                  padding: '13px 28px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid oklch(1 0 0 / 0.5)',
                }}
              >
                Discover the Science
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT US TEASER */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '76px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <Link
                to="/about"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--flouv-blue)',
                  textDecoration: 'underline',
                  marginBottom: 16,
                  display: 'inline-block',
                }}
              >
                About us
              </Link>
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 38,
                  fontWeight: 700,
                  margin: '0 0 20px',
                  letterSpacing: '-0.01em',
                  color: 'var(--flouv-blue)',
                }}
              >
                Building the future of non-thermal liquid processing
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 28px', maxWidth: 520 }}>
                FloUV is a non-thermal UV-C processing platform engineered to deliver uniform microbial
                inactivation in opaque and viscous liquids — preserving native proteins, bioactives, and
                functional quality without heat. We're building line-ready technology from validated science,
                not a lab curiosity.
              </p>
              <Link
                to="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--flouv-blue)',
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                Find out more <span>→</span>
              </Link>
            </div>
            <video
              src="/media/flouv-team.mp4"
              autoPlay
              loop
              muted
              playsInline
              aria-label="The FloUV team at work"
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                borderRadius: 16,
                display: 'block',
                background: 'var(--flouv-bg-soft)',
              }}
            />
          </div>
        </section>

        {/* INDUSTRIES TEASER */}
        <section style={{ background: 'var(--flouv-white)', padding: '76px 56px 20px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 48 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
                  WHERE IT RUNS
                </div>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 38, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                  One platform, every liquid line
                </h2>
              </div>
              <Link to="/industries" style={{ color: 'var(--flouv-blue)', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
                All industries →
              </Link>
            </div>
            <div className="industry-band">
              {INDUSTRIES.map((industry, i) => (
                <Link
                  key={industry.id}
                  to={`/industries?tab=${industry.id}`}
                  className="industry-segment"
                  style={{ background: `oklch(${(0.255 + i * 0.045).toFixed(3)} 0.14 264)` }}
                >
                  <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true" style={{ opacity: 0.9 }}>
                    {INDUSTRY_ICONS[industry.icon]}
                  </svg>
                  <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 17,
                        fontWeight: 600,
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {industry.title}
                    </div>
                    <div style={{ fontSize: 12.5, opacity: 0.78, marginTop: 6, lineHeight: 1.45 }}>{industry.body}</div>
                    <div className="industry-arrow" style={{ fontSize: 16, marginTop: 12 }}>
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* OVERVIEW LINK — GEA-style transitional link */}
        <section style={{ background: 'var(--flouv-white)', padding: '0 56px 44px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Link
              to="/technology"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--flouv-blue)',
                textDecoration: 'underline',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <span>+</span> Overview of our product and technology
            </Link>
          </div>
        </section>

        {/* SUSTAINABILITY — GEA-style climate impact block */}
        <section style={{ background: 'var(--flouv-blue-deep)', padding: '76px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 48,
                alignItems: 'center',
                marginBottom: 40,
              }}
            >
              <div>
                <Link
                  to="/about"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--flouv-white)',
                    textDecoration: 'underline',
                    marginBottom: 16,
                    display: 'inline-block',
                  }}
                >
                  Sustainability
                </Link>
                <h2
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 38,
                    fontWeight: 700,
                    margin: '0 0 20px',
                    letterSpacing: '-0.01em',
                    color: 'var(--flouv-white)',
                  }}
                >
                  Decarbonizing pasteurization, without compromising safety
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.88 0.02 260)', margin: '0 0 16px' }}>
                  Thermal pasteurization ties food safety to bulk heating — a structural energy, water, and
                  carbon burden built into every liter processed. Using the Electrical Energy per Order (EEO)
                  framework, FloUV's Climate Impact Study shows non-thermal UV-C delivers the same regulatory
                  5-log kill step at a fraction of the energy, water, and Scope 1 emissions of HTST.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'oklch(0.75 0.02 260)', margin: '0 0 32px' }}>
                  Modeled at global dairy scale, replacing HTST with FloUV UV-C could avoid up to ~1.5 million
                  tonnes of CO₂ annually — equivalent to ~43 million trees planted per year.
                </p>
                <button
                  onClick={() => setModal({ mode: 'report', kind: 'CLIMATE IMPACT STUDY', title: 'FloUV Climate Impact Report' })}
                  style={{
                    background: 'var(--flouv-green)',
                    color: 'var(--flouv-green-ink)',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Request the Full Climate Impact Report
                </button>
              </div>
              <img
                src={climateImpactImage}
                alt="FloUV Climate Impact Study"
                style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 10, display: 'block' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {SUSTAINABILITY_STATS.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '28px 24px',
                    border: '1px solid oklch(0.4 0.08 264 / 0.6)',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 32,
                      fontWeight: 700,
                      color: 'var(--flouv-green)',
                      marginBottom: 10,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'oklch(0.85 0.02 260)', lineHeight: 1.5 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FLOUV INSIGHT — GEA-style insights card grid */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '76px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 38,
                fontWeight: 700,
                margin: '0 0 36px',
                letterSpacing: '-0.01em',
                color: 'var(--flouv-blue)',
              }}
            >
              FloUV Insight
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {FLOUV_INSIGHTS.map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--flouv-white)',
                    border: '1px solid var(--flouv-border)',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.visual}
                      style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <ImagePlaceholder
                      label={item.visual}
                      spec="1200×640 (16:9) · JPEG/WebP"
                      aspectRatio="16 / 9"
                      style={{ borderRadius: 0, border: 'none', borderBottom: '1px dashed var(--flouv-border)' }}
                    />
                  )}
                  <div style={{ padding: 32, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
                      {item.label.toUpperCase()}
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 21,
                        fontWeight: 600,
                        margin: '0 0 12px',
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--flouv-text)', margin: '0 0 20px', flex: 1 }}>
                      {item.body}
                    </p>
                    {item.report ? (
                      <button
                        onClick={() => setModal({ mode: 'report', ...item.report })}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--flouv-blue)',
                          fontSize: 14.5,
                          fontWeight: 700,
                          fontFamily: "'Inter', sans-serif",
                          cursor: 'pointer',
                        }}
                      >
                        {item.cta} →
                      </button>
                    ) : item.meeting ? (
                      <button
                        onClick={() => setModal({ mode: 'meeting' })}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--flouv-blue)',
                          fontSize: 14.5,
                          fontWeight: 700,
                          fontFamily: "'Inter', sans-serif",
                          cursor: 'pointer',
                        }}
                      >
                        {item.cta} →
                      </button>
                    ) : (
                      <Link
                        to={item.to}
                        style={{
                          color: 'var(--flouv-blue)',
                          textDecoration: 'none',
                          fontSize: 14.5,
                          fontWeight: 700,
                        }}
                      >
                        {item.cta} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: 'oklch(0.968 0.016 218)', padding: '76px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 38, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              Three stages, one continuous flow
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center', marginBottom: 72 }}>
            <div>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 16px' }}>
                Harnessing the principles of light–matter interaction and advanced fluid dynamics, Dr. Ankit
                Patras pioneered a new approach to overcome the fundamental limits of conventional UV treatment
                in opaque and viscous liquids.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 16px' }}>
                The FloUV platform integrates this breakthrough science into industrial non-thermal UV-C systems,
                enabling precise, uniform microbial inactivation without heat.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', margin: 0 }}>
                Built on rigorously validated research and translated from laboratory discovery to real-world
                processing, FloUV delivers microbial safety while preserving native proteins, bioactives, and
                functional quality.
              </p>
            </div>
            <img
              src={howItWorksImage}
              alt="Inside a FloUV reactor — serpentine FEP tubing coiled around lit UV-C lamps"
              style={{
                width: '100%',
                height: 480,
                objectFit: 'cover',
                borderRadius: 16,
                boxShadow: '0 26px 60px oklch(0.45 0.10 212 / 0.32)',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              background: 'oklch(0.86 0.045 214)',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 40,
            }}
          >
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.tag}
                style={{
                  padding: '36px 36px 40px',
                  background: 'var(--flouv-white)',
                  borderTop: '3px solid oklch(0.66 0.13 205)',
                }}
              >
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: 'oklch(0.48 0.10 208)', marginBottom: 20 }}>
                  {step.tag}
                </div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 21, fontWeight: 600, margin: '0 0 12px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--flouv-text)', lineHeight: 1.65, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>

          <Link
            to="/technology"
            style={{
              background: 'var(--flouv-green)',
              color: 'var(--flouv-green-ink)',
              padding: '14px 28px',
              borderRadius: 100,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 700,
              display: 'inline-block',
            }}
          >
            Explore the technology
          </Link>
          </div>
        </section>

        {/* SOLUTIONS FOR BRANDS & MANUFACTURERS */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '76px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              PARTNER WITH FLOUV
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 38, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              Solutions for brands and manufacturers
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--flouv-text)', maxWidth: 720, margin: '0 0 36px' }}>
              Whether you're a processor looking to innovate your product line with non-thermal solutions, or
              an OEM or distributor aiming to expand your portfolio with next-generation liquid processing
              technology, we offer FloUV platforms and partnerships tailored to your operational and business
              model.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              {SOLUTIONS.map((solution) => (
                <div
                  key={solution.title}
                  style={{ padding: '30px 26px', background: 'var(--flouv-white)', borderRadius: 10, borderTop: `3px solid ${solution.accent}` }}
                >
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
                    {solution.title}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--flouv-text)', lineHeight: 1.6 }}>{solution.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(160deg, oklch(0.93 0.025 240), oklch(0.89 0.03 235))',
            padding: '84px 56px',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 44,
                fontWeight: 700,
                margin: '0 0 20px',
                letterSpacing: '-0.01em',
                color: 'oklch(0.22 0.035 250)',
              }}
            >
              Got any questions?
            </h2>
            <p style={{ fontSize: 17, color: 'oklch(0.4 0.025 245)', margin: '0 0 12px', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              Ready to unlock new value from your liquid processing operations and gain a competitive edge
              with non-thermal UV-C technology? Let's collaborate to integrate FloUV into your existing
              systems and expand what your product line can deliver.
            </p>
            <p style={{ fontSize: 15, color: 'oklch(0.5 0.02 245)', margin: '0 0 36px' }}>
              Get in touch — we're here to help. Book a meeting with us or reach out directly to our team.
            </p>
            <button
              onClick={() => setModal({ mode: 'meeting' })}
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
                boxShadow: '0 8px 24px oklch(0.55 0.15 154 / 0.3)',
              }}
            >
              Book a meeting
            </button>
          </div>
        </section>
      </div>
      {modal && (
        <InquiryModal mode={modal.mode} title={modal.title} kind={modal.kind} onClose={() => setModal(null)} />
      )}
    </Layout>
  );
}
