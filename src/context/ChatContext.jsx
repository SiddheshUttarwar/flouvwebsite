import { createContext, useContext, useState } from 'react';

// Deliberately in-memory only (no localStorage/sessionStorage) — this state
// lives in a component that wraps the router, so it survives normal in-app
// navigation (FAQ -> Home -> FAQ), but a real browser refresh remounts the
// whole React tree from scratch, which naturally clears it. That's the
// intended behavior: navigating around the site keeps your conversation,
// refreshing the page starts a new one.
const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  return (
    <ChatContext.Provider value={{ messages, setMessages, sessionId, setSessionId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
