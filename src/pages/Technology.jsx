import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const PILLARS = [
  {
    tag: 'BIOLOGY',
    title: 'DNA-level disinfection',
    body: [
      'FloUV uses non-thermal UV-C light to inactivate microorganisms at the molecular level by directly targeting their DNA and RNA. When microbes are exposed to UV-C wavelengths, the energy induces the formation of thymine and pyrimidine dimers in their genetic material, disrupting the replication and transcription pathways essential for cell survival.',
      'By preventing microorganisms from reproducing and repairing themselves, FloUV renders bacteria, yeasts, molds, and viruses non-viable — achieving microbial safety without heat or chemicals. This DNA-level mechanism allows milk and other complex liquids to be processed safely while preserving native proteins, bioactives, and functional quality that are otherwise degraded during thermal treatment.',
    ],
    accent: 'oklch(0.55 0.19 295)',
  },
  {
    tag: 'CHEMISTRY',
    title: 'No thermal stress, no degradation',
    body: [
      'FloUV preserves food chemistry by achieving microbial safety without thermal stress — the primary driver of nutrient and bioactive loss in conventional processing. By avoiding high temperatures, it minimizes protein denaturation and aggregation, reduces heat-accelerated oxidation pathways that degrade sensitive bioactives, and limits reactions such as Maillard browning that alter flavor and nutritional quality.',
      "Because the process is non-thermal and tightly controlled, the liquid's key compositional attributes — native proteins, bioactive fractions, and heat-sensitive quality markers — stay substantially closer to their original, fresh-liquid profile.",
    ],
    accent: 'oklch(0.6 0.09 230)',
  },
  {
    tag: 'PHYSICS',
    title: 'Hydrodynamics that make dose uniform',
    body: [
      'FloUV applies advanced hydrodynamic engineering to control how liquids move, mix, and interact with UV-C light inside the reactor. At its core is a patented serpentine flow-path design, engineered to create controlled turbulence and continuous radial mixing in opaque and viscous liquids — bringing every fluid element repeatedly into the exposure zone and eliminating the channeling and stagnant regions common in conventional UV systems.',
      'By precisely controlling residence time, flow velocity, and exposure geometry, FloUV delivers a uniform, quantifiable UV-C dose across the entire liquid volume — enabling repeatable, validated microbial inactivation without heat, pressure, or chemical intervention, while avoiding overexposure.',
    ],
    accent: 'oklch(0.55 0.19 295)',
  },
];

const APPLICATIONS_LIST = [
  'Raw and specialty milk processing',
  'Bioactive ingredient streams (lactoferrin, IgA, whey fractions)',
  'Beverages, juices, and functional liquids',
  'Sugar syrups and process ingredients',
];

const HOW_IT_WORKS = [
  {
    tag: 'STEP 1',
    title: 'A UV-transparent, closed flow path',
    body: 'Liquid enters the reactor and flows through UV-C–transmissive FEP tubing, selected for its high optical clarity at germicidal wavelengths, chemical inertness, and food-grade performance. The tubing forms a closed, hygienic pathway that maintains laminar-to-controlled transitional flow depending on the viscosity and throughput of the application.',
  },
  {
    tag: 'STEP 2',
    title: 'Serpentine geometry, engineered for mixing',
    body: 'The FEP tubing is wound around a structural support with a defined curvature and serpentine configuration. That geometry induces secondary flow and continuous radial mixing inside the tube, preventing channeling and stagnant zones — fluid elements are repeatedly displaced toward the tubing wall and back into the bulk stream, so microorganisms cannot bypass the treatment zone.',
  },
  {
    tag: 'STEP 3',
    title: 'A calculated dose at the tubing wall',
    body: 'High-intensity UV-C lamps are positioned around the tubing coil, with spacing, orientation, and distance engineered to deliver a known irradiance profile at the inner wall. UV-C photons transmit through the tubing and into the flowing liquid, exposing microorganisms to a controlled cumulative dose defined by flow rate, tubing length, and lamp output — repeatable inactivation without heat, pressure, or chemicals.',
  },
];

const VALUE_PROPS = [
  {
    title: 'Superior microbial disinfection',
    body: 'Validated, non-thermal UV-C inactivation of vegetative cells, pathogens, yeast, molds, viruses, and heat-resistant spores, plus photochemical degradation of select mycotoxins — meeting FDA HACCP expectations with a 5–7 log pathogen reduction, without heat or chemicals.',
  },
  {
    title: 'Gentle preservation',
    body: 'No heat, no pressure, no chemicals — natural taste, nutrition, and functionality are preserved. Heat-sensitive bioactives (vitamins, polyphenols, amino acids) are protected, oxidative enzyme activity is minimized, and native flavor and aroma are retained as a cold-process alternative to thermal and HPP technologies.',
  },
  {
    title: 'High flow-through, energy efficient',
    body: 'Unlike batch-based High-Pressure Pasteurization, FloUV runs as a continuous, inline flow-through system at throughput comparable to HTST — without heat. It reaches 100% yield with no rejection, since liquid is treated directly with no membranes, hold tanks, or batching. No moving parts, minimal maintenance, and CIP cycles typically every 24 hours make it easy to retrofit into existing lines.',
  },
];

const APPLICATIONS_CARDS = [
  {
    title: 'FloUV for juices',
    body: 'Pasteurization-equivalent safety for juices, without heat. Engineered for opaque and turbid liquids, the platform protects freshness, nutrition, and flavor while dramatically reducing energy use and processing stress.',
    accent: 'oklch(0.6 0.09 230)',
  },
  {
    title: 'FloUV for dairy',
    body: "A next-generation, non-thermal UV-C milk treatment technology built to deliver food-safety performance without compromising milk's natural quality. Unlike heat pasteurization, FloUV delivers UV-C energy precisely through opaque milk to inactivate pathogens and spoilage organisms, while preserving bioactive proteins, flavor, and nutritional integrity.",
    accent: 'oklch(0.55 0.19 295)',
  },
  {
    title: 'FloUV for plant-based beverages',
    body: 'Non-thermal UV-C pasteurization for oat, almond, soy, and other plant-based beverages — pasteurization-equivalent safety while preserving fresh taste, light color, and nutrition, with up to 90% lower energy use than heat.',
    accent: 'oklch(0.6 0.09 230)',
  },
];

const VALIDATION_TOPICS = [
  {
    title: 'Scientific validation methodology',
    body: 'Every claim behind FloUV is backed by dose-response modeling, biodosimetry, and Reduction Equivalent Fluence (REF) analysis — the same rigor used to validate UV-C performance in opaque liquids, producing repeatable, auditable microbial-safety data rather than a single lab result.',
  },
  {
    title: 'Engineering for opaque liquids',
    body: "FloUV's flow design solves UV-C's biggest limitation — light that can't reach the core of an opaque stream. The result is uniform microbial lethality delivered at lower energy, with measurably better quality retention than straight-line UV exposure.",
  },
];

export default function Technology() {
  return (
    <Layout active="Technology">
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: 'oklch(0.985 0.004 250)', color: 'oklch(0.22 0.01 250)' }}>
        {/* HERO */}
        <section
          style={{
            background: 'linear-gradient(180deg, oklch(0.96 0.006 250) 0%, oklch(0.93 0.008 255) 100%)',
            padding: '90px 56px 70px',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 16 }}>
              BIOLOGY · CHEMISTRY · PHYSICS
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 54,
                lineHeight: 1.1,
                fontWeight: 700,
                margin: '0 0 24px',
                letterSpacing: '-0.02em',
                color: 'oklch(0.16 0.03 265)',
              }}
            >
              Precision UV-C processing for complex liquids
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'oklch(0.4 0.01 260)', maxWidth: 680, margin: '0 auto' }}>
              FloUV applies advanced UV-C science and fluid-dynamics engineering to deliver uniform microbial
              inactivation in opaque and viscous liquids — without heat, pressure, or chemical compromise. The
              result is precise safety control while preserving native proteins, bioactives, and functional
              quality.
            </p>
          </div>
        </section>

        {/* THREE PILLARS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '110px 56px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {PILLARS.map((pillar) => (
              <div
                key={pillar.tag}
                style={{ padding: '36px 36px 32px', borderTop: `3px solid ${pillar.accent}`, background: 'oklch(0.99 0.002 250)' }}
              >
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: pillar.accent, marginBottom: 14 }}>
                  {pillar.tag}
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: '0 0 12px' }}>
                  {pillar.title}
                </h3>
                {pillar.body.map((para, i) => (
                  <p key={i} style={{ fontSize: 14.5, color: 'oklch(0.4 0.01 250)', lineHeight: 1.65, margin: i === 0 ? '0 0 14px' : 0 }}>
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* PROCESS OVERVIEW */}
        <section style={{ background: 'oklch(0.16 0.02 260)', padding: '110px 56px', color: 'oklch(0.95 0.005 250)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.75 0.15 295)', marginBottom: 12 }}>
                A CONTROLLED PATHWAY FOR MICROBIAL INACTIVATION
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
                What it is, really
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.75 0.02 260)', margin: '0 0 16px' }}>
                FloUV is built around a simple but powerful idea: microbial safety is achieved not by forcing
                liquids through heat or pressure, but by guiding every part of the liquid through a precisely
                controlled UV-C exposure pathway.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.75 0.02 260)', margin: '0 0 16px' }}>
                In conventional systems, liquids tend to follow the path of least resistance, leaving portions
                under-treated. FloUV overcomes this with a patented serpentine flow architecture that
                continuously redistributes the liquid, so microorganisms are repeatedly and uniformly exposed
                to germicidal UV-C light.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.75 0.02 260)', margin: '0 0 28px' }}>
                As microbes travel through this engineered pathway, UV-C light disrupts their DNA and RNA,
                preventing replication and rendering them non-viable. The process is non-thermal, non-chemical,
                and repeatable — delivering microbial safety while preserving the native chemistry, bioactives,
                and functionality of the liquid.
              </p>
              <p style={{ fontSize: 15, fontStyle: 'italic', color: 'oklch(0.85 0.1 295)', margin: 0 }}>
                FloUV doesn't force liquids to change — it guides them safely through light.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.7 0.02 260)', marginBottom: 16 }}>
                WHERE IT'S APPLIED TODAY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {APPLICATIONS_LIST.map((item) => (
                  <div
                    key={item}
                    style={{
                      fontSize: 15,
                      color: 'oklch(0.92 0.01 260)',
                      padding: '14px 18px',
                      background: 'oklch(0.2 0.02 260)',
                      border: '1px solid oklch(0.3 0.02 260)',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TECHNICAL DEEP DIVE — COMPARISON */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '110px 56px' }}>
          <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 56px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
              WHY CONVENTIONAL UV FALLS SHORT
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              UV-C, re-engineered for opaque liquids
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.75, color: 'oklch(0.4 0.01 260)', margin: 0, textAlign: 'left' }}>
              Conventional UV systems work well in water because high UV transmittance lets photons penetrate
              the entire fluid volume — dose becomes largely a function of lamp output and residence time. In
              opaque liquids, absorption and scattering collapse that photon penetration down to the boundary,
              leaving the fluid core under-treated and the dose non-uniform. FloUV resolves this by reversing
              the logic: instead of forcing light into the liquid, it engineers helical flow and Dean
              vortex–driven circulation to repeatedly move every micro-volume of liquid to the illuminated
              surface — enabling uniform, validated UV-C dose delivery independent of optical opacity.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            <div style={{ padding: 32, background: 'oklch(0.2 0.02 260)', border: '1px solid oklch(0.3 0.02 260)' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: 'oklch(0.7 0.02 260)', marginBottom: 12 }}>
                Conventional UV — straight-line exposure
              </div>
              <p style={{ fontSize: 14, color: 'oklch(0.65 0.02 260)', lineHeight: 1.6, margin: 0 }}>
                Dose is a function of lamp output and residence time alone — liquid that never gets close
                enough to the light never receives a full dose.
              </p>
            </div>
            <div style={{ padding: 32, background: 'oklch(0.24 0.04 260)', border: '1px solid oklch(0.5 0.1 295 / 0.5)' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: 'oklch(0.85 0.1 295)', marginBottom: 12 }}>
                FloUV — helical, Dean-vortex flow
              </div>
              <p style={{ fontSize: 14, color: 'oklch(0.92 0.01 260)', lineHeight: 1.6, margin: 0 }}>
                Continuous mixing rotates every parcel of liquid through the exposure zone, dose after dose,
                independent of optical opacity.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 56px 110px' }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
              INSIDE THE SYSTEM
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              From tubing to dose, three engineered stages
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, background: 'oklch(0.9 0.005 250)' }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.tag} style={{ padding: '40px 30px', background: 'oklch(0.985 0.004 250)' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: 'oklch(0.6 0.09 230)', marginBottom: 20 }}>
                  {step.tag}
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 12px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14.5, color: 'oklch(0.4 0.01 250)', lineHeight: 1.65, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VALUE PROPOSITION */}
        <section style={{ background: 'oklch(0.965 0.006 250)', padding: '110px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
              THE FLOUV VALUE PROPOSITION
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 56px', letterSpacing: '-0.01em' }}>
              What that engineering actually buys you
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {VALUE_PROPS.map((prop) => (
                <div key={prop.title} style={{ padding: 36, background: 'oklch(0.985 0.004 250)', border: '1px solid oklch(0.9 0.005 250)' }}>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 14px' }}>
                    {prop.title}
                  </h3>
                  <p style={{ fontSize: 14.5, color: 'oklch(0.4 0.01 250)', lineHeight: 1.65, margin: 0 }}>{prop.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALIDATION & METHODOLOGY */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '110px 56px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
            SCIENTIFIC RIGOR
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            Validated, not just claimed
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.4 0.01 250)', maxWidth: 760, margin: '0 0 48px' }}>
            Every performance claim behind FloUV is backed by a repeatable, auditable validation process — not
            a single demo run.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {VALIDATION_TOPICS.map((topic) => (
              <div key={topic.title} style={{ padding: 32, border: '1px solid oklch(0.9 0.005 250)' }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 12px' }}>
                  {topic.title}
                </h3>
                <p style={{ fontSize: 15, color: 'oklch(0.4 0.01 250)', lineHeight: 1.65, margin: 0 }}>{topic.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* APPLICATIONS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 56px 110px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 12 }}>
            FLOUV APPLICATIONS
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 56px', letterSpacing: '-0.01em' }}>
            Same platform, tuned per product
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {APPLICATIONS_CARDS.map((card) => (
              <div
                key={card.title}
                style={{ padding: '30px 26px', background: 'oklch(0.985 0.004 250)', borderTop: `3px solid ${card.accent}` }}
              >
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 14, color: 'oklch(0.45 0.01 250)', lineHeight: 1.6 }}>{card.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTO PROFILE */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 56px 110px' }}>
          <div style={{ padding: 48, background: 'oklch(0.965 0.006 250)' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, marginBottom: 4 }}>
              Dr. Ankit Patras
            </div>
            <div style={{ fontSize: 14, color: 'oklch(0.45 0.01 250)' }}>
              Chief Technology Officer — leads FloUV's UV-C engineering and scientific validation work.
            </div>
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
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.75 0.15 295)', marginBottom: 16 }}>
            TECHNOLOGY CONTACT
          </div>
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
            Have a technical question?
          </h2>
          <p style={{ fontSize: 17, color: 'oklch(0.75 0.02 260)', margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            For any enquiries or questions regarding our technology and related projects, contact our Deep
            Tech department or book a meeting.
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
            }}
          >
            Book a Meeting
          </Link>
        </section>
      </div>
    </Layout>
  );
}
