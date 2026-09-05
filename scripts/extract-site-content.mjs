/**
 * Extracts the marketing copy already written into the site's own pages
 * (Industries, Technology, Home, About) into plain-text documents the RAG
 * pipeline can ingest — so the chatbot can answer "what industries do you
 * serve" / "what's the chemistry of your reactor" from the same copy a
 * visitor reading the site would see, instead of only from Drive documents.
 *
 * This reads the LIVE exported consts out of each page file (via esbuild,
 * bundled for Node with React/router/images/local components stubbed out —
 * we only need the plain data, never render anything), so editing a page's
 * copy and re-running this automatically keeps the chatbot's knowledge in
 * sync. Run via `npm run sync-site-content` (also runs automatically before
 * `npm run build`, so Render regenerates this on every deploy).
 *
 * Output: backend/site_content/*.txt — one file per page, read by
 * backend/rag/ingest.py alongside the Drive-sourced sidecar.
 */
import esbuild from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const OUT_DIR = path.join(ROOT, 'backend', 'site_content');

// esbuild plugin: don't try to actually bundle React/JSX component imports
// or binary assets — we never call the page's component function, only read
// its top-level exported data, so these can all be empty stand-ins.
const stubPlugin = {
  name: 'stub-non-data-imports',
  setup(build) {
    build.onResolve({ filter: /\.(png|jpe?g|webp|svg|mp4|gif)$/ }, (args) => ({
      path: args.path,
      namespace: 'stub-asset',
    }));
    build.onLoad({ filter: /.*/, namespace: 'stub-asset' }, () => ({
      contents: 'module.exports = "";',
      loader: 'js',
    }));

    build.onResolve({ filter: /components\/(Layout|InquiryModal|ImagePlaceholder)\.jsx$/ }, (args) => ({
      path: args.path,
      namespace: 'stub-component',
    }));
    build.onLoad({ filter: /.*/, namespace: 'stub-component' }, () => ({
      contents: 'module.exports = { default: function Stub() { return null; } };',
      loader: 'js',
    }));
  },
};

async function loadPageExports(pageFile) {
  const result = await esbuild.build({
    entryPoints: [path.join(PAGES_DIR, pageFile)],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    // Some of these files define icon consts (JSX fragments) at module top
    // level, not inside the component function — those DO evaluate at
    // require() time even though we never call the component, so the JSX
    // runtime needs to actually resolve, not just avoid erroring. All of
    // these are real, installed packages, so leaving them external and
    // letting Node's own require() resolve them at load time works fine.
    external: ['react', 'react/jsx-runtime', 'react-dom', 'react-router-dom'],
    plugins: [stubPlugin],
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;

  const modulePath = path.join(OUT_DIR, `.bundle-${pageFile}.cjs`);
  fs.writeFileSync(modulePath, code);
  const require = createRequire(import.meta.url);
  delete require.cache[require.resolve(modulePath)];
  const mod = require(modulePath);
  fs.unlinkSync(modulePath);
  return mod;
}

// ---- formatters: turn each page's exported data into readable prose ----

function fmtIndustries(INDUSTRIES) {
  return INDUSTRIES.map((ind) => {
    const parts = [`# ${ind.label} — ${ind.title}`, ind.intro];
    if (ind.challenges?.length) {
      parts.push(`## ${ind.challengeTitle}`);
      for (const c of ind.challenges) {
        parts.push(typeof c === 'string' ? c : `${c.label}: ${c.body}`);
      }
    }
    if (ind.approach?.length) {
      parts.push(`## ${ind.approachTitle}`);
      parts.push(...ind.approach);
    }
    if (ind.apps?.length) {
      parts.push(`## ${ind.appsTitle}`);
      parts.push(...ind.apps);
    }
    for (const paper of ind.papers || []) {
      parts.push(`## ${paper.kind}: ${paper.title}\n${paper.body}`);
    }
    return parts.join('\n\n');
  }).join('\n\n---\n\n');
}

function fmtTechnology(mod) {
  const parts = [];

  for (const p of mod.PILLARS || []) {
    parts.push(`## ${p.title} (${p.tag})\n${(Array.isArray(p.body) ? p.body : [p.body]).join('\n\n')}`);
  }
  for (const s of mod.HOW_IT_WORKS || []) {
    parts.push(`## ${s.title} (${s.tag})\n${s.body}`);
  }
  for (const v of mod.VALUE_PROPS || []) {
    parts.push(`## ${v.title}\n${v.body}`);
  }
  for (const v of mod.VALIDATION_TOPICS || []) {
    parts.push(`## ${v.title}\n${v.body}`);
  }
  if (mod.STANDARD_RANGE?.length) {
    parts.push(
      '## Reactor models and throughput\n' +
        mod.STANDARD_RANGE.map((r) => `${r.model} (${r.cells}, ${r.flow}): ${r.body}`).join('\n\n')
    );
  }
  for (const s of mod.SCALE_STEPS || []) {
    parts.push(`## Scaling — ${s.title} (${s.tier}, ${s.flow})\n${s.body}`);
  }
  for (const l of mod.SCALE_LEVERS || []) {
    parts.push(`## Scaling lever: ${l.question} (${l.label})\n${l.body}`);
  }

  return `# FloUV reactor technology — how it works, and how it scales\n\n${parts.join('\n\n')}`;
}

function fmtCompanyOverview(mod) {
  const parts = [];

  for (const i of mod.FLOUV_INSIGHTS || []) {
    parts.push(`## ${i.title} (${i.label})\n${i.body}`);
  }
  for (const s of mod.SOLUTIONS || []) {
    parts.push(`## ${s.title}\n${s.body}`);
  }
  if (mod.SUSTAINABILITY_STATS?.length) {
    parts.push(
      '## Sustainability and efficiency vs. thermal pasteurization\n' +
        mod.SUSTAINABILITY_STATS.map((s) => `${s.value}: ${s.label}`).join('\n')
    );
  }

  return `# FloUV — company overview\n\n${parts.join('\n\n')}`;
}

function fmtAboutTeam(mod) {
  const parts = [];

  for (const p of mod.PERFORMANCE || []) {
    parts.push(`## ${p.title}\n${p.body}`);
  }
  if (mod.TEAM?.length) {
    parts.push(
      '## Leadership team\n' +
        mod.TEAM.map((t) => `${t.name}, ${t.title}. ${t.bio} Contact: ${t.email}`).join('\n\n')
    );
  }
  for (const f of mod.PARTNER_FORMS || []) {
    parts.push(`## Partnership model: ${f.title} (${f.label})\n${f.body}`);
  }
  if (mod.SCIENCE_PATH?.length) {
    parts.push(
      '## Validation process for a new customer\n' +
        mod.SCIENCE_PATH.map((s) => `Step ${s.step} — ${s.title}: ${s.body}`).join('\n\n')
    );
  }

  return `# FloUV — company, team, and how we validate for a new customer\n\n${parts.join('\n\n')}`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const industries = await loadPageExports('Industries.jsx');
  const technology = await loadPageExports('Technology.jsx');
  const home = await loadPageExports('Home.jsx');
  const about = await loadPageExports('About.jsx');

  const docs = {
    'website-industries.txt': fmtIndustries(industries.INDUSTRIES),
    'website-technology.txt': fmtTechnology(technology),
    'website-company.txt': fmtCompanyOverview(home),
    'website-about-team.txt': fmtAboutTeam(about),
  };

  for (const [filename, text] of Object.entries(docs)) {
    fs.writeFileSync(path.join(OUT_DIR, filename), text, 'utf-8');
    console.log(`Wrote ${filename} (${text.length} chars)`);
  }
}

main().catch((err) => {
  console.error('extract-site-content failed:', err);
  process.exit(1);
});
