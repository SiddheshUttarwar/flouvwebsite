# FloUV Website — Image Specification

Every image slot on the site, one row per slot. "Status" is `filled` (real
asset wired in), `placeholder` (dashed placeholder box rendered by
`src/components/ImagePlaceholder.jsx`, visible in the running site), or `n/a`
(page has no image slots by design).

Placeholders render inline in the dev server so you can see exactly where
each asset lands before it exists — replace them by swapping the
`ImagePlaceholder` element for an `<img>` once the real asset is ready.

## Home — `src/pages/Home.jsx`

| Slot | Status | Spec | Notes |
|---|---|---|---|
| Industries — Dairy card | filled | 800×520, JPEG/WebP | `public/dynamic_images/dairy.png` |
| Industries — Juice & beverage card | placeholder | 800×520, JPEG/WebP | cold-pressed juice / bottling line |
| Industries — Functional ingredients card | placeholder | 800×520, JPEG/WebP | lab/ingredient extraction visual |
| Industries — Water & syrups card | filled | 800×520, JPEG/WebP | `public/dynamic_images/water.png` |
| Technology teaser — reactor photo | filled | 1200×960, JPEG/WebP | `public/dynamic_images/uv.png` |
| Hero visual | filled (illustrative) | — | CSS gradient "flowing tube" animation; a real product/reactor photo could replace it later but isn't blocking |

## Technology — `src/pages/Technology.jsx`

| Slot | Status | Spec | Notes |
|---|---|---|---|
| Hero engineering visual | placeholder | 1600×900 (16:9), JPEG/WebP | reactor or serpentine flow-path hero shot |
| Pillar icon — BIOLOGY | placeholder | 200×200, SVG/PNG (transparent) | DNA/UV disinfection icon |
| Pillar icon — CHEMISTRY | placeholder | 200×200, SVG/PNG (transparent) | molecule/no-heat icon |
| Pillar icon — PHYSICS | placeholder | 200×200, SVG/PNG (transparent) | fluid-dynamics icon |
| Serpentine flow-path diagram | placeholder | 900×700, SVG/PNG, dark-background variant | Dean-vortex circulation diagram, sits on dark section |
| How It Works — STEP 1 diagram | placeholder | 500×320, SVG/PNG | UV-transparent tubing cross-section |
| How It Works — STEP 2 diagram | placeholder | 500×320, SVG/PNG | serpentine coil geometry |
| How It Works — STEP 3 diagram | placeholder | 500×320, SVG/PNG | dose/irradiance profile at tubing wall |

## About — `src/pages/About.jsx`

| Slot | Status | Spec | Notes |
|---|---|---|---|
| CEO photo | filled | 200×200 (1:1), WebP | `uploads/pankajttarwar.webp` |
| CTO photo | filled | 200×200 (1:1), WebP | `uploads/AnkitPatras2.webp` |

## Industries — `src/pages/Industries.jsx`

| Slot | Status | Spec | Notes |
|---|---|---|---|
| Dairy tab hero + gallery | filled | varies | external Squarespace CDN URLs |
| Juices tab hero + gallery | filled | varies | external Squarespace CDN URLs |
| Beverages tab hero + gallery | filled | varies | external Squarespace CDN URLs |

Note: these currently point at a third-party CDN inherited from an earlier
site build — worth migrating into `public/dynamic_images` at some point so
the site doesn't depend on an external host staying up.

## Blog / BlogPost — `src/pages/Blog.jsx`, `src/pages/BlogPost.jsx`

| Slot | Status | Spec | Notes |
|---|---|---|---|
| Post card thumbnail | dynamic | 3:2 aspect ratio, JPEG/WebP | pulled from `post.image` via API/admin upload, no fixed asset needed |
| Post hero image | dynamic | full-width, 16:9 recommended, JPEG/WebP | pulled from `blog.image` via API/admin upload |

## Admin — `src/pages/Admin.jsx`

| Slot | Status | Notes |
|---|---|---|
| Blog image upload field | n/a | form-driven, uploads to `/api/upload`; no static spec needed |

## Answer, Login, Dashboard, Placeholder

| Page | Status | Notes |
|---|---|---|
| Answer.jsx | n/a | text-only chat interface |
| Login.jsx | n/a | auth form, no imagery by design |
| Dashboard.jsx | n/a | embedded Looker Studio iframe |
| Placeholder.jsx | n/a | stub template for future pages |

## Format conventions used across the site

- **Photography** (facility/product shots): JPEG or WebP, sRGB, no
  transparency needed.
- **Icons/diagrams**: SVG preferred (crisp at any size); PNG with
  transparent background as fallback.
- **Team headshots**: WebP, 1:1, min 400×400 source (displayed at 200×200).
- All images should be compressed for web (target < 300KB for photos,
  < 50KB for icons/diagrams).
