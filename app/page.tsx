'use client';

import Link from 'next/link';
import { CubeIcon } from '@/components/cube-icon';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden diagonal-grid" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Atmospheric background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 900px 600px at 50% 38%, rgba(124,58,237,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Logo top-left */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <CubeIcon size={28} />
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,235,0.45)',
          }}
        >
          The Cube
        </span>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* Overline */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#5a5464',
              marginBottom: '2.5rem',
            }}
          >
            A symbolic self-discovery experience
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              lineHeight: '1.18',
              color: '#f5f0eb',
              fontWeight: 500,
              marginBottom: '1.5rem',
            }}
          >
            You&rsquo;re in a space of your own design.
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              color: '#8b8494',
              lineHeight: '1.7',
              marginBottom: '3rem',
            }}
          >
            Answer a few questions. Get a reading that names what you already
            knew&nbsp;&mdash; but never said out loud.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <Link
              href="/auth?mode=signup"
              style={{
                display: 'inline-block',
                padding: '0.9rem 2.5rem',
                borderRadius: '8px',
                background: '#7c3aed',
                color: '#f5f0eb',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                boxShadow: '0 0 40px rgba(124,58,237,0.35), 0 2px 12px rgba(0,0,0,0.4)',
                transition: 'all 0.25s ease',
              }}
            >
              Start your reading
            </Link>

            <Link
              href="/auth?mode=signin"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.82rem',
                color: '#5a5464',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
