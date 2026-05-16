'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

type QuestionKey = 'cube' | 'ladder' | 'flowers' | 'animal' | 'storm';

interface Question {
  key: QuestionKey;
  title: string;
  prompt: string[];
  nudges: string[];
  placeholder: string;
}

function getQuestions(language: 'EN' | 'DE'): Question[] {
  const cubeNudges = t(language, 'experience_page.cubeNudges') as string[];
  const ladderNudges = t(language, 'experience_page.ladderNudges') as string[];
  const flowersNudges = t(language, 'experience_page.flowersNudges') as string[];
  const animalNudges = t(language, 'experience_page.animalNudges') as string[];
  const stormNudges = t(language, 'experience_page.stormNudges') as string[];

  return [
    {
      key: 'cube',
      title: t(language, 'results_page.cube'),
      prompt: [
        t(language, 'experience_page.intro'),
        t(language, 'experience_page.cubeIntro'),
        t(language, 'experience_page.cubeQuestion'),
      ],
      nudges: cubeNudges,
      placeholder: t(language, 'experience_page.placeholder'),
    },
    {
      key: 'ladder',
      title: t(language, 'results_page.ladder'),
      prompt: [
        t(language, 'experience_page.ladderIntro'),
        t(language, 'experience_page.ladderQuestion'),
      ],
      nudges: ladderNudges,
      placeholder: t(language, 'experience_page.placeholder'),
    },
    {
      key: 'flowers',
      title: t(language, 'results_page.flowers'),
      prompt: [
        t(language, 'experience_page.flowersIntro'),
        t(language, 'experience_page.flowersQuestion'),
      ],
      nudges: flowersNudges,
      placeholder: t(language, 'experience_page.placeholder'),
    },
    {
      key: 'animal',
      title: t(language, 'results_page.animal'),
      prompt: [
        t(language, 'experience_page.animalIntro'),
        t(language, 'experience_page.animalQuestion'),
      ],
      nudges: animalNudges,
      placeholder: t(language, 'experience_page.placeholder'),
    },
    {
      key: 'storm',
      title: t(language, 'results_page.storm'),
      prompt: [
        t(language, 'experience_page.stormIntro'),
        t(language, 'experience_page.stormQuestion'),
      ],
      nudges: stormNudges,
      placeholder: t(language, 'experience_page.placeholder'),
    },
  ];
}

export default function ExperiencePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({
    cube: '', ladder: '', flowers: '', animal: '', storm: '',
  });
  const [nudgesOpen, setNudgesOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const questions = getQuestions(language);
  const question = questions[step];

  const initSession = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth?mode=signin');
      return;
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ auth_user_id: user.id, email: user.email })
        .select('id')
        .single();
      profile = newProfile;
    }

    if (!profile) return;

    const { count } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id);

    const { data: session } = await supabase
      .from('sessions')
      .insert({
        profile_id: profile.id,
        status: 'active',
        synthesis_status: 'pending',
        session_number: (count ?? 0) + 1,
        language: language,
      })
      .select('id')
      .single();

    if (session) {
      setSessionId(session.id);
      setProfileId(profile.id);
    }
  }, [router, language]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const goToStep = async (nextStep: number) => {
    setVisible(false);
    await new Promise(r => setTimeout(r, 300));
    setStep(nextStep);
    setNudgesOpen(false);
    setVisible(true);
  };

  const handleContinue = async () => {
    if (step < questions.length - 1) {
      await goToStep(step + 1);
    } else {
      await handleReveal();
    }
  };

  const handleBack = async () => {
    if (step > 0) await goToStep(step - 1);
  };

  const handleReveal = async () => {
    setSubmitting(true);
    if (!sessionId || !profileId) return;

    const insertions = questions.map((q) => ({
      session_id: sessionId,
      profile_id: profileId,
      question_key: q.key,
      answer_text: answers[q.key],
    }));

    await supabase.from('responses_raw').insert(insertions);

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ status: 'completed', synthesis_status: 'generating' })
      .eq('id', sessionId);

    if (updateError) console.error('Session update failed:', updateError);

    router.push(`/generating?session=${sessionId}`);
  };

  const currentAnswer = answers[question.key];

  return (
    <main
      className="relative min-h-screen diagonal-grid"
      style={{ backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 700px 500px at 50% 40%, rgba(124,58,237,0.07) 0%, transparent 70%)' }}
      />

      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem 2rem 1rem',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Step {step + 1} of 5
        </div>

        <button
          onClick={() => setShowExitModal(true)}
          style={{
            position: 'absolute',
            right: '2rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s',
          }}
          aria-label="Exit experience"
        >
          <X size={18} />
        </button>
      </header>

      <div style={{ height: '2px', background: 'rgba(124,58,237,0.1)', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            height: '100%',
            width: `${((step + 1) / 5) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), #9d5ff0)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 8px rgba(124,58,237,0.6)',
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {step === 0 && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontStyle: 'italic',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginBottom: '2.5rem',
              }}
            >
              {t(language, 'experience_page.duration')}
            </p>
          )}

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}
          >
            {question.title}
          </p>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {question.prompt.map((line, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                  lineHeight: '1.4',
                  color: 'var(--text-primary)',
                  fontWeight: 400,
                  marginBottom: i < question.prompt.length - 1 ? '0.75rem' : 0,
                }}
              >
                {line}
              </p>
            ))}
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <textarea
              value={currentAnswer}
              onChange={(e) => setAnswers(prev => ({ ...prev, [question.key]: e.target.value }))}
              placeholder={question.placeholder}
              rows={6}
              style={{
                width: '100%',
                padding: '1.25rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(124,58,237,0.18)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                lineHeight: '1.7',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.18)'; }}
            />
          </div>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            {t(language, 'experience_page.dontOverthink')}
          </p>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <button
              onClick={() => setNudgesOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'color 0.2s',
              }}
            >
              {t(language, 'experience_page.needNudge')}
              {nudgesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {nudgesOpen && (
              <ul
                style={{
                  listStyle: 'none',
                  padding: '1rem',
                  margin: '0.75rem auto 0',
                  maxWidth: '360px',
                  background: 'rgba(19,19,26,0.8)',
                  borderRadius: '10px',
                  border: '1px solid rgba(124,58,237,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                {question.nudges.map((nudge, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {nudge}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: step === 0 ? 'flex-end' : 'space-between', alignItems: 'center' }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  padding: '0.7rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t(language, 'experience_page.back')}
              </button>
            )}

            <button
              onClick={handleContinue}
              disabled={submitting}
              style={{
                padding: '0.7rem 2rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent)',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.92rem',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 24px rgba(124,58,237,0.3)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? t(language, 'experience_page.preparing') : step === questions.length - 1 ? t(language, 'experience_page.reveal') : t(language, 'experience_page.continue')}
            </button>
          </div>
        </div>
      </div>

      {showExitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(10,10,15,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.3rem',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                fontWeight: 500,
              }}
            >
              Leave the reading?
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
              Your answers won&apos;t be saved if you leave now.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowExitModal(false)}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Stay
              </button>
              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(224,90,90,0.15)',
                  color: '#e05a5a',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
