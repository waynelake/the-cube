'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';

const ELEMENT_KEYS = ['cube', 'ladder', 'flowers', 'animal', 'storm'] as const;
type ElementKey = typeof ELEMENT_KEYS[number];

const ELEMENT_LABELS: Record<ElementKey, string> = {
  cube: 'The Cube',
  ladder: 'The Ladder',
  flowers: 'The Flowers',
  animal: 'The Animal',
  storm: 'The Storm',
};

type ReadingTraits = {
  self_image?: string;
  ambition?: string;
  relationships?: string;
  freedom?: string;
  challenges?: string;
};

const TRAIT_MAP: Record<ElementKey, keyof ReadingTraits> = {
  cube: 'self_image',
  ladder: 'ambition',
  flowers: 'relationships',
  animal: 'freedom',
  storm: 'challenges',
};

function formatName(email: string): string {
  return email
    .split('@')[0]
    .split(/[._\-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');
  const paymentStatus = searchParams.get('payment');

  const [traits, setTraits] = useState<ReadingTraits | null>(null);
  const [summary, setSummary] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

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
      setUserName(profile.email ? formatName(profile.email) : '');
    }

    const { data: insight } = await supabase
      .from('derived_insights')
      .select('traits, summary, created_at')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (insight) {
      if (insight.traits) setTraits(insight.traits as ReadingTraits);
      if (insight.summary) setSummary(insight.summary);
      if (insight.created_at) {
        const d = new Date(insight.created_at);
        if (!isNaN(d.getTime())) {
          setSessionDate(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
        }
      }
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
    if (!traits) return;
    const lines: string[] = [`THE CUBE — A Reading for ${userName || 'You'}`, ''];
    ELEMENT_KEYS.forEach(k => {
      lines.push(ELEMENT_LABELS[k].toUpperCase());
      lines.push(traits[TRAIT_MAP[k]] || '');
      lines.push('');
    });
    if (summary) { lines.push('---', '', summary); }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
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

  if (!traits) {
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
              padding: '0.7rem 1.75rem', borderRadius: '8px', border: 'none',
              background: '#7c3aed', color: '#f5f0eb',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', cursor: 'pointer',
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

      <div style={{
        maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem 6rem',
        opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.75rem' }}>
            Your reading
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            color: '#f5f0eb', fontWeight: 500, lineHeight: '1.2', marginBottom: '0.6rem',
          }}>
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
                  {traits[TRAIT_MAP[key]]}
                </p>
              </div>
              {i < ELEMENT_KEYS.length - 1 && (
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)' }} />
              )}
            </div>
          ))}
        </div>

        {isPaid ? (
          <PaidContent summary={summary} />
        ) : (
          <PaywallSection sessionId={sessionId || ''} summary={summary} />
        )}
      </div>
    </main>
  );
}

function PaidContent({ summary }: { summary: string }) {
  const paragraphs = summary.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  return (
    <div style={{ marginBottom: '3.5rem' }}>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)', marginBottom: '2.5rem' }} />
      {paragraphs.map((para, i) => (
        <p key={i} style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '1rem', color: '#f5f0eb', lineHeight: '1.85',
          marginBottom: i < paragraphs.length - 1 ? '1.5rem' : 0,
        }}>
          {para}
        </p>
      ))}
    </div>
  );
}

function PaywallSection({ sessionId, summary }: { sessionId: string; summary: string }) {
  const preview = summary.split(/\n{2,}/)[0] || '';

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', overflow: 'hidden', maxHeight: '160px', borderRadius: '12px' }}>
        <div style={{
          filter: 'blur(6px)', opacity: 0.45, pointerEvents: 'none',
          userSelect: 'none' as const, padding: '1.5rem', background: '#13131a',
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#f5f0eb', lineHeight: '1.8', fontSize: '0.95rem' }}>
            {preview}
          </p>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 0%, #0a0a0f 85%)',
        }} />
      </div>

      <div style={{
        background: '#13131a', border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '16px', padding: '2.5rem', textAlign: 'center',
        marginTop: '1.5rem', boxShadow: '0 0 60px rgba(124,58,237,0.08)',
      }}>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '1.5rem', color: '#f5f0eb', fontWeight: 500, marginBottom: '1rem',
        }}>
          Your reading continues.
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', color: '#8b8494',
          lineHeight: '1.7', maxWidth: '420px', margin: '0 auto 2rem',
        }}>
          You&apos;ve seen enough to know this isn&apos;t generic. The full interpretation of your space — all five elements, the pattern that runs through them, and what it means — is waiting.
        </p>
        <Link
          href={`/unlock?session=${sessionId}`}
          style={{
            display: 'inline-block', padding: '0.9rem 2.5rem', borderRadius: '8px',
            background: '#7c3aed', color: '#f5f0eb',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 500,
            textDecoration: 'none', boxShadow: '0 0 32px rgba(124,58,237,0.35)',
            transition: 'all 0.2s',
          }}
        >
          Unlock full reading — 7 EUR
        </Link>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.76rem', color: '#5a5464', marginTop: '1rem' }}>
          One-time payment. Instant access.
        </p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}
