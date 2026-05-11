'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import type { Language } from '@/lib/language-context';

const ELEMENT_LABELS = [
  { key: 'cube', label: 'The Cube' },
  { key: 'ladder', label: 'The Ladder' },
  { key: 'flowers', label: 'The Flowers' },
  { key: 'animal', label: 'The Animal' },
  { key: 'storm', label: 'The Storm' },
];

const STATUS_LINES = [
  'Mapping your room...',
  'Reading the objects...',
  'Finding the pattern...',
];

function GeneratingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language: contextLanguage } = useLanguage();
  const sessionId = searchParams.get('session');
  const [visibleLines, setVisibleLines] = useState(0);
  const [visibleCards, setVisibleCards] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showLoader, setShowLoader] = useState(false);
  const [language, setLanguage] = useState<Language>(contextLanguage);
  const synthesisStarted = useRef(false);

  useEffect(() => {
    if (!sessionId) { router.push('/'); return; }

    const loadAnswers = async () => {
      const { data } = await supabase
        .from('responses_raw')
        .select('question_key, answer_text')
        .eq('session_id', sessionId);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach(r => { map[r.question_key] = r.answer_text; });
        setAnswers(map);
      }

      const { data: sessionData } = await supabase
        .from('sessions')
        .select('language')
        .eq('id', sessionId)
        .single();

      if (sessionData?.language) {
        setLanguage(sessionData.language as Language);
      }
    };

    loadAnswers();

    const t1 = setTimeout(() => setVisibleLines(1), 400);
    const t2 = setTimeout(() => setVisibleLines(2), 1800);
    const t3 = setTimeout(() => setVisibleLines(3), 3200);

    const cardTimers = ELEMENT_LABELS.map((_, i) =>
      setTimeout(() => setVisibleCards(n => Math.max(n, i + 1)), 3000 + i * 900)
    );

    const loaderTimer = setTimeout(() => setShowLoader(true), 7500);

    if (!synthesisStarted.current) {
      synthesisStarted.current = true;
      callSynthesis();
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(loaderTimer);
      cardTimers.forEach(clearTimeout);
    };
  }, [sessionId, router]);

  const callSynthesis = async () => {
    try {
      if (!SUPABASE_URL) {
        throw new Error('SUPABASE_URL is not defined');
      }

      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token || SUPABASE_ANON_KEY;

      console.log('SUPABASE_URL value:', SUPABASE_URL);
      console.log('SUPABASE_ANON_KEY value:', typeof SUPABASE_ANON_KEY, SUPABASE_ANON_KEY?.substring(0, 20));
      console.log('token value:', typeof token, token?.substring(0, 20));

      const res = await fetch(`${SUPABASE_URL}/functions/v1/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ session_id: sessionId, language: language }),
      });

      if (res.ok) {
        pollForCompletion();
      } else {
        console.error('Synthesize failed:', res.status, await res.text());
        setTimeout(() => router.push(`/results?session=${sessionId}`), 8000);
      }
    } catch (err) {
      console.error('Synthesize error:', err);
      setTimeout(() => router.push(`/results?session=${sessionId}`), 8000);
    }
  };

  const pollForCompletion = async () => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      attempts++;
      const { data } = await supabase
        .from('sessions')
        .select('synthesis_status')
        .eq('id', sessionId)
        .maybeSingle();

      if (data?.synthesis_status === 'complete') {
        router.push(`/results?session=${sessionId}`);
      } else if (attempts < maxAttempts) {
        setTimeout(poll, 2000);
      } else {
        router.push(`/results?session=${sessionId}`);
      }
    };

    setTimeout(poll, 3000);
  };

  return (
    <main
      className="relative min-h-screen diagonal-grid flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="pointer-events-none fixed inset-0 glow-pulse-bg"
        style={{
          background: 'radial-gradient(ellipse 800px 600px at 50% 45%, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }}
      />

      <div style={{ maxWidth: '600px', width: '100%', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          {STATUS_LINES.map((line, i) => (
            <p
              key={i}
              style={{
<<<<<<< HEAD
                fontFamily: "'Inter', sans-serif",
=======
                fontFamily: "'Inter', Georgia, serif",
>>>>>>> claude/determined-banzai-95f34d
                fontStyle: 'italic',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                color: visibleLines > i ? 'var(--text-primary)' : 'transparent',
                marginBottom: '0.6rem',
                transition: 'color 0.6s ease',
                opacity: visibleLines > i ? (i === visibleLines - 1 ? 1 : 0.4) : 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ELEMENT_LABELS.map(({ key, label }, i) => (
            <div
              key={key}
              style={{
                background: 'var(--surface)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                opacity: visibleCards > i ? 1 : 0,
                transform: visibleCards > i ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  marginBottom: '0.35rem',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {answers[key]
                  ? answers[key].slice(0, 80) + (answers[key].length > 80 ? '...' : '')
                  : '--'}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', opacity: showLoader ? 1 : 0, transition: 'opacity 1.2s ease' }}>
<<<<<<< HEAD
          <p style={{ fontFamily: "'Inter', sans-serif", fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
=======
          <p style={{ fontFamily: "'Inter', Georgia, serif", fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
>>>>>>> claude/determined-banzai-95f34d
            Interpreting your space...
          </p>
          <div style={{ height: '2px', maxWidth: '200px', margin: '0 auto', borderRadius: '2px', background: 'rgba(124,58,237,0.15)', overflow: 'hidden' }}>
            <style>{`
              @keyframes progress-pulse {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
              }
            `}</style>
            <div style={{ height: '100%', width: '50%', background: 'var(--accent)', borderRadius: '2px', animation: showLoader ? 'progress-pulse 1.8s ease-in-out infinite' : 'none' }} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GeneratingPage() {
  return (
    <Suspense fallback={null}>
      <GeneratingContent />
    </Suspense>
  );
}
