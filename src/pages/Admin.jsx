import { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import Login from './Login.jsx';
import BlogsTab from './admin/BlogsTab.jsx';
import InquiriesTab from './admin/InquiriesTab.jsx';
import AnalyticsTab from './admin/AnalyticsTab.jsx';
import KnowledgeBaseTab from './admin/KnowledgeBaseTab.jsx';
import HealthTab from './admin/HealthTab.jsx';

const TABS = [
  { key: 'blogs', label: 'Blogs', component: BlogsTab },
  { key: 'inquiries', label: 'Inquiries', component: InquiriesTab },
  { key: 'analytics', label: 'Analytics', component: AnalyticsTab },
  { key: 'knowledge-base', label: 'Knowledge Base', component: KnowledgeBaseTab },
  { key: 'health', label: 'System Health', component: HealthTab },
];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/check-auth', { credentials: 'include' });
      setIsAuthenticated(res.ok);
    } catch (e) {
      setIsAuthenticated(false);
    }
    setIsCheckingAuth(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Failed to logout', err);
    }
    setIsAuthenticated(false);
  };

  if (isCheckingAuth) {
    return <Layout active="Admin"><div style={{ padding: 100, textAlign: 'center' }}>Loading...</div></Layout>;
  }

  if (!isAuthenticated) {
    return (
      <Layout active="Admin">
        <Login onSuccess={() => setIsAuthenticated(true)} />
      </Layout>
    );
  }

  const ActiveComponent = TABS.find(t => t.key === activeTab)?.component ?? BlogsTab;

  return (
    <Layout active="Admin">
      <main className="admin-main" style={{ padding: '40px 56px 64px', background: 'var(--flouv-bg-soft)', minHeight: '80vh' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>

          <div className="admin-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 12 }}>
            <nav className="tab-scroll admin-tabs" style={{ display: 'flex', gap: 4, background: 'var(--flouv-white)', padding: 4, borderRadius: 10, border: '1px solid var(--flouv-border)' }}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 7,
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer',
                    background: activeTab === tab.key ? 'var(--flouv-blue)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--flouv-white)' : 'var(--flouv-text)',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              style={{ background: 'none', border: '1px solid var(--flouv-border)', color: 'var(--flouv-muted)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              Log out
            </button>
          </div>

          <ActiveComponent />

        </div>
      </main>
    </Layout>
  );
}
