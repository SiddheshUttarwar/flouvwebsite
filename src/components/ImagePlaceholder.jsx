export default function ImagePlaceholder({ label, spec, aspectRatio = '16 / 9', minHeight, compact = false, style = {} }) {
  return (
    <div
      style={{
        aspectRatio,
        minHeight,
        width: '100%',
        border: '2px dashed var(--flouv-border)',
        borderRadius: compact ? 6 : 10,
        background:
          'repeating-linear-gradient(135deg, var(--flouv-bg-soft) 0px, var(--flouv-bg-soft) 10px, var(--flouv-bg) 10px, var(--flouv-bg) 20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? 4 : 20,
        gap: compact ? 2 : 6,
        color: 'var(--flouv-muted)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ fontSize: compact ? 14 : 24 }}>🖼️</div>
      {!compact && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600 }}>{label}</div>}
      {!compact && spec && <div style={{ fontSize: 12, color: 'var(--flouv-muted-soft)' }}>{spec}</div>}
    </div>
  );
}
