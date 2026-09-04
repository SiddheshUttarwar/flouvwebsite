import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import InquiryModal from '../components/InquiryModal.jsx';
import techHeroBanner from '../../uploads/tech-hero-banner.webp';
import reactor650 from '../../uploads/reactor-650.jpg';
import reactor2000 from '../../uploads/reactor-2000.jpg';
import reactor2500 from '../../uploads/reactor-2500.jpg';

const STANDARD_RANGE = [
  {
    image: reactor650,
    cells: 'ONE CELL',
    model: 'FloUV 640',
    flow: '~640 LPH',
    body: 'The validated reactor cell on its own. Every dose figure FloUV quotes is established on this unit, which is why it doubles as the pilot and validation machine.',
  },
  {
    image: reactor2000,
    cells: 'THREE CELLS',
    model: 'FloUV 2000',
    flow: '~2,000 LPH',
    body: 'Three cells fed in parallel from one manifold. Each still runs at the velocity, residence time and dose it was validated at — there are simply three of them.',
  },
  {
    image: reactor2500,
    cells: 'FOUR CELLS',
    model: 'FloUV 2500',
    flow: '~2,500 LPH',
    body: 'The largest single-platform build. Four cells can run as four parallel single-pass trains for flow, one four-pass train for dose, or two trains of two \u2014 same hardware, very different rated duty.',
  },
];

const PILLAR_ICONS = {
  // Double helix — DNA-level inactivation
  dna: (
    <>
      <path d="M13 5c0 8 14 8 14 15s-14 7-14 15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M27 5c0 8-14 8-14 15s14 7 14 15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M14 9h12M16.5 14h7M16.5 26h7M14 31h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  // Intact molecule — bonds that survive the process
  molecule: (
    <>
      <circle cx="20" cy="9.5" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="10" cy="29" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="30" cy="29" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M17.9 13.1 12.1 25.4M22.1 13.1 27.9 25.4M14 29h12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </>
  ),
  // Counter-rotating Dean vortices inside the tube cross-section
  vortex: (
    <>
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M18 20A2 2 0 0 1 22 20A3 3 0 0 1 16 20A4.5 4.5 0 0 1 25 20A6.5 6.5 0 0 1 12 20A8.5 8.5 0 0 1 29 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </>
  ),
};

const PILLARS = [
  {
    tag: 'BIOLOGY',
    icon: 'dna',
    title: 'DNA-level disinfection',
    body: [
      'FloUV uses non-thermal UV-C light to inactivate microorganisms at the molecular level by directly targeting their DNA and RNA. When microbes are exposed to UV-C wavelengths, the energy induces the formation of thymine and pyrimidine dimers in their genetic material, disrupting the replication and transcription pathways essential for cell survival.',
      'By preventing microorganisms from reproducing and repairing themselves, FloUV renders bacteria, yeasts, molds, and viruses non-viable — achieving microbial safety without heat or chemicals. This DNA-level mechanism allows milk and other complex liquids to be processed safely while preserving native proteins, bioactives, and functional quality that are otherwise degraded during thermal treatment.',
    ],
    accent: 'var(--flouv-blue)',
  },
  {
    tag: 'CHEMISTRY',
    icon: 'molecule',
    title: 'No thermal stress, no degradation',
    body: [
      'FloUV preserves food chemistry by achieving microbial safety without thermal stress — the primary driver of nutrient and bioactive loss in conventional processing. By avoiding high temperatures, it minimizes protein denaturation and aggregation, reduces heat-accelerated oxidation pathways that degrade sensitive bioactives, and limits reactions such as Maillard browning that alter flavor and nutritional quality.',
      "Because the process is non-thermal and tightly controlled, the liquid's key compositional attributes — native proteins, bioactive fractions, and heat-sensitive quality markers — stay substantially closer to their original, fresh-liquid profile.",
    ],
    accent: 'var(--flouv-blue)',
  },
  {
    tag: 'PHYSICS',
    icon: 'vortex',
    title: 'Hydrodynamics that make dose uniform',
    body: [
      'FloUV applies advanced hydrodynamic engineering to control how liquids move, mix, and interact with UV-C light inside the reactor. At its core is a patented serpentine flow-path design, engineered to create controlled turbulence and continuous radial mixing in opaque and viscous liquids — bringing every fluid element repeatedly into the exposure zone and eliminating the channeling and stagnant regions common in conventional UV systems.',
      'By precisely controlling residence time, flow velocity, and exposure geometry, FloUV delivers a uniform, quantifiable UV-C dose across the entire liquid volume — enabling repeatable, validated microbial inactivation without heat, pressure, or chemical intervention, while avoiding overexposure.',
    ],
    accent: 'var(--flouv-blue)',
  },
];

const STEP_ICONS = {
  // Closed, UV-transparent flow path — liquid moving through clear tubing
  conduit: (
    <>
      <path d="M5 11h30M5 29h30" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 20h13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M21 15.5 25.5 20 21 24.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Serpentine geometry — opposed 180° bends that drive radial mixing
  serpentine: (
    <path
      d="M6 8h22a4 4 0 0 1 0 8H6a4 4 0 0 0 0 8h22a4 4 0 0 1 0 8H6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  // Calculated dose — lamps irradiating the tubing from every side
  irradiate: (
    <>
      <circle cx="20" cy="20" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="20" cy="5.5" r="2.2" fill="currentColor" />
      <circle cx="20" cy="34.5" r="2.2" fill="currentColor" />
      <circle cx="5.5" cy="20" r="2.2" fill="currentColor" />
      <circle cx="34.5" cy="20" r="2.2" fill="currentColor" />
      <path
        d="M20 9.2v3M20 30.8v-3M9.2 20h3M30.8 20h-3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </>
  ),
};

const HOW_IT_WORKS = [
  {
    tag: 'STEP 1',
    icon: 'conduit',
    title: 'A UV-transparent, closed flow path',
    body: 'Liquid enters the reactor and flows through UV-C–transmissive FEP tubing, selected for its high optical clarity at germicidal wavelengths, chemical inertness, and food-grade performance. The tubing forms a closed, hygienic pathway that maintains laminar-to-controlled transitional flow depending on the viscosity and throughput of the application.',
  },
  {
    tag: 'STEP 2',
    icon: 'serpentine',
    title: 'Serpentine geometry, engineered for mixing',
    body: 'The FEP tubing is wound around a structural support with a defined curvature and serpentine configuration. That geometry induces secondary flow and continuous radial mixing inside the tube, preventing channeling and stagnant zones — fluid elements are repeatedly displaced toward the tubing wall and back into the bulk stream, so microorganisms cannot bypass the treatment zone.',
  },
  {
    tag: 'STEP 3',
    icon: 'irradiate',
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
    id: 'dairy',
    title: 'Dairy',
    body: 'Opaque by fat-globule and casein-micelle scattering rather than absorption — the regime the serpentine geometry addresses best.',
  },
  {
    id: 'juices',
    title: 'Juices',
    body: 'The widest optical range on the platform: pigment load drives absorption while suspended pulp drives scattering, and the two size differently.',
  },
  {
    id: 'beverages',
    title: 'Beverages & ingredients',
    body: 'Plant-based drinks, syrups and extracts — high solids and rising viscosity, treated without the thermal load an ESL or UHT step would add.',
  },
  {
    id: 'brewing',
    title: 'Brewing',
    body: 'Clear to the eye but strongly absorbing: a branded lager measures 11.89 cm⁻¹ at 254 nm, so dose has to be delivered rather than assumed.',
  },
  {
    id: 'biofermentation',
    title: 'Biofermentation',
    body: 'Media and feed streams where a prevented batch loss outweighs throughput — which is what makes a high pass count affordable here.',
  },
  {
    id: 'water',
    title: 'Water & AOP',
    body: 'The lowest pass counts we run, and the entry point for oxidant-dosed advanced oxidation duty.',
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

const SCALE_STEPS = [
  {
    tier: 'THE UNICELL',
    flow: '~640 LPH',
    title: 'One validated reactor cell',
    body: 'Not just hardware — a reactor configuration plus the operating conditions it was characterized under: flow, velocity, residence time, Reynolds and Dean numbers, delivered dose, and the fluid it was validated against.',
  },
  {
    tier: '8 UNICELLS IN PARALLEL',
    flow: '~5,000 LPH',
    title: 'The commercial module',
    body: 'Eight cells share a common feed, each still running inside the same validated envelope. Capacity rises; the treatment condition inside any one cell does not change.',
  },
  {
    tier: '7 MODULES IN PARALLEL',
    flow: '+35,000 LPH',
    title: 'Industrial capacity',
    body: 'Modules replicate the same way cells do. Every configuration — pilot skid or full plant — is an arrangement of the identical building block, so nothing fundamental changes between them.',
  },
];

const SCALE_LEVERS = [
  {
    label: 'PARALLEL',
    question: 'How much flow?',
    body: 'Total flow is divided across equivalent validated paths. Each cell sees the same velocity, the same residence time and the same dose as the cell that was validated. This is how the commercial range is built — FloUV-1300 is two stacks, FloUV-2500 is four, FloUV-5000 is eight. Larger models add reactor stacks; they never enlarge the reactor.',
  },
  {
    label: 'SERIES',
    question: 'How much dose?',
    body: 'Where one pass cannot deliver the reduction equivalent fluence a fluid and organism demand, validated stages are placed in the flow path so exposure accumulates. Flow capacity and delivered dose are engineered separately, because they are governed by different physics.',
  },
];

function FlowComparison() {
  const UV = 'oklch(1 0 0 / 0.16)';
  const WALL = 'oklch(1 0 0 / 0.55)';
  const UNTREATED = 'oklch(0.82 0.16 62)';
  const TREATED = 'var(--flouv-green)';

  return (
    <div style={{ background: 'var(--flouv-blue-deep)', borderRadius: 14, padding: '30px 28px 26px', marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', color: 'oklch(0.75 0.03 260)', marginBottom: 22 }}>
        WHY GEOMETRY DECIDES THE DOSE
      </div>

      {/* A — straight channel */}
      <svg viewBox="0 0 340 132" width="100%" role="img" aria-label="Straight channel: core liquid passes through without reaching the irradiated wall zone">
        <defs>
          <marker id="fcArrowPale" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0 0.5 6 3.5 0 6.5z" fill={UNTREATED} />
          </marker>
          <marker id="fcArrowWhite" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0 0.5 6 3.5 0 6.5z" fill={WALL} />
          </marker>
          <marker id="fcArrowGreen" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0 0.5 6 3.5 0 6.5z" fill="oklch(0.87 0.23 154)" />
          </marker>
        </defs>

        <rect x="14" y="22" width="312" height="17" fill={UV} />
        <rect x="14" y="93" width="312" height="17" fill={UV} />
        <path d="M14 22h312M14 110h312" stroke={WALL} strokeWidth="2.4" strokeLinecap="round" />

        <path d="M34 30.5h250" stroke={WALL} strokeWidth="2" markerEnd="url(#fcArrowWhite)" />
        <path d="M34 101.5h250" stroke={WALL} strokeWidth="2" markerEnd="url(#fcArrowWhite)" />
        <path d="M34 52h258" stroke={UNTREATED} strokeWidth="2.2" markerEnd="url(#fcArrowPale)" />
        <path d="M34 66h258" stroke={UNTREATED} strokeWidth="2.2" markerEnd="url(#fcArrowPale)" />
        <path d="M34 80h258" stroke={UNTREATED} strokeWidth="2.2" markerEnd="url(#fcArrowPale)" />

        <text x="14" y="128" fill="oklch(0.75 0.03 260)" fontSize="10.5" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
          STRAIGHT CHANNEL
        </text>
      </svg>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'oklch(0.85 0.02 260)', margin: '4px 0 26px' }}>
        UV-C is absorbed within a thin shell at the wall. Liquid travelling down the core never enters it —
        it leaves the reactor untreated no matter how much lamp power is installed.
      </p>

      {/* B — serpentine */}
      <svg viewBox="0 0 340 132" role="img" width="100%" aria-label="Serpentine channel: curvature drives secondary flow that carries core liquid out to the irradiated wall zone">
        <rect x="14" y="22" width="312" height="17" fill={UV} />
        <rect x="14" y="93" width="312" height="17" fill={UV} />
        <path d="M14 22h312M14 110h312" stroke={WALL} strokeWidth="2.4" strokeLinecap="round" />

        <path
          d="M28 66C60 26 92 106 124 66S188 26 220 66s64 40 76 0"
          fill="none"
          stroke={TREATED}
          strokeWidth="2.4"
          strokeLinecap="round"
          markerEnd="url(#fcArrowGreen)"
        />
        <path
          d="M28 66C60 106 92 26 124 66s64 80 96 0 64-40 76 0"
          fill="none"
          stroke={TREATED}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.55"
          markerEnd="url(#fcArrowGreen)"
        />

        {/* counter-rotating secondary flow in the core */}
        <path d="M160 52a14 14 0 1 0 14 14" fill="none" stroke={WALL} strokeWidth="2" markerEnd="url(#fcArrowWhite)" />
        <path d="M254 80a14 14 0 1 1-14-14" fill="none" stroke={WALL} strokeWidth="2" markerEnd="url(#fcArrowWhite)" />

        <text x="14" y="128" fill="oklch(0.75 0.03 260)" fontSize="10.5" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
          SERPENTINE CHANNEL
        </text>
      </svg>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'oklch(0.85 0.02 260)', margin: '4px 0 0' }}>
        Curvature at every bend sets up secondary flow across the tube, continuously swapping core and near-wall
        liquid. Each fluid element is carried through the irradiated shell again and again — same lamps, a far
        more uniform delivered dose.
      </p>
      <p style={{ fontSize: 11.5, lineHeight: 1.55, color: 'oklch(0.68 0.03 260)', margin: '14px 0 0' }}>
        Schematic. At the disclosed operating point the flow is turbulent, so the real mechanism is
        curvature-enhanced radial transport rather than two steady vortices.
      </p>
    </div>
  );
}

export default function Technology() {
  const [meetingOpen, setMeetingOpen] = useState(false);

  return (
    <Layout active="Technology">
      <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)', color: 'var(--flouv-ink)' }}>
        {/* HERO */}
        <section
          style={{
            background: 'linear-gradient(180deg, var(--flouv-bg-soft) 0%, var(--flouv-border-soft) 100%)',
            padding: '68px 56px 52px',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 16 }}>
              BIOLOGY · CHEMISTRY · PHYSICS
            </div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 54,
                lineHeight: 1.1,
                fontWeight: 700,
                margin: '0 0 24px',
                letterSpacing: '-0.02em',
                color: 'var(--flouv-blue)',
              }}
            >
              Precision UV-C processing for complex liquids
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--flouv-text)', maxWidth: 680, margin: '0 auto' }}>
              FloUV applies advanced UV-C science and fluid-dynamics engineering to deliver uniform microbial
              inactivation in opaque and viscous liquids — without heat, pressure, or chemical compromise. The
              result is precise safety control while preserving native proteins, bioactives, and functional
              quality.
            </p>
          </div>

          <div style={{ maxWidth: 1280, margin: '52px auto 0' }}>
            <img
              src={techHeroBanner}
              alt="FloUV UV-C reactor engineering visual"
              style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 12, display: 'block' }}
            />
          </div>
        </section>

        {/* THREE PILLARS */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '76px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {PILLARS.map((pillar) => (
              <div
                key={pillar.tag}
                style={{
                  padding: '36px 36px 32px',
                  borderTop: `3px solid ${pillar.accent}`,
                  border: '1px solid oklch(0.90 0.02 258)',
                  borderTopWidth: 3,
                  borderTopColor: pillar.accent,
                  borderRadius: 14,
                  background: 'var(--flouv-white)',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: 'var(--flouv-blue-tint)',
                    color: pillar.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
                    {PILLAR_ICONS[pillar.icon]}
                  </svg>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: pillar.accent, marginBottom: 14 }}>
                  {pillar.tag}
                </div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 600, margin: '0 0 12px' }}>
                  {pillar.title}
                </h3>
                {pillar.body.map((para, i) => (
                  <p key={i} style={{ fontSize: 14.5, color: 'var(--flouv-text)', lineHeight: 1.65, margin: i === 0 ? '0 0 14px' : 0 }}>
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* PROCESS OVERVIEW */}
        <section style={{ background: 'linear-gradient(160deg, oklch(0.93 0.025 240), oklch(0.89 0.03 235))', padding: '76px 56px', color: 'oklch(0.22 0.03 250)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.45 0.04 240)', marginBottom: 12 }}>
                A CONTROLLED PATHWAY FOR MICROBIAL INACTIVATION
              </div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
                What it is, really
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.4 0.025 245)', margin: '0 0 16px' }}>
                FloUV is built around a simple but powerful idea: microbial safety is achieved not by forcing
                liquids through heat or pressure, but by guiding every part of the liquid through a precisely
                controlled UV-C exposure pathway.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.4 0.025 245)', margin: '0 0 16px' }}>
                In conventional systems, liquids tend to follow the path of least resistance, leaving portions
                under-treated. FloUV overcomes this with a patented serpentine flow architecture that
                continuously redistributes the liquid, so microorganisms are repeatedly and uniformly exposed
                to germicidal UV-C light.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.4 0.025 245)', margin: '0 0 28px' }}>
                As microbes travel through this engineered pathway, UV-C light disrupts their DNA and RNA,
                preventing replication and rendering them non-viable. The process is non-thermal, non-chemical,
                and repeatable — delivering microbial safety while preserving the native chemistry, bioactives,
                and functionality of the liquid.
              </p>
              <p style={{ fontSize: 15, fontStyle: 'italic', color: 'oklch(0.35 0.05 245)', margin: 0 }}>
                FloUV doesn't force liquids to change — it guides them safely through light.
              </p>
            </div>
            <div>
              <FlowComparison />
            </div>
          </div>
        </section>

        {/* TECHNICAL DEEP DIVE — COMPARISON */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '76px 56px' }}>
          <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 56px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              WHY CONVENTIONAL UV FALLS SHORT
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              UV-C, re-engineered for opaque liquids
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.75, color: 'var(--flouv-text)', margin: 0, textAlign: 'left' }}>
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
            <div style={{ padding: 32, borderRadius: 14, background: 'oklch(0.955 0.018 258)', border: '1px solid oklch(0.89 0.03 258)' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: 'oklch(0.4 0.02 245)', marginBottom: 12 }}>
                Conventional UV — straight-line exposure
              </div>
              <p style={{ fontSize: 14, color: 'oklch(0.45 0.015 245)', lineHeight: 1.6, margin: 0 }}>
                Dose is a function of lamp output and residence time alone — liquid that never gets close
                enough to the light never receives a full dose.
              </p>
            </div>
            <div style={{ padding: 32, borderRadius: 14, background: 'linear-gradient(160deg, oklch(0.33 0.13 264), oklch(0.23 0.14 264))', border: '1px solid oklch(1 0 0 / 0.18)' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: 'oklch(0.85 0.03 240)', marginBottom: 12 }}>
                FloUV — helical, Dean-vortex flow
              </div>
              <p style={{ fontSize: 14, color: 'oklch(0.92 0.01 240)', lineHeight: 1.6, margin: 0 }}>
                Continuous mixing rotates every parcel of liquid through the exposure zone, dose after dose,
                independent of optical opacity.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '68px 56px 76px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              INSIDE THE SYSTEM
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              From tubing to dose, three engineered stages
            </h2>
          </div>
          <div className="step-band">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.tag}
                className="step-segment"
                style={{
                  padding: '38px 32px 36px',
                  background: `oklch(${(0.26 + i * 0.08).toFixed(3)} 0.14 264)`,
                  color: 'var(--flouv-white)',
                }}
              >
                <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true" style={{ opacity: 0.92 }}>
                  {STEP_ICONS[step.icon]}
                </svg>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    opacity: 0.72,
                    margin: '22px 0 10px',
                  }}
                >
                  {step.tag}
                </div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.25 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0, opacity: 0.82 }}>{step.body}</p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* VALUE PROPOSITION */}
        <section
          style={{
            background: 'linear-gradient(135deg, var(--flouv-blue) 0%, var(--flouv-blue-deep) 100%)',
            padding: '76px 56px',
            color: 'oklch(0.98 0 0)',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-green)', marginBottom: 12 }}>
              THE FLOUV VALUE PROPOSITION
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              What that engineering actually buys you
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'oklch(0.85 0.02 260)', maxWidth: 720, margin: '0 0 40px' }}>
              Three outcomes a processor can hold us to — safety, quality and cost — each a consequence of the
              engineering above rather than a claim bolted on after it.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {VALUE_PROPS.map((prop, i) => (
                <div
                  key={prop.title}
                  style={{
                    padding: '34px 32px 32px',
                    background: 'oklch(1 0 0 / 0.07)',
                    border: '1px solid oklch(1 0 0 / 0.16)',
                    borderRadius: 14,
                  }}
                >
                  <div style={{ width: 34, height: 3, background: 'var(--flouv-green)', borderRadius: 2, marginBottom: 20 }} />
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      color: 'oklch(0.78 0.03 260)',
                      marginBottom: 10,
                    }}
                  >
                    {`0${i + 1}`}
                  </div>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 12px', lineHeight: 1.3 }}>
                    {prop.title}
                  </h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0, color: 'oklch(0.86 0.02 260)' }}>{prop.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALIDATION & METHODOLOGY */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '76px 56px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
            SCIENTIFIC RIGOR
          </div>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            Validated, not just claimed
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--flouv-text)', maxWidth: 760, margin: '0 0 36px' }}>
            Every performance claim behind FloUV is backed by a repeatable, auditable validation process — not
            a single demo run.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {VALIDATION_TOPICS.map((topic) => (
              <div
                key={topic.title}
                style={{
                  padding: 32,
                  background: 'var(--flouv-blue-tint)',
                  border: '1px solid oklch(0.89 0.03 262)',
                  borderRadius: 14,
                }}
              >
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 12px' }}>
                  {topic.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--flouv-text)', lineHeight: 1.65, margin: 0 }}>{topic.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* APPLICATIONS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 56px 76px' }}>
          <div style={{ maxWidth: 940, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              FLOUV APPLICATIONS
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
              Same platform, tuned per product
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 40px' }}>
              The reactor itself does not change between these. What changes is the delivered dose, the number of
              passes and the configuration — each set by the liquid’s own optical and rheological signature,
              measured on the actual stream rather than inferred from a similar product.
            </p>

            <div className="app-band">
              {APPLICATIONS_CARDS.map((card, i) => (
                <Link
                  key={card.id}
                  to={`/industries?tab=${card.id}`}
                  className="app-tile"
                  style={{ background: `oklch(${(0.255 + i * 0.045).toFixed(3)} 0.14 264)` }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: 'var(--flouv-green)',
                      marginBottom: 10,
                    }}
                  >
                    {`0${i + 1}`}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 16.5,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      marginBottom: 8,
                      lineHeight: 1.25,
                    }}
                  >
                    {card.title}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, opacity: 0.8 }}>{card.body}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* STANDARD RANGE */}
        <section style={{ background: 'var(--flouv-blue-deep)', padding: '76px 56px', color: 'oklch(0.98 0 0)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-green)', marginBottom: 12 }}>
              THE STANDARD RANGE
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
              From a single cell to a multi-cell standard reactor
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'oklch(0.85 0.02 260)', maxWidth: 780, margin: '0 0 36px' }}>
              These are three different machines only in the way a terrace is three different houses. Each one is
              the same validated reactor cell, counted differently — so what changes across the range is the
              number of treatment paths running side by side, never the conditions inside any one of them.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {STANDARD_RANGE.map((unit) => (
                <div
                  key={unit.model}
                  style={{
                    background: 'var(--flouv-white)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <img
                    src={unit.image}
                    alt={`${unit.model} — ${unit.cells.toLowerCase()} UV-C reactor`}
                    style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', background: 'var(--flouv-white)', display: 'block' }}
                  />
                  <div style={{ padding: '4px 28px 30px' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--flouv-blue-soft)', marginBottom: 8 }}>
                      {unit.cells}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 21,
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                        color: 'var(--flouv-ink)',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                      }}
                    >
                      {unit.model}
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--flouv-blue)', whiteSpace: 'nowrap', margin: '2px 0 12px' }}>
                      {unit.flow}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--flouv-text)', margin: 0 }}>{unit.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'oklch(0.85 0.02 260)', maxWidth: 820, margin: '44px 0 0' }}>
              The standard platform runs 640, 1,300, 2,000, 2,500 and 5,000 LPH — the same cell counted out to
              eight at the top of the range. Beyond 5,000 LPH capacity grows incrementally in 5,000 LPH steps,
              and still nothing about the reactor changes; the same cell simply keeps repeating.
            </p>
          </div>
        </section>

        {/* MODULAR SCALE-UP */}
        <section style={{ background: 'var(--flouv-bg-soft)', padding: '76px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 12 }}>
              MODULAR SCALE-UP
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              One validated cell, multiplied — not one reactor, enlarged
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', maxWidth: 780, margin: '0 0 20px' }}>
              FloUV adds capacity by replicating a validated treatment path, never by forcing more fluid through
              one. That distinction is the whole methodology. Push extra flow through a fixed geometry and
              velocity, Reynolds and Dean numbers, residence time and delivered-dose distribution all shift
              together — and the system moves outside the conditions its microbial performance was ever
              demonstrated under.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--flouv-text)', maxWidth: 780, margin: '0 0 36px' }}>
              So every high-volume FloUV system is built from the same core unicell reactor that was validated at
              pilot scale. A 35,000 LPH plant is not a scaled-up reactor — it is the identical validated cell,
              repeated. That is why dose work done on one unicell still means something at industrial throughput.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
              {SCALE_STEPS.map((step, i) => (
                <div
                  key={step.tier}
                  style={{
                    padding: 36,
                    background: 'var(--flouv-white)',
                    border: '1px solid var(--flouv-border)',
                    borderTop: '3px solid var(--flouv-blue)',
                  }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--flouv-muted)', marginBottom: 14 }}>
                    {`0${i + 1} — ${step.tier}`}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 32,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: 'var(--flouv-blue)',
                      marginBottom: 6,
                    }}
                  >
                    {step.flow}
                  </div>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 600, margin: '0 0 12px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14.5, color: 'var(--flouv-text)', lineHeight: 1.65, margin: 0 }}>{step.body}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {SCALE_LEVERS.map((lever) => (
                <div key={lever.label} style={{ padding: 36, background: 'var(--flouv-white)', border: '1px solid var(--flouv-border)' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--flouv-blue)', marginBottom: 10 }}>
                    {lever.label}
                  </div>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 19, fontWeight: 600, margin: '0 0 12px' }}>
                    {lever.question}
                  </h3>
                  <p style={{ fontSize: 14.5, color: 'var(--flouv-text)', lineHeight: 1.65, margin: 0 }}>{lever.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUITABILITY CTA */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '76px 56px' }}>
          <div
            style={{
              background: 'var(--flouv-blue-deep)',
              color: 'oklch(0.98 0 0)',
              padding: '56px 56px 52px',
              borderRadius: 16,
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: 48,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.07em', color: 'oklch(0.75 0.03 260)', marginBottom: 14 }}>
                IS FLOUV RIGHT FOR YOUR LINE?
              </div>
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  margin: '0 0 16px',
                  lineHeight: 1.2,
                }}
              >
                Tell us your volumes and we’ll tell you what it takes
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'oklch(0.85 0.02 260)', margin: 0 }}>
                Configuration follows from your fluid, your throughput and your treatment objective — how many
                unicells in parallel for the flow, how many stages in series for the dose. Our team will walk
                through your operating requirements and tell you honestly whether FloUV fits, and what validation
                your application would still need.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link
                to="/about"
                style={{
                  background: 'var(--flouv-green)',
                  color: 'var(--flouv-green-ink)',
                  padding: '16px 30px',
                  borderRadius: 100,
                  textDecoration: 'none',
                  fontSize: 14.5,
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                Talk to the FloUV team →
              </Link>
              <Link
                to="/faq"
                style={{
                  background: 'transparent',
                  color: 'oklch(0.98 0 0)',
                  padding: '16px 30px',
                  borderRadius: 100,
                  textDecoration: 'none',
                  fontSize: 14.5,
                  fontWeight: 700,
                  textAlign: 'center',
                  border: '1px solid oklch(1 0 0 / 0.35)',
                }}
              >
                Ask a question first
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: 'linear-gradient(160deg, oklch(0.93 0.025 240), oklch(0.89 0.03 235))',
            padding: '84px 56px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.45 0.04 240)', marginBottom: 16 }}>
            TECHNOLOGY CONTACT
          </div>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 40,
              fontWeight: 700,
              margin: '0 0 20px',
              letterSpacing: '-0.01em',
              color: 'oklch(0.22 0.035 250)',
            }}
          >
            Have a technical question?
          </h2>
          <p style={{ fontSize: 17, color: 'oklch(0.4 0.025 245)', margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            For any enquiries or questions regarding our technology and related projects, contact our Deep
            Tech department or book a meeting.
          </p>
          <button
            onClick={() => setMeetingOpen(true)}
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
            Book a Meeting
          </button>
        </section>
      </div>
      {meetingOpen && <InquiryModal mode="meeting" onClose={() => setMeetingOpen(false)} />}
    </Layout>
  );
}
