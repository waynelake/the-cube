'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';
import { ThemeToggle } from '@/components/theme-provider';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard');
    });
  }, []);
  return (
    <main className="relative min-h-screen overflow-hidden diagonal-grid" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Atmospheric background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 900px 600px at 50% 38%, rgba(124,58,237,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Theme toggle top-right */}
      <div className="absolute top-8 right-8 z-10">
        <ThemeToggle />
      </div>

      {/* Logo top-left */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <CubeIcon size={28} />
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
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
              color: 'var(--text-muted)',
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
              color: 'var(--text-primary)',
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
              color: 'var(--text-secondary)',
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
                background: 'var(--accent)',
                color: 'var(--text-primary)',
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
                color: 'var(--text-muted)',
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
