export default function BackgroundImagePlaceholder({ label, spec, opacity = 0.5, overlay, cornerColor = 'var(--flouv-muted)' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', zIndex: 0 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity,
          background:
            'repeating-linear-gradient(135deg, var(--flouv-blue-soft) 0px, var(--flouv-blue-soft) 10px, var(--flouv-blue) 10px, var(--flouv-blue) 20px)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: overlay }} />
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          fontSize: 10,
          letterSpacing: '0.04em',
          color: cornerColor,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label} · {spec}
      </div>
    </div>
  );
}
