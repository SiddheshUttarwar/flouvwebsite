import Layout from '../components/Layout.jsx';

export default function Placeholder({ active, title }) {
  return (
    <Layout active={active}>
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 56px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 700, margin: '0 0 12px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 16, color: 'oklch(0.45 0.01 250)' }}>This page is coming soon.</p>
      </section>
    </Layout>
  );
}
