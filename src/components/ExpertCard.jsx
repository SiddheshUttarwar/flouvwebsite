// Regional contact profile — used for the EU dairy contacts on Industries (Dairy) and Technology.
// Pass `email` for a direct mailto CTA, or `onConnect` to route the CTA through InquiryModal.
export default function ExpertCard({ expert, accent = 'var(--flouv-blue-soft)', onConnect }) {
  if (!expert) return null;

  const ctaStyle = {
    background: 'var(--flouv-green)',
    color: 'var(--flouv-green-ink)',
    padding: '14px 28px',
    borderRadius: 100,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 700,
    display: 'inline-block',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        marginTop: 24,
        padding: '40px 44px',
        background: 'var(--flouv-white)',
        border: '1px solid var(--flouv-border)',
        borderTop: `3px solid ${accent}`,
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 40,
        alignItems: 'start',
      }}
    >
      {/* Supply `photo` (an import from uploads/) for a headshot; falls back to initials. */}
      {expert.photo ? (
        <img
          src={expert.photo}
          alt={expert.name}
          style={{
            width: 200,
            height: 200,
            borderRadius: 12,
            objectFit: 'cover',
            display: 'block',
            // Cut-out headshots ship on white; the tint keeps the portrait framed against the white card.
            background: 'var(--flouv-blue-tint)',
            border: '1px solid var(--flouv-border)',
          }}
        />
      ) : (
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 12,
            background: 'var(--flouv-blue-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: 56,
            fontWeight: 700,
            color: accent,
          }}
        >
          {expert.initials}
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: accent, marginBottom: 12 }}>
          {expert.eyebrow}
        </div>
        <h3
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            margin: '0 0 6px',
            lineHeight: 1.2,
          }}
        >
          {expert.name}
        </h3>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--flouv-text)', marginBottom: 20, lineHeight: 1.5 }}>
          {expert.title}
        </div>

        {expert.bio.map((para) => (
          <p key={para.slice(0, 32)} style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--flouv-text)', margin: '0 0 16px' }}>
            {para}
          </p>
        ))}

        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.6,
            fontWeight: 600,
            color: 'var(--flouv-ink)',
            background: 'var(--flouv-bg-soft)',
            borderLeft: `3px solid ${accent}`,
            padding: '14px 18px',
            margin: '0 0 22px',
          }}
        >
          {expert.role}
        </p>

        {expert.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {expert.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--flouv-blue)',
                  background: 'var(--flouv-blue-tint)',
                  border: '1px solid var(--flouv-border)',
                  borderRadius: 100,
                  padding: '7px 14px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {expert.email ? (
          <a href={`mailto:${expert.email}?subject=${encodeURIComponent(expert.ctaSubject)}`} style={ctaStyle}>
            {expert.ctaLabel} →
          </a>
        ) : (
          <button type="button" onClick={onConnect} style={ctaStyle}>
            {expert.ctaLabel} →
          </button>
        )}
      </div>
    </div>
  );
}
