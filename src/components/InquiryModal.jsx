import { useEffect, useState } from 'react';

const CONTACT_EMAIL = 'pankajuttarwar@flouv.us';

const APPLICATIONS = [
  'Dairy',
  'Juices',
  'Beverages & ingredients',
  'Brewing',
  'Biofermentation',
  'Water & AOP',
  'Other / not sure yet',
];

const REASONS = [
  'Explore a pilot or trial',
  'Technical evaluation of the platform',
  'Pricing and system configuration',
  'Validation and regulatory support',
  'Partnership or distribution',
  'Something else',
];

const TOPICS = [
  'General question about the technology',
  'Application or feasibility question',
  'Pricing and system configuration',
  'Partnership or representation',
  'Validation, regulatory or documentation',
  'Media or press',
  'Something else',
];

const t = (name, label, opts = {}) => ({ type: 'text', name, label, ...opts });
const email = (name, label, opts = {}) => ({ type: 'email', name, label, ...opts });
const tel = (name, label, opts = {}) => ({ type: 'tel', name, label, ...opts });
const url = (name, label, opts = {}) => ({ type: 'url', name, label, placeholder: 'https://', ...opts });
const area = (name, label, opts = {}) => ({ type: 'textarea', name, label, rows: 3, ...opts });
const sel = (name, label, options, opts = {}) => ({ type: 'select', name, label, options, ...opts });
const file = (name, label, opts = {}) => ({ type: 'file', name, label, ...opts });

const NOTES = area('message', 'Anything else we should know? (optional)');

const MODES = {
  report: {
    eyebrow: (p) => p.kind || 'REPORT',
    heading: (p) => p.title,
    blurb: 'Tell us where to send it and our team will follow up with the report.',
    submitLabel: 'Request this report →',
    subject: (f, p) => `Report request: ${p.title}`,
    lead: (f, p) => [
      'I would like to request the following FloUV report:',
      '',
      `Report:   ${p.title}${p.kind ? ` (${p.kind})` : ''}`,
      p.context ? `Industry: ${p.context}` : null,
    ],
    fields: [
      t('name', 'Name', { required: true }),
      t('company', 'Company'),
      email('email', 'Work email', { required: true }),
      area('message', 'Anything about your application? (optional)'),
    ],
  },

  meeting: {
    eyebrow: () => 'BOOK A MEETING',
    heading: () => 'Tell us what you are working on',
    blurb: 'A few details so the right person comes to the call prepared.',
    submitLabel: 'Send request →',
    subject: (f) => `Meeting request: ${f.reason}`,
    lead: (f) => [
      'I would like to arrange a meeting with the FloUV team.',
      '',
      `Reason:      ${f.reason}`,
      `Application: ${f.application}`,
    ],
    fields: [
      sel('reason', 'Reason for the meeting', REASONS),
      sel('application', 'Type of application', APPLICATIONS),
      t('name', 'Name', { required: true }),
      t('company', 'Company', { required: true }),
      email('email', 'Work email', { required: true }),
      tel('phone', 'Phone (optional)'),
      NOTES,
    ],
  },

  general: {
    eyebrow: () => 'GENERAL ENQUIRY',
    heading: () => 'Got a question? Ask away',
    blurb: 'Send it here and it reaches the person best placed to answer.',
    submitLabel: 'Send enquiry →',
    subject: (f) => `General enquiry: ${f.topic}`,
    lead: (f) => ['I have a question for the FloUV team.', '', `Topic: ${f.topic}`],
    fields: [
      sel('topic', 'What is it about?', TOPICS),
      area('message', 'Your question', {
        required: true,
        rows: 4,
        placeholder: 'The liquid, the line, or the question on your mind.',
      }),
      t('name', 'Name', { required: true }),
      t('company', 'Company'),
      email('email', 'Work email', { required: true }),
      tel('phone', 'Phone (optional)'),
    ],
  },

  collaboration: {
    eyebrow: () => 'RESEARCH COLLABORATION',
    heading: () => 'Bring us the problem you want solved',
    blurb: 'Joint development and research partnerships start with a liquid and a question. Tell us both.',
    submitLabel: 'Start a collaboration →',
    subject: (f) => `Research collaboration enquiry: ${f.company || f.name}`,
    lead: (f) => [
      'I would like to explore a research and development collaboration with FloUV.',
      '',
      `Company:  ${f.company}`,
      `Website:  ${f.website}`,
      '',
      'What we want to research:',
      f.research,
    ],
    fields: [
      t('company', 'Company or institution', { required: true }),
      url('website', 'Company website'),
      area('research', 'The problem or new product you want to research', {
        required: true,
        rows: 4,
        placeholder: 'The liquid, the constraint you keep hitting, and what a good outcome would look like.',
      }),
      t('name', 'Contact person', { required: true }),
      t('title', 'Their title or role', { required: true }),
      email('email', 'Work email', { required: true }),
      tel('phone', 'Phone (optional)'),
      file('attachment', 'Supporting document (optional)'),
      NOTES,
    ],
  },

  distribution: {
    eyebrow: () => 'DISTRIBUTION PARTNERSHIP',
    heading: () => 'Represent FloUV in your market',
    blurb: 'Tell us the territory you cover and what you already sell into it.',
    submitLabel: 'Explore a partnership →',
    subject: (f) => `Distribution partnership enquiry: ${f.company}${f.region ? ` — ${f.region}` : ''}`,
    lead: (f) => [
      'I would like to explore a FloUV distribution partnership.',
      '',
      `Company:  ${f.company}`,
      `Website:  ${f.website}`,
      `Region:   ${f.region}`,
      '',
      'Experience in machinery sales and service:',
      f.experience,
    ],
    fields: [
      t('company', 'Company name', { required: true }),
      url('website', 'Company website'),
      t('region', 'Region or territory you want to represent', {
        required: true,
        placeholder: 'e.g. Iberia, Ontario & Quebec, ASEAN',
      }),
      area('experience', 'Your experience in machinery sales and service', {
        required: true,
        rows: 4,
        placeholder: 'Lines you represent today, install and service capability, typical customer size.',
      }),
      t('name', 'Contact person', { required: true }),
      t('title', 'Title or signing authority', { required: true }),
      email('email', 'Work email', { required: true }),
      tel('phone', 'Phone (optional)'),
      NOTES,
    ],
  },

  representation: {
    eyebrow: () => 'CONSULTANT REPRESENTATION',
    heading: () => 'Add FloUV to what you advise on',
    blurb: 'Tell us where your network sits and how you would want to work with us.',
    submitLabel: 'Talk to us about representation →',
    subject: (f) => `Representation enquiry: ${f.name}`,
    lead: (f) => [
      'I would like to discuss representing FloUV as a consultant.',
      '',
      `Years of experience: ${f.years}`,
      `Industry vertical:   ${f.vertical}`,
      '',
      'How I would want to represent FloUV:',
      f.approach,
    ],
    fields: [
      t('name', 'Name', { required: true }),
      t('company', 'Consultancy or practice'),
      sel('years', 'Years of experience', ['Under 5', '5–10', '10–20', '20+']),
      sel('vertical', 'Primary industry vertical', APPLICATIONS),
      area('approach', 'How would you want to represent FloUV?', {
        required: true,
        rows: 4,
        placeholder: 'Introductions and referral, technical advisory on client projects, agency in a territory…',
      }),
      email('email', 'Work email', { required: true }),
      tel('phone', 'Phone (optional)'),
      file('attachment', 'Your bio or CV (optional)'),
      NOTES,
    ],
  },
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14.5,
  fontFamily: "'Inter', sans-serif",
  color: 'var(--flouv-ink)',
  background: 'var(--flouv-white)',
  border: '1px solid oklch(0.88 0.02 258)',
  borderRadius: 8,
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--flouv-text)',
  marginBottom: 6,
};

export default function InquiryModal({ mode = 'meeting', title, kind, context, onClose }) {
  const config = MODES[mode] || MODES.meeting;
  const paper = { title, kind, context };

  const [form, setForm] = useState(() => {
    const initial = {};
    for (const f of config.fields) {
      if (f.type === 'select') {
        initial[f.name] = f.name === 'application' && context && f.options.includes(context) ? context : f.options[0];
      } else {
        initial[f.name] = '';
      }
    }
    return initial;
  });
  const [attachmentName, setAttachmentName] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const generic = [
      '',
      `Name:     ${form.name || ''}`,
      form.title ? `Title:    ${form.title}` : null,
      form.company ? `Company:  ${form.company}` : null,
      `Email:    ${form.email || ''}`,
      form.phone ? `Phone:    ${form.phone}` : null,
      attachmentName ? `\nAttaching: ${attachmentName} — please attach this file before sending.` : null,
      form.message ? `\n${form.message}` : null,
    ];

    const subject = config.subject(form, paper);
    const body = [...config.lead(form, paper), ...generic].filter((l) => l !== null && l !== undefined).join('\n');

    // Persist server-side first so the lead isn't lost if the visitor's
    // browser has no mail client configured to actually send the mailto:
    // draft below (very common — mailto just silently does nothing then).
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        subject,
        name: form.name || null,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        message: body,
        raw_data: JSON.stringify(form),
      }),
    }).catch((err) => console.error('Failed to record inquiry', err));

    window.open(
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
    onClose();
  };

  const renderField = (f) => {
    const id = `iq-${f.name}`;
    const common = { id, style: inputStyle, required: f.required, placeholder: f.placeholder };

    if (f.type === 'select') {
      return (
        <select {...common} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
          {f.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    }
    if (f.type === 'textarea') {
      return (
        <textarea
          {...common}
          rows={f.rows}
          style={{ ...inputStyle, resize: 'vertical' }}
          value={form[f.name]}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
        />
      );
    }
    if (f.type === 'file') {
      return (
        <>
          <input
            id={id}
            type="file"
            onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')}
            style={{ ...inputStyle, padding: '9px 12px', fontSize: 13 }}
          />
          <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--flouv-muted)', marginTop: 5 }}>
            {attachmentName
              ? `Your email will open with a note to attach “${attachmentName}” — please add it before sending.`
              : 'Named in your message so you can attach it to the email that opens.'}
          </div>
        </>
      );
    }
    return (
      <input
        {...common}
        type={f.type}
        value={form[f.name]}
        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
      />
    );
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'oklch(0.22 0.14 264 / 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={config.heading(paper)}
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--flouv-white)',
          borderRadius: 16,
          padding: '32px 34px 30px',
          boxShadow: '0 30px 80px oklch(0.22 0.14 264 / 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--flouv-blue-soft)' }}>
            {config.eyebrow(paper)}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: 22, lineHeight: 1, color: 'var(--flouv-muted)', cursor: 'pointer', padding: 0 }}
          >
            ×
          </button>
        </div>

        <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
          {config.heading(paper)}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--flouv-text)', margin: '0 0 22px' }}>{config.blurb}</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {config.fields.map((f) => (
            <div key={f.name}>
              <label style={labelStyle} htmlFor={`iq-${f.name}`}>
                {f.label}
              </label>
              {renderField(f)}
            </div>
          ))}

          <button
            type="submit"
            style={{
              marginTop: 4,
              background: 'var(--flouv-green)',
              color: 'var(--flouv-green-ink)',
              border: 'none',
              padding: '14px 26px',
              borderRadius: 100,
              fontSize: 14.5,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
            }}
          >
            {config.submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
