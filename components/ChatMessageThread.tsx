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
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            display: 'flex',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              maxWidth: '70%',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              backgroundColor:
                message.role === 'user'
                  ? 'rgba(124, 58, 237, 0.15)'
                  : 'var(--surface)',
              border:
                message.role === 'user'
                  ? '1px solid rgba(124, 58, 237, 0.3)'
                  : '1px solid var(--border)',
              color: 'var(--text-primary)',
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
      ))}
      <div ref={endRef} />
    </div>
  );
}
