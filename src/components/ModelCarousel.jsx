import { useEffect, useRef, useState } from 'react';
import ImagePlaceholder from './ImagePlaceholder.jsx';

const MODELS = [
  { name: 'FloUV 640', capacity: '640 LPH', spec: '1200×800 · JPEG/WebP' },
  { name: 'FloUV 1300', capacity: '1,300 LPH', spec: '1200×800 · JPEG/WebP' },
  { name: 'FloUV 2000', capacity: '2,000 LPH', spec: '1200×800 · JPEG/WebP' },
  { name: 'FloUV 2500', capacity: '2,500 LPH', spec: '1200×800 · JPEG/WebP' },
];

const AUTOPLAY_MS = 4000;

export default function ModelCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const advance = (dir) => setIndex((i) => (i + dir + MODELS.length) % MODELS.length);

  const restartAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), AUTOPLAY_MS);
  };

  useEffect(() => {
    restartAutoplay();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (dir) => {
    advance(dir);
    restartAutoplay();
  };

  const arrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '1px solid var(--flouv-border)',
    background: 'oklch(1 0 0 / 0.9)',
    cursor: 'pointer',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--flouv-blue)',
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <button onClick={() => goTo(-1)} aria-label="Previous model" style={{ ...arrowStyle, left: 20 }}>
          ←
        </button>

        <div
          style={{
            display: 'flex',
            width: `${MODELS.length * 100}%`,
            transform: `translateX(-${index * (100 / MODELS.length)}%)`,
            transition: 'transform 0.5s ease',
          }}
        >
          {MODELS.map((m) => (
            <div key={m.name} style={{ width: `${100 / MODELS.length}%`, flexShrink: 0 }}>
              <ImagePlaceholder
                label={`${m.name} — ${m.capacity} system`}
                spec={m.spec}
                aspectRatio="auto"
                style={{ height: 'clamp(320px, 34vw, 480px)', borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}
              />
            </div>
          ))}
        </div>

        <button onClick={() => goTo(1)} aria-label="Next model" style={{ ...arrowStyle, right: 20 }}>
          →
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
        {MODELS.map((m, i) => (
          <button
            key={m.name}
            onClick={() => {
              setIndex(i);
              restartAutoplay();
            }}
            aria-label={`Go to ${m.name}`}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: i === index ? 'var(--flouv-blue)' : 'var(--flouv-border)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
