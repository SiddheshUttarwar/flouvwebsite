import Layout from '../components/Layout.jsx';

export default function Placeholder({ active, title }) {
  return (
    <Layout active={active}>
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '92px 56px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 38, fontWeight: 700, margin: '0 0 12px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--flouv-text)' }}>This page is coming soon.</p>
      </section>
    </Layout>
  );
}
