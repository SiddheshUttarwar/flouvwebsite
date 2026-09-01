import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const INDUSTRIES = [
  {
    id: 'dairy',
    label: 'Dairy',
    accent: 'var(--flouv-blue-soft)',
    heroImage: 'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769401046233-42HDU9B73ML0LRVE8ZWO/unsplash-image-kWvqJqzVUfs.jpg',
    gallery: [
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769402973696-LHJ34N4LT7KHBY5LCJSI/unsplash-image-2dzhYsVhLVA.jpg',
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769406762529-SKFA3CJYFG0O1CCXYDE5/unsplash-image-P7MkoYvSnLI.jpg',
    ],
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
      'Raw milk reception \u2014 disinfection at intake that preserves native milk functionality.',
      'Cheese manufacturing \u2014 an intermediate step for quality, yield and a longer production window.',
      'Cheese brine \u2014 chemical-free loop sanitation, where repeat passes accumulate dose for free.',
      'Native protein production \u2014 protecting native whey proteins at the raw stage.',
      'Lactoferrin extraction \u2014 higher bioactivity retention than any thermal route.',
      'Whey processing and MPC/MPI manufacturing \u2014 intermediate disinfection with minimal protein impact.',
      'Cream processing \u2014 end-stage disinfection, with viscosity driving the configuration.',
      'Ice cream mix \u2014 pasteurization of a high-fat, high-solids stream.',
      'Colostrum \u2014 the most demanding case in dairy, where IgG retention caps the dose from above.',
    ],
    faq: {
      title: 'Still weighing UV-C against your pasteurizer?',
      body:
        'Lactoferrin retention, log reduction on whole milk, what actually changes on your existing line \u2014 ask it directly and get an expert answer in seconds.',
      questions: [
        'Does FloUV work on whole milk?',
        'How much lactoferrin survives versus HTST?',
        'What changes on my existing pasteurization line?',
      ],
      label: 'Ask about dairy',
    },
    ctaLabel: 'Request Report',
  },
  {
    id: 'juices',
    label: 'Juices',
    accent: 'var(--flouv-blue-soft)',
    heroImage: 'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/6c0518f5-f37a-4a6c-a941-bec1bc2adadc/Machine+image+1.png',
    gallery: [
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769408419751-VHVYS3845GJYOWXYHCC2/unsplash-image-EtjrEsUzChU.jpg',
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769409272655-Q6WZTF4E5CAVL9IF9BDU/unsplash-image-boRUigPjYDE.jpg',
    ],
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
    appsTitle: "Where it's used",
    apps: [
      'Cold-pressed juice \u2014 the defining application of the category: cold pasteurization of finished product.',
      'NFC juices \u2014 pasteurization that preserves flavour and nutrients.',
      'Juice blends \u2014 extended shelf life through yeast disinfection.',
      'Functional health shots \u2014 microbiological stability with the bioactives left intact.',
      'Smoothies \u2014 opaque, high-solids liquid treated for extended shelf life.',
      'Coconut water \u2014 the lowest pass count in the category.',
      'Sweet apple cider \u2014 preserving natural sweetness and fresh apple character.',
    ],
    faq: {
      title: 'Comparing FloUV against thermal or HPP?',
      body:
        'Shelf life, colour and vitamin retention, dose validation, batch versus continuous \u2014 put the question in and get a straight answer.',
      questions: [
        'How does FloUV compare to HPP for juice?',
        'What log reduction can I expect on apple cider?',
        'Does UV-C affect juice colour or vitamin C?',
      ],
      label: 'Ask about juices',
    },
    ctaLabel: 'Request Case Study',
  },
  {
    id: 'beverages',
    label: 'Beverages',
    accent: 'var(--flouv-blue-soft)',
    heroImage: 'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769414870292-16ZM77XXRWU8WRZLGHHX/unsplash-image-LZL7WaOGUX0.jpg',
    gallery: [
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769417784712-S2NIFP7MI7RFIA1KJUIA/unsplash-image-xD5SWy7hMbw.jpg',
      'https://images.squarespace-cdn.com/content/v1/667dcb8b5500c04d659a87e1/1769418354652-EJGWXGYDIJS1XP07BH0P/unsplash-image-Sl-ZCXyUZho.jpg',
    ],
    title: 'Non-thermal preservation for the next generation of beverages',
    intro:
      'FloUV supports next-generation beverage processing — from plant-based milks and coconut water to energy drinks, sugar syrups and flavour extracts — delivering non-thermal, continuous microbial reduction that preserves nutrients, flavor, and functional performance without heat.',
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
      'Oat drinks \u2014 cutting thermal load while preserving proteins and flavour.',
      'Almond and nut drinks \u2014 retaining delicate character through ESL and UHT routes.',
      'Soy drinks \u2014 avoiding the heat-driven off-notes thermal processing introduces.',
      'Coconut beverages \u2014 no fat separation, no cooked note.',
      'Grain beverages \u2014 preserving a clean, neutral flavour.',
      'Formulated bases \u2014 reducing the thermal burden carried by added ingredients.',
      'Sugar processing \u2014 continuous sterile ingredient production, in line rather than in batches.',
      'Glucose and fructose syrups \u2014 in-line treatment that replaces batch heat on a heat-sensitive sweetener.',
      'Vanilla extract \u2014 the hardest combination in the portfolio: a spore target in a deeply absorbing fluid.',
      'Botanical extracts \u2014 disinfection with the actives screened for UV lability first.',
      'Flavour solutions \u2014 keeping the volatiles that any thermal step drives off.',
      'Fruit preparations \u2014 preserving colour and flavour through treatment.',
    ],
    faq: {
      title: 'Wondering how FloUV fits your beverage line?',
      body:
        'Plant-based milks, coconut water, syrups, functional drinks \u2014 ask what it does to your specific product and formulation.',
      questions: [
        'Can FloUV treat oat and almond milk?',
        'Will UV-C affect my functional ingredients?',
        'What does it cost to run per litre?',
      ],
      label: 'Ask about beverages',
    },
    ctaLabel: 'Talk to a FloUV Expert',
  },
  {
    id: 'brewing',
    label: 'Brewing',
    accent: 'var(--flouv-blue-soft)',
    gallery: [],
    title: 'Shelf life, without losing the beer',
    intro:
      'Craft beer and hard cider are built on delicate things \u2014 hop aroma, malt character, yeast esters, orchard fruit. Thermal pasteurization protects them from spoilage by cooking the very qualities people pay for. FloUV controls lactic acid bacteria and wild yeast in continuous flow at ambient temperature, so stability and freshness stop being a trade-off.',
    challengeTitle: 'The brewer\u2019s dilemma',
    challenges: [
      'Freshness is the product. The moment beer leaves the brewery, spoilage organisms, residual yeast activity and oxygen start changing what the drinker actually experiences.',
      'Heat buys stability and charges flavour for it. Flash and tunnel pasteurization work, but prolonged thermal exposure ages the beer \u2014 which is exactly why many craft brewers have stayed away from it.',
      'Spoilage costs more than a sour batch. LAB and wild yeasts bring off-flavours, haze, unintended refermentation and over-carbonated packages back from distribution.',
      'Beer is optically difficult. A branded lager measures an absorption coefficient of 11.89 cm\u207b\u00b9 at 254 nm \u2014 most UV systems are built for liquids far clearer than that.',
    ],
    approachTitle: 'How FloUV handles it',
    approach: [
      'Stability comparable to conventional pasteurization, without the heat. A 30 mJ/cm\u00b2 dose is expected to deliver roughly 3-log reduction of Saccharomyces cerevisiae \u2014 microbial stability on par with the ~15 Pasteurization Units used commercially.',
      'Built for exactly this optical challenge. The patented serpentine-helical reactor uses Dean-vortex mixing to continuously renew which liquid is exposed to the lamps, so dose lands uniformly even in a dark, scattering beer.',
      'Dose is verified, not assumed. UV intensity monitoring drives a flow diversion valve that automatically recirculates any under-dosed product instead of letting it reach the package.',
      'Fresh character survives \u2014 hop aroma, malt profile, colour and mouthfeel stay intact because there is no heat-induced flavour aging.',
      '65\u201390% lower energy consumption than conventional flash and tunnel pasteurization, with long-life amalgam lamps delivering over 98% of their output at 254 nm.',
      'A continuous-flow skid with integrated CIP, designed to drop straight into an existing brewery or cidery line.',
    ],
    appsTitle: 'Where it\u2019s used',
    apps: [
      'Brewing water \u2014 treated at intake; the lowest pass count in the category.',
      'Beer stabilization \u2014 finished-product pasteurization that preserves sensory quality and aroma.',
      'Craft brewing \u2014 premium quality at volumes where a tunnel pasteurizer never pays for itself.',
      'Hard cider \u2014 retaining fresh fruit character through stabilization.',
    ],
    faq: {
      title: 'Thinking about stabilizing without heat?',
      body:
        'Dose and PU equivalence, what it does to hop aroma, how it drops into an existing line \u2014 ask and get a straight answer.',
      questions: [
        'How does FloUV compare to tunnel pasteurization?',
        'Will UV-C affect hop aroma or mouthfeel?',
        'What PU equivalent can FloUV deliver on beer?',
      ],
      label: 'Ask about brewing',
    },
    ctaLabel: 'Request Brochure',
  },
  {
    id: 'biofermentation',
    label: 'Biofermentation',
    accent: 'var(--flouv-blue-soft)',
    title: 'Debottlenecking fermentation feed sterilization — without a new boiler',
    intro:
      'Thermal (HTST) sterilization of fermentation feed gates every batch and locks in heavy utility capex. FloUV treats the sugar/dextrose feed cold — continuous, non-thermal UV-C with biodosimetry-validated dose delivery, engineered for the opaque, viscous streams conventional UV was never built for.',
    challengeTitle: 'The sterilization bottleneck fermentation plants live with',
    challenges: [
      { label: 'A 6–12 hour cycle gates every batch', body: 'HTST sterilization of the sugar/dextrose feed runs ahead of every fermentation batch, holding plants near capacity with no spare shifts to absorb.' },
      { label: 'Heavy utility capex is locked in', body: 'Steam boilers, condensate handling, and chilled-water systems are all committed to the sterilization step — assets that scale with every capacity expansion.' },
      { label: 'One contamination event is a write-off', body: 'A single contamination event on a multi-million-liter tank can mean a $1–2M batch loss, an exposure that repeats across every plant running lactic, citric, or other sugar-fed fermentation.' },
      { label: "Conventional UV wasn't built for this", body: 'Thin-film and early curved-tube UV reactors can’t hold a tight enough dose distribution in opaque, viscous feed to guarantee a validated sterility assurance level (SAL).' },
    ],
    approachTitle: 'Predicted: dose, kill, and throughput',
    approach: [
      'A patented Dean-vortex serpentine reactor drives turbulent mixing that collapses the dose distribution — no wall over-dosing or core under-treatment — even in opaque, scattering liquids.',
      'Delivered dose is measured and reported as fluence (mJ/cm²), biodosimetry-validated on an EPA UVDGM-aligned methodology adapted for opaque liquids — not the volumetric-energy metric (mJ/L) that can mask underdosing.',
      'On high-Brix glucose syrup feed (near-water UV clarity, ≈87% UVT/cm): predicted ≥6-log cold inactivation — B. subtilis ≈7-log, S. cerevisiae ≈6.7-log at ≈80 mJ/cm², with margin even against UV-hardy bacteriophage.',
      'Removes an estimated 60–80% of sterilization-hours from the HTST critical path with no compromise to sterility assurance — unlocking additional batches per year on the same tank.',
      'All-electric energy intensity of ≈4.72 kWh/m³, roughly 64% lower than typical HTST (≈13–30 kWh/m³), with modular skids estimated at 10–20% of the capex of an equivalent HTST capacity addition.',
    ],
    appsTitle: "Where it's used",
    apps: [
      'Media preparation \u2014 continuous sterilization as an alternative to the thermal route.',
      'Bacterial fermentation \u2014 feed-side contamination control.',
      'Cell culture media \u2014 sterilization that preserves sensitive media components.',
      'Alternative proteins \u2014 continuous sterile processing of a demanding, opaque stream.',
      'Photonic process control \u2014 precision fermentation, yeast productivity and optogenetic platforms are declared platform extensions rather than current capability.',
    ],
    faq: {
      title: 'Feed sterilization holding up your fermenters?',
      body:
        'Throughput, energy, and what a cold sterilization step does to your batch cycle \u2014 worth asking before you spec another boiler.',
      questions: [
        'Can FloUV replace steam sterilization for fermentation feed?',
        'How much energy does it save versus a boiler?',
        'What throughput do I get per unicell?',
      ],
      label: 'Ask about fermentation',
    },
    ctaLabel: 'Talk to a FloUV Expert',
  },
  {
    id: 'water',
    label: 'Water & AOP',
    accent: 'var(--flouv-blue-soft)',
    heroImage: '/dynamic_images/water.png',
    gallery: [],
    title: 'Advanced oxidation you can prove',
    intro:
      'Advanced oxidation goes after what filtration and standard disinfection leave behind. It works by creating powerful oxidants directly inside the liquid \u2014 but they last only an instant, and they only act where they form. So the reactor that wins isn\u2019t the one with the most lamps installed. It\u2019s the one that reliably brings every drop to the chemistry, and can prove it did. That is what FloUV is built to do.',
    challengeTitle: 'What makes AOP hard to get right',
    challenges: [
      'You can\u2019t carry the chemistry to the contaminant. The oxidants doing the work vanish almost the instant they appear, right where they were made. No pump or mixer can move them. The liquid has to come to them.',
      'Liquid that slips down the middle of the pipe never gets treated. UV energy is strongest close to the lamp, so anything riding through the centre of the channel burns your chemical dose and comes out the far end untouched.',
      'More chemical is not better. Past a certain point, extra peroxide starts working against you \u2014 and the point where that happens moves with the water itself, day to day.',
      'Most systems assume a dose instead of measuring one. Lamp power on a spec sheet is not the same as treatment actually delivered to the liquid in front of you.',
    ],
    approachTitle: 'How FloUV is different',
    approach: [
      'We measure the dose rather than estimate it. Live UV and pressure sensing watches delivered dose in real time, and if it ever falls below target the system diverts that flow automatically \u2014 so nothing under-treated carries on down the line.',
      'Our reactor keeps pushing liquid into the treatment zone. Instead of a straight pipe, FloUV uses a tight serpentine path that continuously folds liquid from the middle of the channel out to where the UV is strongest, so far more of what goes in actually gets treated.',
      'The underlying physics is independently published, not just our word for it. A peer-reviewed study in the Chemical Engineering Journal modelled this same coiled-channel approach on six contaminants of emerging concern and found the mixing effect measurably improved the chemistry.',
      'Engineered for oxidant service from the start \u2014 inert fluoropolymer tubing that stands up to peroxide, and 254 nm lamps positioned both inside and outside the coil so light reaches the liquid from both sides.',
      'Proven where UV normally struggles. Our dose-uniformity work was done in optically dense liquid, not clear water \u2014 which is why FloUV handles cloudy, dark and high-absorbance streams other UV systems can\u2019t.',
    ],
    appsTitle: 'Where it fits best',
    apps: [
      'Ingredient water \u2014 chemical-free treatment of water going into the product.',
      'Process water \u2014 single-pass duty at intake.',
      'RO water \u2014 a final barrier downstream of membrane treatment.',
      'CIP water \u2014 reuse loops, where residual cleaning chemistry shifts the optical load.',
      'Full AOP duty \u2014 destroying contaminants with a dosed oxidant \u2014 is in active development, with head-to-head validation specified and next on the programme.',
    ],
    faq: {
      title: 'Evaluating UV-C or AOP for your water stream?',
      body:
        'Dose verification, high-absorbance streams, and exactly where AOP duty stands today \u2014 ask and get a straight, evidence-backed answer.',
      questions: [
        'How does FloUV verify the delivered dose?',
        'Can FloUV treat high-absorbance water?',
        'Where does FloUV AOP development stand today?',
      ],
      label: 'Ask about water & AOP',
    },
    ctaLabel: 'Talk to a FloUV Expert',
  },
];

const PANEL_TONES = {
  challenge: {
    bg: 'oklch(0.974 0.010 258)',
    border: 'oklch(0.915 0.018 258)',
    heading: 'oklch(0.42 0.06 260)',
    marker: 'oklch(0.68 0.06 258)',
  },
  approach: {
    bg: 'oklch(0.960 0.020 260)',
    border: 'oklch(0.900 0.032 260)',
    heading: 'var(--flouv-blue)',
    marker: 'var(--flouv-blue-soft)',
  },
  apps: {
    bg: 'oklch(0.944 0.032 262)',
    border: 'oklch(0.885 0.045 262)',
    heading: 'var(--flouv-blue-deep)',
    marker: 'oklch(0.48 0.15 264)',
  },
};

function BulletList({ items, marker = 'var(--flouv-blue-soft)' }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: 14.5,
            lineHeight: 1.65,
            color: 'var(--flouv-text)',
            position: 'relative',
            paddingLeft: 18,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: '0.62em',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: marker,
            }}
          />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeId, setActiveId] = useState(
    INDUSTRIES.some((i) => i.id === tabParam) ? tabParam : INDUSTRIES[0].id
  );
  const active = INDUSTRIES.find((i) => i.id === activeId);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeId && INDUSTRIES.some((i) => i.id === tab)) {
      setActiveId(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectTab = (id) => {
    setActiveId(id);
    setSearchParams({ tab: id });
  };

  return (
    <Layout active="Industries">
      <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)', color: 'var(--flouv-ink)' }}>
        {/* HERO */}
        <section
          style={{
            background: 'linear-gradient(180deg, var(--flouv-bg-soft) 0%, var(--flouv-border-soft) 100%)',
            padding: '90px 56px 60px',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--flouv-blue)', marginBottom: 16 }}>
              WHERE IT RUNS
            </div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 50,
                lineHeight: 1.1,
                fontWeight: 700,
                margin: '0 0 24px',
                letterSpacing: '-0.02em',
                color: 'var(--flouv-blue)',
              }}
            >
              One platform. Every complex liquid.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--flouv-text)', maxWidth: 680, margin: '0 auto 40px' }}>
              The same validated UV-C science underneath every FloUV system — tuned per product. Pick an
              industry below to see its processing dilemma, validated results, and applications.
            </p>
          </div>
        </section>

        {/* TABS */}
        <section style={{ borderBottom: '1px solid var(--flouv-border)', position: 'sticky', top: 0, background: 'var(--flouv-white)', zIndex: 10 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, padding: '0 56px' }}>
            {INDUSTRIES.map((industry) => {
              const isActive = industry.id === activeId;
              return (
                <button
                  key={industry.id}
                  onClick={() => selectTab(industry.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? `3px solid ${industry.accent}` : '3px solid transparent',
                    padding: '20px 22px',
                    fontSize: 15,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--flouv-blue)' : 'var(--flouv-muted)',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
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
                    background: `linear-gradient(160deg, ${active.accent}, var(--flouv-blue-deep))`,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 24,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.05em', color: 'oklch(1 0 0 / 0.85)' }}>
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
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 36,
                    fontWeight: 700,
                    margin: '0 0 20px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {active.title}
                </h2>
                <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 28px' }}>{active.intro}</p>
                <Link
                  to="/about"
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
                  {active.ctaLabel}
                </Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { key: 'challenge', label: 'THE CHALLENGE', title: active.challengeTitle, items: active.challenges, ...PANEL_TONES.challenge },
                { key: 'approach', label: 'OUR APPROACH', title: active.approachTitle, items: active.approach, ...PANEL_TONES.approach },
                { key: 'apps', label: 'IN PRACTICE', title: active.appsTitle, items: active.apps, ...PANEL_TONES.apps },
              ].map((panel) => (
                <div
                  key={panel.key}
                  style={{
                    padding: '30px 30px 34px',
                    background: panel.bg,
                    border: `1px solid ${panel.border}`,
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.09em',
                      color: panel.heading,
                      opacity: 0.75,
                      marginBottom: 10,
                    }}
                  >
                    {panel.label}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 17.5,
                      fontWeight: 600,
                      margin: '0 0 18px',
                      lineHeight: 1.3,
                      color: panel.heading,
                    }}
                  >
                    {panel.title}
                  </h3>
                  <BulletList items={panel.items} marker={panel.marker} />
                </div>
              ))}
            </div>

            {active.faq && (
              <div
                style={{
                  marginTop: 24,
                  padding: '40px 44px',
                  background: 'var(--flouv-bg-soft)',
                  border: '1px solid var(--flouv-border)',
                  borderTop: `3px solid ${active.accent}`,
                  display: 'grid',
                  gridTemplateColumns: '1.1fr 1fr',
                  gap: 44,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: active.accent, marginBottom: 12 }}>
                    ASK FLOUV
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 26,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      margin: '0 0 12px',
                      lineHeight: 1.2,
                    }}
                  >
                    {active.faq.title}
                  </h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 24px' }}>
                    {active.faq.body}
                  </p>
                  <Link
                    to="/faq"
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
                    {active.faq.label} →
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {active.faq.questions.map((q) => (
                    <Link
                      key={q}
                      to={`/answer?q=${encodeURIComponent(q)}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        background: 'var(--flouv-white)',
                        border: '1px solid var(--flouv-border)',
                        borderRadius: 100,
                        padding: '13px 20px',
                        fontSize: 14,
                        lineHeight: 1.4,
                        color: 'var(--flouv-text)',
                        textDecoration: 'none',
                      }}
                    >
                      <span>{q}</span>
                      <span style={{ color: active.accent, fontWeight: 700, flexShrink: 0 }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: 'linear-gradient(135deg, var(--flouv-blue), var(--flouv-blue-deep))',
            padding: '120px 56px',
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
                background: 'var(--flouv-green)',
                color: 'var(--flouv-green-ink)',
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
                color: 'oklch(0.98 0 0)',
                padding: '17px 34px',
                borderRadius: 3,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 700,
                display: 'inline-block',
                border: '1px solid oklch(1 0 0 / 0.4)',
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
