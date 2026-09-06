import { Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import Technology from './pages/Technology.jsx';
import Industries from './pages/Industries.jsx';
import About from './pages/About.jsx';
import FAQ from './pages/FAQ.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Admin from './pages/Admin.jsx';
import Answer from './pages/Answer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Placeholder from './pages/Placeholder.jsx';

export default function App() {
  return (
    <ChatProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/technology" element={<Technology />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/answer" element={<Answer />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
    </ChatProvider>
  );
}
