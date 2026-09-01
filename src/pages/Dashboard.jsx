import Layout from '../components/Layout.jsx';
import { useState } from 'react';

export default function Dashboard() {
  const [embedUrl] = useState("https://lookerstudio.google.com/embed/reporting/0B5n.../page/1M");

  return (
    <Layout active="Dashboard">
      <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--flouv-white)', minHeight: '80vh', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 700, margin: 0, color: 'var(--flouv-blue)' }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: 'var(--flouv-muted)', marginTop: -16, marginBottom: 16 }}>
            Live business intelligence and performance reporting.
          </p>

          <div style={{
            background: 'var(--flouv-white)',
            borderRadius: 16,
            boxShadow: '0 12px 40px oklch(0.3 0.05 264 / 0.05)',
            border: '1px solid var(--flouv-border)',
            overflow: 'hidden', 
            position: 'relative',
            width: '100%',
            paddingTop: '60%' // Aspect ratio for dashboard (16:9 roughly)
          }}>
            
            {/* The actual Looker Studio Embed iframe */}
            <iframe 
              src={embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allowFullScreen
            />
            
            {/* Overlay explaining how to update it for the user (only shown if using placeholder) */}
            {embedUrl.includes("0B5n") && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'oklch(0.94 0.02 264 / 0.9)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: 40,
                zIndex: 10
              }}>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, marginBottom: 16 }}>Placeholder Dashboard</h2>
                <p style={{ maxWidth: 600, color: 'var(--flouv-text)', lineHeight: 1.6 }}>
                  This is where your Looker Studio report will appear! 
                  <br/><br/>
                  To connect your real data, paste your <strong>Looker Studio Embed URL</strong> into the chat.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </Layout>
  );
}
