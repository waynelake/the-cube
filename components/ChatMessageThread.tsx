'use client';

import { useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: string;
  content: string;
}

export default function MessageThread({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '2rem' }}>
        Loading conversation...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: isUser
                  ? 'rgba(124, 58, 237, 0.25)'
                  : '#f5f3f0',
                border: isUser
                  ? '1px solid rgba(124, 58, 237, 0.4)'
                  : '1px solid #e8e4e0',
                color: isUser ? '#ffffff' : '#1a1a1a',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {message.content}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
