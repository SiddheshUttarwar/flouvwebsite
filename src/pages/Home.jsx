import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const HOW_IT_WORKS = [
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

const THERMAL_CONS = [
  'Denatures heat-sensitive proteins',
  'Alters flavor and aroma compounds',
  'High energy demand, cooldown cycles',
  'Degrades lactoferrin, IgA activity',
];

const FLOUV_PROS = [
  'Proteins remain native and functional',
  'Flavor and aroma stay true to fresh',
  '10x lower energy, no cooldown wait',
  'Retains ~80% of bioactive activity',
];

const PERFORMANCE = [
  {
    title: 'Process efficiency',
    body: 'FloUV delivers precise, non-thermal UV-C treatment with low energy demand — reducing thermal load, preserving product value, and improving overall operational efficiency in complex liquid processing.',
    swatch: 'oklch(0.94 0.03 295)',
    dot: { shape: 'bar', color: 'oklch(0.55 0.19 295)' },
  },
  {
    title: 'Easy integration',
    body: 'FloUV is designed for seamless integration into existing processing lines, working alongside thermal, membrane, and aseptic systems. Our team provides end-to-end technical support, from system integration and commissioning to validation and scale-up.',
    swatch: 'oklch(0.93 0.03 230)',
    dot: { shape: 'square', color: 'oklch(0.6 0.09 230)' },
  },
];

const SOLUTIONS = [
  {
    title: 'For processors',
    body: 'Innovate your product line with a non-thermal solution — FloUV drops into dairy, juice, and beverage lines you already run, without a full redesign.',
    accent: 'oklch(0.55 0.19 295)',
  },
  {
    title: 'For OEMs & distributors',
    body: 'Expand your portfolio with next-generation liquid processing technology, through a FloUV platform or distribution partnership tailored to your business model.',
    accent: 'oklch(0.6 0.09 230)',
  },
];

const INDUSTRIES = [
  { title: 'Dairy', body: 'Milk, whey, bioactive recovery', accent: 'oklch(0.55 0.19 295)' },
  { title: 'Juice & beverage', body: 'Cold-pressed quality at scale', accent: 'oklch(0.6 0.09 230)' },
  { title: 'Functional ingredients', body: 'Protect potency, not just safety', accent: 'oklch(0.55 0.19 295)' },
  { title: 'Water & syrups', body: 'High-throughput microbial control', accent: 'oklch(0.6 0.09 230)' },
];

function BenefitDot({ dot }) {
  const base = { flexShrink: 0 };
  if (dot.shape === 'circle') {
    return <span style={{ ...base, width: 16, height: 16, borderRadius: '50%', background: dot.color }} />;
  }
  if (dot.shape === 'square') {
    return <span style={{ ...base, width: 16, height: 16, borderRadius: 3, background: dot.color }} />;
  }
  if (dot.shape === 'bar') {
    return <span style={{ ...base, width: 16, height: 4, borderRadius: 2, background: dot.color }} />;
  }
  return <span style={{ ...base, width: 12, height: 12, border: `2px solid ${dot.color}`, borderRadius: '50%' }} />;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const ask = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate('/answer?q=' + encodeURIComponent(trimmed));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') ask();
  };

  return (
    <Layout active="Home">
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: 'oklch(0.985 0.004 250)', color: 'oklch(0.22 0.01 250)' }}>
        {/* HERO */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, oklch(0.96 0.006 250) 0%, oklch(0.93 0.008 255) 100%)',
            padding: '90px 56px 100px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'repeating-linear-gradient(120deg, oklch(0.9 0.005 255 / 0.5) 0px, oklch(0.9 0.005 255 / 0.5) 2px, transparent 2px, transparent 90px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-8%',
              width: '55%',
              height: '70%',
              background: 'radial-gradient(circle, oklch(0.75 0.14 295 / 0.28), transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-15%',
              left: '10%',
              width: '40%',
              height: '60%',
              background: 'radial-gradient(circle, oklch(0.78 0.1 230 / 0.22), transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ maxWidth: 760, margin: '0 auto 0 0', paddingTop: 20 }}>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 66,
                  lineHeight: 1.05,
                  fontWeight: 700,
                  margin: '0 0 24px',
                  letterSpacing: '-0.02em',
                  color: 'oklch(0.16 0.03 265)',
                }}
              >
                Non-thermal safety for liquids that matter
              </h1>
              <p style={{ fontSize: 19, lineHeight: 1.6, color: 'oklch(0.4 0.01 260)', maxWidth: 520, margin: '0 0 40px' }}>
                FloUV brings precision UV-C processing to opaque liquids — protecting quality, nutrition, and value.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <Link
                  to="/about"
                  style={{
                    background: 'oklch(0.18 0.02 260)',
                    color: 'oklch(0.98 0.005 250)',
                    padding: '16px 30px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: '0 10px 26px oklch(0.3 0.05 290 / 0.3)',
                  }}
                >
                  Book a demo
                </Link>
                <Link
                  to="/technology"
                  style={{
                    background: 'oklch(1 0 0 / 0.6)',
                    color: 'oklch(0.18 0.02 260)',
                    padding: '16px 30px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    border: '1px solid oklch(0.85 0.005 255)',
                  }}
                >
                  Discover the Science
                </Link>
              </div>
            </div>

            {/* glossy flowing tube visual */}
            <div style={{ position: 'relative', height: 380, marginTop: 70 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 30,
                  left: '5%',
                  width: '90%',
                  height: 60,
                  borderRadius: 30,
                  background: 'linear-gradient(180deg, oklch(0.99 0.002 250), oklch(0.85 0.02 290))',
                  boxShadow:
                    '0 0 0 1px oklch(1 0 0 / 0.8) inset, 0 20px 50px oklch(0.5 0.15 295 / 0.35), 0 0 60px oklch(0.7 0.18 295 / 0.4)',
                  animation: 'flouv-pulse 3.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 110,
                  left: '15%',
                  width: '70%',
                  height: 60,
                  borderRadius: 30,
                  background: 'linear-gradient(180deg, oklch(0.99 0.002 250), oklch(0.82 0.03 235))',
                  boxShadow:
                    '0 0 0 1px oklch(1 0 0 / 0.8) inset, 0 20px 50px oklch(0.55 0.1 235 / 0.3), 0 0 60px oklch(0.75 0.13 235 / 0.35)',
                  animation: 'flouv-pulse 3.5s ease-in-out infinite 0.6s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 190,
                  left: '8%',
                  width: '84%',
                  height: 60,
                  borderRadius: 30,
                  background: 'linear-gradient(180deg, oklch(0.99 0.002 250), oklch(0.84 0.02 290))',
                  boxShadow:
                    '0 0 0 1px oklch(1 0 0 / 0.8) inset, 0 20px 50px oklch(0.5 0.15 295 / 0.3), 0 0 60px oklch(0.7 0.18 295 / 0.35)',
                  animation: 'flouv-pulse 3.5s ease-in-out infinite 1.2s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 270,
                  left: '20%',
                  width: '60%',
                  height: 60,
                  borderRadius: 30,
                  background: 'linear-gradient(180deg, oklch(0.99 0.002 250), oklch(0.82 0.03 235))',
                  boxShadow:
                    '0 0 0 1px oklch(1 0 0 / 0.8) inset, 0 20px 50px oklch(0.55 0.1 235 / 0.3), 0 0 60px oklch(0.75 0.13 235 / 0.35)',
                  animation: 'flouv-pulse 3.5s ease-in-out infinite 1.8s',
                }}
              />
            </div>
          </div>
        </section>

        {/* ASK FLOUV */}
        <section style={{ maxWidth: 900, margin: '-30px auto 0', padding: '0 56px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              background: 'oklch(0.99 0.002 250 / 0.9)',
              backdropFilter: 'blur(14px)',
              border: '1px solid oklch(1 0 0 / 0.7)',
              borderRadius: 20,
              padding: 8,
              boxShadow: '0 20px 50px oklch(0.4 0.02 260 / 0.14)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 8px 6px 22px' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.55 0.19 295)', flexShrink: 0 }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask FloUV anything — e.g. does this work on whole milk?"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 16,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: 'oklch(0.2 0.01 260)',
                  padding: '12px 0',
                }}
              />
              <button
                onClick={ask}
                style={{
                  background: 'oklch(0.18 0.02 260)',
                  color: 'oklch(0.98 0.005 250)',
                  border: 'none',
                  borderRadius: 100,
                  padding: '13px 26px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                Ask
              </button>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section style={{ borderBottom: '1px solid oklch(0.9 0.005 250)', padding: '28px 56px' }}>
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 56,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: 'oklch(0.55 0.01 250)' }}>
              BACKED BY INDIEBIO &amp; SOSV
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(0.8 0.005 250)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: 'oklch(0.55 0.01 250)' }}>
              PILOT UNITS SHIPPED IN 90 DAYS
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(0.8 0.005 250)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: 'oklch(0.55 0.01 250)' }}>
              VALIDATED ACROSS DAIRY, JUICE &amp; BEVERAGE
            </span>
          </div>
        </section>

        {/* OVERVIEW */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '110px 56px 0', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 38,
              fontWeight: 700,
              margin: '0 0 28px',
              letterSpacing: '-0.01em',
            }}
          >
            When liquids stay alive
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'oklch(0.35 0.01 260)', margin: '0 0 24px' }}>
            With FloUV non-thermal UV-C processing, liquids move as they should — flowing naturally while
            being made safe, without heat, pressure, or disruption.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'oklch(0.35 0.01 260)', margin: '0 0 24px' }}>
            Native proteins remain intact, bioactives stay functional, and quality is preserved — allowing
            liquids to retain their natural structure, nutrition, and value.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'oklch(0.45 0.01 250)', margin: 0 }}>
            FloUV is a non-thermal UV-C processing platform engineered to deliver uniform microbial
            inactivation in opaque and viscous liquids. By integrating precise UV-C dose control with
            advanced fluid-dynamics design, FloUV achieves safety targets without heat — preserving native
            proteins, bioactives, and functional quality.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '110px 56px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
                HOW IT WORKS
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                Three stages, one continuous flow
              </h2>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              background: 'oklch(0.9 0.005 250)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {HOW_IT_WORKS.map((step) => (
              <div key={step.tag} style={{ padding: '40px 36px', background: 'oklch(0.985 0.004 250)' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: 'oklch(0.6 0.09 230)', marginBottom: 20 }}>
                  {step.tag}
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 600, margin: '0 0 12px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: 'oklch(0.4 0.01 250)', lineHeight: 1.65, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON */}
        <section style={{ background: 'oklch(0.16 0.02 260)', padding: '110px 56px', color: 'oklch(0.95 0.005 250)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.75 0.15 295)', marginBottom: 12 }}>
              WHY IT MATTERS
            </div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 38,
                fontWeight: 700,
                margin: '0 0 56px',
                letterSpacing: '-0.01em',
                maxWidth: 640,
              }}
            >
              Heat solves safety. It also solves away your product's value.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              <div style={{ padding: 40, borderRadius: 12, background: 'oklch(0.2 0.02 260)', border: '1px solid oklch(0.3 0.02 260)' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'oklch(0.7 0.02 260)' }}>
                  Thermal pasteurization
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, color: 'oklch(0.65 0.02 260)' }}>
                  {THERMAL_CONS.map((line) => (
                    <div key={line}>✕ {line}</div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  padding: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(160deg, oklch(0.3 0.06 290), oklch(0.24 0.04 260))',
                  border: '1px solid oklch(0.5 0.1 295 / 0.5)',
                }}
              >
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'oklch(0.85 0.1 295)' }}>
                  FloUV non-thermal UV-C
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, color: 'oklch(0.92 0.01 260)' }}>
                  {FLOUV_PROS.map((line) => (
                    <div key={line}>✓ {line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MID CTA */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, oklch(0.18 0.025 255), oklch(0.22 0.06 290))',
            padding: '110px 56px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '30%',
              width: '50%',
              height: '100%',
              background: 'radial-gradient(circle, oklch(0.6 0.2 295 / 0.35), transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 40,
                fontWeight: 700,
                margin: '0 0 20px',
                letterSpacing: '-0.01em',
                color: 'oklch(0.98 0.005 250)',
                maxWidth: 760,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Differentiate your products with non-thermal FloUV processing
            </h2>
            <p style={{ fontSize: 17, color: 'oklch(0.75 0.02 260)', margin: '0 0 36px', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              With FloUV, liquids flow as they should — moving naturally through the process while being made
              safe by light, not heat. Proteins remain native, bioactives stay functional, and quality is
              preserved, allowing liquids to retain their structure, nutrition, and value — just as intended.
            </p>
            <Link
              to="/about"
              style={{
                background: 'oklch(0.98 0.005 250)',
                color: 'oklch(0.16 0.02 260)',
                padding: '17px 34px',
                borderRadius: 3,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 700,
                display: 'inline-block',
                boxShadow: '0 8px 24px oklch(0 0 0 / 0.3)',
              }}
            >
              Talk to our team
            </Link>
          </div>
        </section>

        {/* BIOACTIVE CASE STUDY */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '110px 56px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
                PRESERVING MILK BIOACTIVES
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
                Lactoferrin and IgA, kept functional
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.4 0.01 250)', margin: '0 0 28px' }}>
                Lactoferrin and IgA are heat-sensitive milk bioactives that are significantly degraded during
                conventional thermal processing due to protein denaturation. FloUV preserves these bioactives
                by achieving microbial safety without heat, maintaining up to ~80% of native lactoferrin and
                IgA activity through non-thermal UV-C treatment.
              </p>
              <Link
                to="/about"
                style={{
                  background: 'oklch(0.18 0.02 260)',
                  color: 'oklch(0.98 0.005 250)',
                  padding: '14px 28px',
                  borderRadius: 100,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'inline-block',
                }}
              >
                Request Case Study
              </Link>
            </div>
            <div style={{ padding: 48, borderRadius: 16, background: 'oklch(0.965 0.006 250)', position: 'relative' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 56, lineHeight: 1, color: 'oklch(0.55 0.19 295 / 0.3)', marginBottom: 8 }}>
                "
              </div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 22,
                  lineHeight: 1.45,
                  fontWeight: 500,
                  margin: '0 0 20px',
                  letterSpacing: '-0.01em',
                }}
              >
                Learn how FloUV preserves milk bioactives through non-thermal processing — and how progressive
                dairy processors are leveraging this capability to develop value-added products such as
                lactoferrin and IgA while maintaining native functionality.
              </p>
              <div style={{ fontSize: 14, color: 'oklch(0.45 0.01 250)', fontWeight: 600 }}>
                Preserving Milk Bioactive — case study
              </div>
            </div>
          </div>
        </section>

        {/* PERFORMANCE MATTERS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 56px 110px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
            PERFORMANCE MATTERS
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 700, margin: '0 0 56px', letterSpacing: '-0.01em' }}>
            Not a lab curiosity — a line-ready platform
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
            {PERFORMANCE.map((benefit) => (
              <div key={benefit.title} style={{ padding: 36, border: '1px solid oklch(0.9 0.005 250)', borderRadius: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: benefit.swatch,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <BenefitDot dot={benefit.dot} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 10px' }}>
                  {benefit.title}
                </h3>
                <p style={{ fontSize: 15, color: 'oklch(0.4 0.01 250)', lineHeight: 1.6, margin: 0 }}>{benefit.body}</p>
              </div>
            ))}
          </div>
          <Link to="/technology" style={{ color: 'oklch(0.55 0.19 295)', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
            Visit Technology →
          </Link>
        </section>

        {/* SOLUTIONS FOR BRANDS & MANUFACTURERS */}
        <section style={{ background: 'oklch(0.965 0.006 250)', padding: '110px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
              PARTNER WITH FLOUV
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              Solutions for brands and manufacturers
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.4 0.01 250)', maxWidth: 720, margin: '0 0 48px' }}>
              Whether you're a processor looking to innovate your product line with non-thermal solutions, or
              an OEM or distributor aiming to expand your portfolio with next-generation liquid processing
              technology, we offer FloUV platforms and partnerships tailored to your operational and business
              model.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              {SOLUTIONS.map((solution) => (
                <div
                  key={solution.title}
                  style={{ padding: '30px 26px', background: 'oklch(0.985 0.004 250)', borderRadius: 10, borderTop: `3px solid ${solution.accent}` }}
                >
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
                    {solution.title}
                  </div>
                  <div style={{ fontSize: 14, color: 'oklch(0.45 0.01 250)', lineHeight: 1.6 }}>{solution.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRIES TEASER */}
        <section style={{ background: 'oklch(0.965 0.006 250)', padding: '110px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 48 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
                  WHERE IT RUNS
                </div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                  One platform, every liquid line
                </h2>
              </div>
              <Link to="/industries" style={{ color: 'oklch(0.55 0.19 295)', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
                All industries →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {INDUSTRIES.map((industry) => (
                <div
                  key={industry.title}
                  style={{
                    padding: '30px 26px',
                    background: 'oklch(0.985 0.004 250)',
                    borderRadius: 10,
                    borderTop: `3px solid ${industry.accent}`,
                  }}
                >
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
                    {industry.title}
                  </div>
                  <div style={{ fontSize: 14, color: 'oklch(0.45 0.01 250)', lineHeight: 1.5 }}>{industry.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TECHNOLOGY TEASER */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '110px 56px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
            THE SCIENCE BEHIND FLOUV
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
            From lab discovery to line-ready platform
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'oklch(0.4 0.01 260)', margin: '0 0 16px' }}>
            Harnessing the principles of light–matter interaction and advanced fluid dynamics, Dr. Ankit
            Patras pioneered a new approach to overcome the fundamental limits of conventional UV treatment
            in opaque and viscous liquids.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'oklch(0.4 0.01 260)', margin: '0 0 16px' }}>
            The FloUV platform integrates this breakthrough science into industrial non-thermal UV-C systems,
            enabling precise, uniform microbial inactivation without heat.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'oklch(0.4 0.01 260)', margin: '0 0 32px' }}>
            Built on rigorously validated research and translated from laboratory discovery to real-world
            processing, FloUV delivers microbial safety while preserving native proteins, bioactives, and
            functional quality.
          </p>
          <Link
            to="/technology"
            style={{
              background: 'oklch(0.18 0.02 260)',
              color: 'oklch(0.98 0.005 250)',
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
        </section>

        {/* CTA */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, oklch(0.18 0.025 255), oklch(0.22 0.06 290))',
            padding: '120px 56px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '30%',
              width: '50%',
              height: '100%',
              background: 'radial-gradient(circle, oklch(0.6 0.2 295 / 0.35), transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 44,
                fontWeight: 700,
                margin: '0 0 20px',
                letterSpacing: '-0.01em',
                color: 'oklch(0.98 0.005 250)',
              }}
            >
              Got any questions?
            </h2>
            <p style={{ fontSize: 17, color: 'oklch(0.75 0.02 260)', margin: '0 0 12px', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              Ready to unlock new value from your liquid processing operations and gain a competitive edge
              with non-thermal UV-C technology? Let's collaborate to integrate FloUV into your existing
              systems and expand what your product line can deliver.
            </p>
            <p style={{ fontSize: 15, color: 'oklch(0.6 0.02 260)', margin: '0 0 36px' }}>
              Get in touch — we're here to help. Book a meeting with us or reach out directly to our team.
            </p>
            <Link
              to="/about"
              style={{
                background: 'oklch(0.98 0.005 250)',
                color: 'oklch(0.16 0.02 260)',
                padding: '17px 34px',
                borderRadius: 3,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 700,
                display: 'inline-block',
                boxShadow: '0 8px 24px oklch(0 0 0 / 0.3)',
              }}
            >
              Book a meeting
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
