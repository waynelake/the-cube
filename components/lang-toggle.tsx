'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';

export function LangToggle() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.35rem 0.65rem',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'transparent',
          color: '#fff',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8rem',
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: '0.03em',
        }}
      >
        {language}
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
          <path d="M1 1L5 5.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#0a0a0f',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            minWidth: '60px',
            zIndex: 200,
          }}
        >
          {(['EN', 'DE'] as const)
            .filter(l => l !== language)
            .map(l => (
              <button
                key={l}
                onClick={() => { setLanguage(l); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  letterSpacing: '0.03em',
                }}
              >
                {l}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
