import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { MultiTrialChart, LactoferrinChart, DoseResponseChart, StrainInactivationChart, BioactivesGrid, AppleCiderPassesChart, EnergyComparisonChart } from '../components/Charts.jsx';

const INDUSTRIES = [
  {
    id: 'dairy',
    label: 'Dairy',
    accent: 'oklch(0.55 0.19 295)',
    heroImage: 'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769401046233-42HDU9B73ML0LRVE8ZWO/unsplash-image-kWvqJqzVUfs.jpg',
    gallery: [
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769402973696-LHJ34N4LT7KHBY5LCJSI/unsplash-image-2dzhYsVhLVA.jpg',
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769406762529-SKFA3CJYFG0O1CCXYDE5/unsplash-image-P7MkoYvSnLI.jpg',
    ],
    hasCharts: true,
    title: 'Redefining dairy safety, without heat',
    intro:
      'FloUV applies precision UV-C dosing engineered for optically dense milk, delivering validated ≥5-log pathogen reduction while retaining lactoferrin, IgA, enzymes, and fresh dairy flavor — without thermal damage.',
    challengeTitle: 'The dairy processing dilemma',
    challenges: [
      { label: 'Safety vs. quality trade-off', body: 'thermal pasteurization reliably inactivates pathogens, but degrades heat-sensitive bioactives like lactoferrin, IgA, and enzymes critical to dairy nutrition and functionality.' },
      { label: 'Escalating thermal intensity', body: 'heat-resistant organisms are pushing processors toward higher temperatures and longer hold times, amplifying flavor damage, oxidation, and nutrient loss.' },
      { label: 'Cost & sustainability pressure', body: 'thermal systems demand high energy, water, and CIP loads, while alternatives like HPP introduce batching, yield loss, and high CAPEX.' },
      { label: 'Limited innovation headroom', body: 'most "alternatives" were adapted from water or juice processing — not engineered for optically dense milk — leaving processors stuck with legacy constraints.' },
    ],
    approachTitle: 'Validated: safety & bioactive retention',
    approach: [
      'Engineered specifically for optically dense milk, where absorption and scattering limit conventional UV performance.',
      '≥ 5-log inactivation of Salmonella and E. coli O157:H7, validated across skim, whole, and diluted milk under industrial flow conditions.',
      'Lactoferrin activity preserved at levels comparable to raw milk — where heat pasteurization significantly reduces both concentration and functionality.',
      'Also retains IgA, lysozyme, and bile-salt-stimulated lipase, maintaining biochemical integrity and sensory quality.',
    ],
    appsTitle: "Where it's used",
    apps: [
      'Native whey protein concentrates and bioactive recovery (lactoferrin, IgA)',
      'Raw-like yet safe cheese production',
      'Raw milk quality enhancement',
      'UHT replacement pathways',
      'Hygienic cheese-brine pasteurization',
    ],
    ctaLabel: 'Request Report',
  },
  {
    id: 'juices',
    label: 'Juices',
    accent: 'oklch(0.6 0.09 230)',
    heroImage: 'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/6c0518f5-f37a-4a6c-a941-bec1bc2adadc/Machine+image+1.png',
    gallery: [
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769408419751-VHVYS3845GJYOWXYHCC2/unsplash-image-EtjrEsUzChU.jpg',
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769409272655-Q6WZTF4E5CAVL9IF9BDU/unsplash-image-boRUigPjYDE.jpg',
    ],
    hasJuiceCharts: true,
    title: 'Beyond thermal. Beyond HPP. A smarter way to pasteurize juices.',
    intro:
      'Thermal processing sacrifices quality. HPP adds cost and batch limits. FloUV offers a continuous, non-thermal alternative — validated microbial safety with fresh-like taste, clean labels, and up to 90% lower energy use.',
    challengeTitle: 'Why the current options fall short',
    challenges: [
      'Thermal pasteurization degrades color, aroma, and heat-sensitive bioactives to hit safety targets.',
      'High-Pressure Processing is batch-based, with heavy CAPEX, long cycle times, and packaging constraints.',
      'Both approaches cap throughput and add operating cost that a continuous, inline process could avoid.',
    ],
    approachTitle: 'Validated: safety & bioactive retention',
    approach: [
      '≥ 5-log reduction of E. coli O157:H7 and Salmonella spp., aligned with FDA Juice HACCP requirements.',
      'For low-acid and neutral juices, validation also addresses spore-formers like Clostridium botulinum through defined dose-equivalence targets.',
      'Preserves heat-sensitive vitamins, polyphenols, pigments, and volatile aroma compounds that thermal processing destroys.',
      'Runs continuously, in-line — no pressure vessels, no batch limits, higher throughput than HPP, using up to 70% less energy than thermal pasteurization.',
    ],
    appsTitle: 'Validated case studies',
    apps: [
      'Fresh apple cider — Alicyclobacillus acidoterrestris spore inactivation, validated',
      'Fresh apple cider — E. coli O157:H7 inactivation, validated',
      'Apple juice — full bioactive-preservation validation studies',
      'Watermelon juice — simulated results using the same dose-validation methodology',
    ],
    ctaLabel: 'Request Case Study',
  },
  {
    id: 'beverages',
    label: 'Beverages',
    accent: 'oklch(0.6 0.09 230)',
    heroImage: 'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769414870292-16ZM77XXRWU8WRZLGHHX/unsplash-image-LZL7WaOGUX0.jpg',
    gallery: [
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769417784712-S2NIFP7MI7RFIA1KJUIA/unsplash-image-xD5SWy7hMbw.jpg',
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769418354652-EJGWXGYDIJS1XP07BH0P/unsplash-image-Sl-ZCXyUZho.jpg',
    ],
    hasEnergyChart: true,
    title: 'Non-thermal preservation for the next generation of beverages',
    intro:
      'FloUV supports next-generation beverage processing — from plant-based milks and coconut water to energy drinks and sugar syrups — delivering non-thermal, continuous microbial reduction that preserves nutrients, flavor, and functional performance without heat.',
    challengeTitle: 'Why these products are hard to process',
    challenges: [
      'High-viscosity sugar syrups are difficult to treat uniformly with conventional UV or heat.',
      "Coconut water's delicate electrolytes and bioactives don't survive thermal processing intact.",
      'Plant-based milks carry both vegetative cells and spore-forming organisms that need reliable inactivation without cooking the product.',
    ],
    approachTitle: 'Validated performance',
    approach: [
      'Continuous microbial control in high-viscosity sugar syrups.',
      'Preservation of delicate electrolytes and bioactives in coconut water.',
      'Effective inactivation of vegetative cells and spore-forming organisms in plant-based milks.',
      'Energy measured directly against microbial reduction via Electrical Energy per Order (EEO) — 1–2 kWh/m³ to reach pasteurization-equivalent safety, up to 90% less than conventional thermal pasteurization.',
    ],
    appsTitle: "Where it's used",
    apps: [
      'Plant-based milks (retrofit or new lines)',
      'Coconut water',
      'Energy drinks',
      'Beverage sugar syrups and fruit juice bases, validated as a UV-C pre-treatment kill step',
    ],
    ctaLabel: 'Talk to a FloUV Expert',
  },
];

function BulletList({ items }) {
  return (
    <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 15, lineHeight: 1.6 }}>
          {typeof item === 'string' ? (
            item
          ) : (
            <>
              <strong>{item.label}</strong> — {item.body}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Industries() {
  const [activeId, setActiveId] = useState(INDUSTRIES[0].id);
  const active = INDUSTRIES.find((i) => i.id === activeId);

  return (
    <Layout active="Industries">
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: 'oklch(0.985 0.004 250)', color: 'oklch(0.22 0.01 250)' }}>
        {/* HERO */}
        <section
          style={{
            background: 'linear-gradient(180deg, oklch(0.96 0.006 250) 0%, oklch(0.93 0.008 255) 100%)',
            padding: '90px 56px 60px',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'oklch(0.55 0.19 295)', marginBottom: 16 }}>
              WHERE IT RUNS
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 50,
                lineHeight: 1.1,
                fontWeight: 700,
                margin: '0 0 24px',
                letterSpacing: '-0.02em',
                color: 'oklch(0.16 0.03 265)',
              }}
            >
              One platform. Every complex liquid.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'oklch(0.4 0.01 260)', maxWidth: 680, margin: '0 auto 40px' }}>
              The same validated UV-C science underneath every FloUV system — tuned per product. Pick an
              industry below to see its processing dilemma, validated results, and applications.
            </p>
          </div>
        </section>

        {/* TABS */}
        <section style={{ borderBottom: '1px solid oklch(0.9 0.005 250)', position: 'sticky', top: 0, background: 'oklch(0.985 0.004 250)', zIndex: 10 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, padding: '0 56px' }}>
            {INDUSTRIES.map((industry) => {
              const isActive = industry.id === activeId;
              return (
                <button
                  key={industry.id}
                  onClick={() => setActiveId(industry.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? `3px solid ${industry.accent}` : '3px solid transparent',
                    padding: '20px 22px',
                    fontSize: 15,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'oklch(0.18 0.02 260)' : 'oklch(0.5 0.01 250)',
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {industry.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ACTIVE INDUSTRY PANEL */}
        <section style={{ padding: '80px 56px 110px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 48, alignItems: 'center', marginBottom: 56 }}>
              {active.heroImage ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr',
                    gridTemplateRows: active.gallery.length > 1 ? '1fr 1fr' : '1fr',
                    gap: 8,
                    height: 320,
                  }}
                >
                  <img
                    src={active.heroImage}
                    alt={`${active.label} processing`}
                    style={{
                      gridRow: active.gallery.length > 1 ? '1 / 3' : 'auto',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 16,
                    }}
                  />
                  {active.gallery.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${active.label} ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    height: 320,
                    background: `linear-gradient(160deg, ${active.accent}, oklch(0.24 0.04 260))`,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 24,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.05em', color: 'oklch(0.98 0.005 250 / 0.85)' }}>
                    {active.label.toUpperCase()} PLACEHOLDER — swap in real product photography
                  </span>
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: active.accent, marginBottom: 12 }}>
                  {active.label.toUpperCase()}
                </div>
                <h2
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 36,
                    fontWeight: 700,
                    margin: '0 0 20px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {active.title}
                </h2>
                <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'oklch(0.4 0.01 250)', margin: '0 0 28px' }}>{active.intro}</p>
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
                  {active.ctaLabel}
                </Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              <div style={{ padding: 32, background: 'oklch(0.99 0.002 250)', border: '1px solid oklch(0.9 0.005 250)', borderTop: `3px solid ${active.accent}` }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: '0 0 16px' }}>
                  {active.challengeTitle}
                </h3>
                <BulletList items={active.challenges} />
              </div>
              <div style={{ padding: 32, background: 'oklch(0.99 0.002 250)', border: '1px solid oklch(0.9 0.005 250)', borderTop: `3px solid ${active.accent}` }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: '0 0 16px' }}>
                  {active.approachTitle}
                </h3>
                <BulletList items={active.approach} />
              </div>
              <div style={{ padding: 32, background: 'oklch(0.99 0.002 250)', border: '1px solid oklch(0.9 0.005 250)', borderTop: `3px solid ${active.accent}` }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: '0 0 16px' }}>
                  {active.appsTitle}
                </h3>
                <BulletList items={active.apps} />
              </div>
            </div>

            {(active.hasCharts || active.hasJuiceCharts || active.hasEnergyChart) && (
              <div style={{ marginTop: 24, padding: 32, background: 'oklch(0.99 0.002 250)', border: '1px solid oklch(0.9 0.005 250)', borderTop: `3px solid ${active.accent}` }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: '0 0 20px' }}>
                  Validated by the data
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                  {active.hasCharts && (
                    <>
                      <MultiTrialChart />
                      <LactoferrinChart />
                    </>
                  )}
                  {active.hasJuiceCharts && (
                    <>
                      <DoseResponseChart />
                      <StrainInactivationChart />
                      <AppleCiderPassesChart />
                      <BioactivesGrid />
                    </>
                  )}
                  {active.hasEnergyChart && <EnergyComparisonChart />}
                </div>
              </div>
            )}
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
            Don't see your product listed?
          </h2>
          <p style={{ fontSize: 17, color: 'oklch(0.75 0.02 260)', margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            FloUV's validation framework extends to any complex, opaque, or viscous liquid line. Talk to our
            team about your specific product and volumes.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
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
            <Link
              to="/technology"
              style={{
                background: 'transparent',
                color: 'oklch(0.98 0.005 250)',
                padding: '17px 34px',
                borderRadius: 3,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 700,
                display: 'inline-block',
                border: '1px solid oklch(0.6 0.02 260)',
              }}
            >
              Explore the Technology
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
