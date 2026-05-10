'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';
import { Check } from 'lucide-react';

function UnlockContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth?mode=signin');
    });

    fetchCheckoutUrl();
  }, []);

  const fetchCheckoutUrl = async () => {
    setFetchingUrl(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token || SUPABASE_ANON_KEY;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      }
    } catch {
      setError('Unable to connect to payment processor. Please try again.');
    } finally {
      setFetchingUrl(false);
    }
  };

  const FEATURES = [
    'Full interpretation of all 5 elements',
    'The Pattern -- what runs through your space',
    '5 strategic takeaways',
    'Your one-line identity summary',
  ];

  return (
    <main className="relative min-h-screen diagonal-grid flex items-center justify-center px-6" style={{ backgroundColor: '#0a0a0f' }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 700px 500px at 50% 45%, rgba(124,58,237,0.09) 0%, transparent 70%)' }}
      />

      <Link
        href={`/results?session=${sessionId}`}
        style={{
          position: 'absolute', top: '2rem', left: '2rem', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#5a5464',
          textDecoration: 'none', transition: 'color 0.2s',
        }}
      >
        <CubeIcon size={18} />
        <span>Back to reading</span>
      </Link>

      <div
        className="fade-in-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#13131a',
          border: '1px solid rgba(124,58,237,0.22)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 0 80px rgba(124,58,237,0.08), 0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.75rem' }}>
            One-time access
          </p>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.7rem',
              color: '#f5f0eb',
              fontWeight: 500,
              marginBottom: '0.5rem',
            }}
          >
            Unlock your full reading
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '3rem', color: '#f5f0eb', fontWeight: 500, lineHeight: '1' }}>
              7 EUR
            </span>
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FEATURES.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Check size={15} style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#8b8494', lineHeight: '1.5' }}>
                {f}
              </span>
            </li>
          ))}
        </ul>

        <div style={{ height: '1px', background: 'rgba(124,58,237,0.12)', marginBottom: '2rem' }} />

        {error && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#e05a5a', textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <button
          onClick={fetchCheckoutUrl}
          disabled={loading || fetchingUrl}
          style={{
            width: '100%',
            padding: '0.9rem',
            borderRadius: '8px',
            border: 'none',
            background: (loading || fetchingUrl) ? 'rgba(124,58,237,0.5)' : '#7c3aed',
            color: '#f5f0eb',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: (loading || fetchingUrl) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: (loading || fetchingUrl) ? 'none' : '0 0 28px rgba(124,58,237,0.35)',
          }}
        >
          {fetchingUrl ? 'Preparing checkout...' : loading ? 'Processing...' : 'Pay 7 EUR and unlock'}
        </button>

        <p style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#5a5464', marginTop: '1rem', lineHeight: '1.5' }}>
          Secure payment via Stripe. Your reading is saved to your account.
        </p>
      </div>
    </main>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={null}>
      <UnlockContent />
    </Suspense>
  );
}
