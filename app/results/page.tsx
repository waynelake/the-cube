'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { InsightTraits } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';

const ELEMENT_KEYS = ['cube', 'ladder', 'flowers', 'animal', 'storm'] as const;
const ELEMENT_LABELS: Record<string, string> = {
  cube: 'The Cube',
  ladder: 'The Ladder',
  flowers: 'The Flowers',
  animal: 'The Animal',
  storm: 'The Storm',
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');
  const [insights, setInsights] = useState<InsightTraits | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const paymentStatus = searchParams.get('payment');

  const loadResults = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth?mode=signin'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, email')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (profile) {
      setIsPaid(profile.subscription_plan === 'one_time');
      const emailName = profile.email?.split('@')[0] || '';
      const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      setUserName(displayName);
    }

    console.log('results page sessionId:', sessionId);

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    console.log('sessions query result:', session, sessionError);

    if (session) {
      const d = new Date(session.created_at);
      setSessionDate(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    }

    const { data: insight, error: insightError } = await supabase
      .from('derived_insights')
      .select('traits, summary')
      .eq('session_id', sessionId)
      .maybeSingle();

    console.log('insight query result:', insight, insightError);

    if (insight?.traits) {
      setInsights(insight.traits as InsightTraits);
    }

    setLoading(false);
    setTimeout(() => setVisible(true), 100);
  };

  useEffect(() => {
    if (!sessionId) { router.push('/'); return; }
    if (paymentStatus === 'success') {
      setTimeout(() => loadResults(), 2000);
    } else {
      loadResults();
    }
  }, [sessionId]);

  const handleCopy = () => {
    if (!insights) return;
    const text = buildFullText(insights, userName);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) {
    return (
      <main className="relative min-h-screen diagonal-grid flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="pointer-events-none fixed inset-0 glow-pulse-bg"
          style={{ background: 'radial-gradient(ellipse 700px 500px at 50% 45%, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', color: '#5a5464', fontSize: '1.1rem' }}>
          Loading your reading...
        </p>
      </main>
    );
  }

  if (!insights) {
    return (
      <main className="relative min-h-screen diagonal-grid flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#f5f0eb', fontSize: '1.3rem', marginBottom: '1rem' }}>
            Your reading is being prepared.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#8b8494', fontSize: '0.9rem', marginBottom: '2rem' }}>
            This can take a moment. Please check back shortly.
          </p>
          <button
            onClick={loadResults}
            style={{
              padding: '0.7rem 1.75rem',
              borderRadius: '8px',
              border: 'none',
              background: '#7c3aed',
              color: '#f5f0eb',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen diagonal-grid" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 700px 400px at 50% 20%, rgba(124,58,237,0.07) 0%, transparent 65%)' }} />

      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(124,58,237,0.08)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <CubeIcon size={22} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,235,0.35)' }}>
            The Cube
          </span>
        </Link>
        {isPaid && (
          <button
            onClick={handleCopy}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '6px',
              border: '1px solid rgba(124,58,237,0.25)', background: 'transparent',
              color: '#8b8494', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? 'Copied' : 'Copy my reading'}
          </button>
        )}
      </nav>

      <div
        style={{
          maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem 6rem',
          opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease',
          position: 'relative', zIndex: 10,
        }}
      >
        <div style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.75rem' }}>
            Your reading
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              color: '#f5f0eb',
              fontWeight: 500,
              lineHeight: '1.2',
              marginBottom: '0.6rem',
            }}
          >
            The Space of {userName || 'You'}
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#5a5464' }}>
            {sessionDate}
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          {ELEMENT_KEYS.map((key, i) => (
            <div key={key}>
              <div style={{ padding: '1.5rem 0' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.6rem' }}>
                  {ELEMENT_LABELS[key]}
                </p>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)', color: '#f5f0eb', lineHeight: '1.5', fontWeight: 400 }}>
                  {insights[key]?.lens}
                </p>
              </div>
              {i < ELEMENT_KEYS.length - 1 && (
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)' }} />
              )}
            </div>
          ))}
        </div>

        {!isPaid && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)', marginBottom: '2rem' }} />
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '1rem',
                color: '#8b8494',
                lineHeight: '1.9',
                marginBottom: '0.75rem',
              }}
            >
              {insights.cube?.observation}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: '#f5f0eb', lineHeight: '1.8' }}>
              {insights.cube?.interpretation}
            </p>
          </div>
        )}

        {isPaid ? (
          <PaidContent insights={insights} />
        ) : (
          <PaywallSection sessionId={sessionId || ''} />
        )}
      </div>
    </main>
  );
}

function PaidContent({ insights }: { insights: InsightTraits }) {
  return (
    <>
      {ELEMENT_KEYS.map((key) => (
        <div key={key} style={{ marginBottom: '3.5rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)', marginBottom: '2.5rem' }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '1.25rem' }}>
            {ELEMENT_LABELS[key]}
          </p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '0.95rem', color: '#8b8494', lineHeight: '1.9', marginBottom: '1rem' }}>
            {insights[key]?.observation}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: '#f5f0eb', lineHeight: '1.85', marginBottom: '1.25rem' }}>
            {insights[key]?.interpretation}
          </p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.05rem', fontWeight: 600, color: '#f5f0eb', lineHeight: '1.5' }}>
            {insights[key]?.lens}
          </p>
        </div>
      ))}

      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)', marginBottom: '2.5rem' }} />
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.6rem, 3vw, 2rem)', color: '#f5f0eb', fontWeight: 500, marginBottom: '1.5rem' }}>
          The Pattern
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', color: '#f5f0eb', lineHeight: '1.85', whiteSpace: 'pre-line' }}>
          {insights.pattern}
        </p>
      </div>

      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)', marginBottom: '2.5rem' }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '1.5rem' }}>
          Takeaways
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {insights.takeaways?.map((t, i) => (
            <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1rem', color: 'rgba(124,58,237,0.5)', minWidth: '1.5rem', fontWeight: 500 }}>
                {i + 1}
              </span>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.05rem', color: '#f5f0eb', lineHeight: '1.5' }}>
                {t}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ textAlign: 'center', padding: '3rem 1rem', position: 'relative' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)', marginBottom: '3rem' }} />
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
            color: '#f5f0eb',
            lineHeight: '1.5',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          &ldquo;{insights.summary_line}&rdquo;
        </p>
      </div>
    </>
  );
}

function PaywallSection({ sessionId }: { sessionId: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          maxHeight: '220px',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            filter: 'blur(8px)',
            opacity: 0.4,
            pointerEvents: 'none',
            userSelect: 'none',
            padding: '1.5rem',
            background: '#13131a',
          }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.75rem' }}>
            The Ladder
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#f5f0eb', lineHeight: '1.8', marginBottom: '1rem' }}>
            There is a structure in your life you have built in order to reach something -- and whether it holds depends entirely on what it is resting against.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.75rem' }}>
            The Flowers
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#f5f0eb', lineHeight: '1.8' }}>
            What you tend, what you leave to itself, and what you allow to die reveals the shape of your attention.
          </p>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 0%, #0a0a0f 90%)',
          }}
        />
      </div>

      <div
        style={{
          background: '#13131a',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'center',
          marginTop: '1.5rem',
          boxShadow: '0 0 60px rgba(124,58,237,0.08)',
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.5rem',
            color: '#f5f0eb',
            fontWeight: 500,
            marginBottom: '1rem',
          }}
        >
          Your reading continues.
        </h3>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.92rem',
            color: '#8b8494',
            lineHeight: '1.7',
            marginBottom: '2rem',
            maxWidth: '420px',
            margin: '0 auto 2rem',
          }}
        >
          You&apos;ve seen enough to know this isn&apos;t generic. The full interpretation of your space -- all five elements, the pattern that runs through them, and what it means -- is waiting.
        </p>
        <Link
          href={`/unlock?session=${sessionId}`}
          style={{
            display: 'inline-block',
            padding: '0.9rem 2.5rem',
            borderRadius: '8px',
            background: '#7c3aed',
            color: '#f5f0eb',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 500,
            textDecoration: 'none',
            boxShadow: '0 0 32px rgba(124,58,237,0.35)',
            transition: 'all 0.2s',
          }}
        >
          Unlock full reading -- 7 EUR
        </Link>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.76rem', color: '#5a5464', marginTop: '1rem' }}>
          One-time payment. Instant access.
        </p>
      </div>
    </div>
  );
}

function buildFullText(insights: InsightTraits, name: string): string {
  const lines: string[] = [];
  lines.push(`THE CUBE -- A Reading for ${name || 'You'}`);
  lines.push('');

  const keys = ['cube', 'ladder', 'flowers', 'animal', 'storm'] as const;
  const labels: Record<string, string> = { cube: 'THE CUBE', ladder: 'THE LADDER', flowers: 'THE FLOWERS', animal: 'THE ANIMAL', storm: 'THE STORM' };

  keys.forEach(k => {
    lines.push(labels[k]);
    lines.push(insights[k]?.observation || '');
    lines.push('');
    lines.push(insights[k]?.interpretation || '');
    lines.push('');
    lines.push(insights[k]?.lens || '');
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push('THE PATTERN');
  lines.push(insights.pattern || '');
  lines.push('');
  lines.push('TAKEAWAYS');
  insights.takeaways?.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  lines.push('');
  lines.push(`"${insights.summary_line}"`);

  return lines.join('\n');
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}
