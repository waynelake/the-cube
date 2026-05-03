'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    (searchParams.get('mode') as 'signin' | 'signup') || 'signup'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        router.push('/experience');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/experience');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/experience` },
    });
    if (error) setError(error.message);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setError('');
    alert('Check your email for a password reset link.');
  };

  if (!mounted) return null;

  return (
    <main
      className="relative min-h-screen diagonal-grid flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 700px 500px at 50% 45%, rgba(124,58,237,0.09) 0%, transparent 70%)',
        }}
      />

      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-3 z-10"
        style={{ textDecoration: 'none' }}
      >
        <CubeIcon size={24} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          The Cube
        </span>
      </Link>

      <div
        className="fade-in-up"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 0 80px rgba(124,58,237,0.07), 0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.6rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '0.4rem',
            }}
          >
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {mode === 'signup' ? 'Begin your reading.' : 'Continue where you left off.'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0',
            marginBottom: '1.75rem',
            background: 'var(--bg)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          {(['signup', 'signin'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.83rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {m === 'signup' ? 'Sign up' : 'Sign in'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(124,58,237,0.15)',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.15)'; }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(124,58,237,0.15)',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.15)'; }}
            />
          </div>

          {mode === 'signin' && (
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                alignSelf: 'flex-end',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginTop: '-0.5rem',
              }}
            >
              Forgot password?
            </button>
          )}

          {error && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: '#e05a5a', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              border: 'none',
              background: loading ? 'rgba(124,58,237,0.5)' : 'var(--accent)',
              color: 'var(--text-primary)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.92rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 0 24px rgba(124,58,237,0.3)',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(124,58,237,0.12)' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(124,58,237,0.12)' }} />
        </div>

        <button
          onClick={handleGoogle}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.88rem',
            fontWeight: 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.05)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {mode === 'signup' && (
          <p style={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
            By continuing you agree to our Privacy Policy
          </p>
        )}
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
