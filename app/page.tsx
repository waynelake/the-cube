'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { CubeIcon } from '@/components/cube-icon';
import { ThemeToggle } from '@/components/theme-provider';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

const LangToggle = dynamic(() => import('@/components/lang-toggle').then(mod => ({ default: mod.LangToggle })), { ssr: false });

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

// ─── Shared constants ─────────────────────────────────────────────────────────

const GLASS: React.CSSProperties = {
  background: 'rgba(96, 78, 78, 0.12)',
  backdropFilter: 'blur(24px) brightness(1.1)',
  WebkitBackdropFilter: 'blur(24px) brightness(1.1)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
};

const SECTION_PAD = 'clamp(6rem, 12vw, 10rem) clamp(1.5rem, 5vw, 4rem)';

const H2: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 'clamp(2rem, 4vw, 4rem)',
  fontWeight: 400,
  fontStyle: 'normal',
  letterSpacing: '-0.02em',
  lineHeight: 1.05,
  color: '#fff',
  marginBottom: '1.25rem',
};

const BODY: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  lineHeight: 1.8,
  color: 'rgba(240,235,255,0.6)',
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionPill({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.28rem 0.8rem',
        borderRadius: '9999px',
        border: '1px solid rgba(124,58,237,0.35)',
        background: 'rgba(124,58,237,0.08)',
        marginBottom: '1rem',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#7c3aed',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.05em',
          color: 'rgba(167,139,250,0.9)',
        }}
      >
        {label}
      </span>
    </div>
  );
}


// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav({ language }: { language: 'EN' | 'DE' }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        background: scrolled ? 'rgba(9,9,15,0.88)' : 'transparent',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid transparent',
        transition:
          'background 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Link
        href="/"
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}
      >
        <CubeIcon size={20} />
        <span
          style={{
            fontFamily: "'Gotens', sans-serif",
            fontSize: '1rem',
            color: '#fff',
            letterSpacing: '0.01em',
          }}
        >
          {t(language, 'nav.title')}
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <LangToggle />
        <ThemeToggle />
        <Link
          href="/auth?mode=signup"
          className="nav-cta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.9rem 2.25rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#f0ebff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {t(language, 'nav.beginReading')}
        </Link>
      </div>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ language }: { language: 'EN' | 'DE' }) {
  return (
    <section
      style={{
        position: 'relative',
        padding: '13rem 1.5rem 7rem',
        textAlign: 'left',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 120% 65% at 50% 0%, rgba(124,58,237,0.28) 0%, transparent 65%)',
      }}
    >
      <img
        src="/images/Stars-2.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '60%',
          objectFit: 'contain',
          pointerEvents: 'none',
          opacity: 0.8,
        }}
      />
      <img
        src="/images/Stars-a.png"
        alt=""
        style={{
          position: 'absolute',
          bottom: 0,
          left: '20%',
          width: '50%',
          height: '60%',
          objectFit: 'contain',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        style={{ position: 'relative' }}
      >
        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: "'Gotens', sans-serif",
            fontSize: 'clamp(5.5rem, 16vw, 11rem)',
            lineHeight: 0.92,
            fontWeight: 400,
            color: '#ffffff',
            margin: '0 0 1.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          {t(language, 'hero.title')}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{
            ...BODY,
            color: 'rgba(240,235,255,0.55)',
            marginBottom: '2.5rem',
            letterSpacing: '0.01em',
          }}
        >
          {t(language, 'hero.subtitle')}
        </motion.p>

        <motion.div variants={fadeUp}>
          <Link
            href="/auth?mode=signup"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2.25rem',
              borderRadius: '9999px',
              background: '#CBC2E5',
              color: '#150A35',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(203,194,229,0.25)',
            }}
          >
            {t(language, 'hero.cta')}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ language }: { language: 'EN' | 'DE' }) {
  return (
    <div style={{ maxWidth: '860px', margin: '0 0 6rem', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.6rem 0.6rem 0.6rem 1.25rem',
          borderRadius: '9999px',
          background: 'rgba(14, 12, 24, 0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          gap: '1.25rem',
        }}
      >
        {/* Bullet */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(196,181,253,0.55)' }} />
        </div>

        {/* Stat 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>15</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
            {t(language, 'hero.stats.languages')}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Stat 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>120+</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
            {t(language, 'hero.stats.yearsExperience')}
          </span>
        </div>

        {/* Right pill: avatars + count */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.45rem 1rem 0.45rem 0.45rem',
          borderRadius: '9999px',
          background: 'rgba(6, 5, 14, 0.95)',
          border: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {['?img=47', '?img=12', '?img=33'].map((q, i) => (
              <img key={i} src={`https://i.pravatar.cc/40${q}`} alt=""
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  border: '2px solid rgba(6, 5, 14, 0.95)',
                  marginLeft: i === 0 ? 0 : '-9px',
                  objectFit: 'cover',
                  position: 'relative', zIndex: 3 - i,
                }}
              />
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>100+</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.57rem', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.02em', marginTop: '0.1rem' }}>{t(language, 'hero.stats.usersPlayed')}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks({ language }: { language: 'EN' | 'DE' }) {
  const stepsData = t(language, 'howItWorks.steps');
  const steps = Array.isArray(stepsData) ? stepsData : [
    {
      number: '01',
      title: 'Describe your space',
      body: 'A simple space is described to you. Five objects appear in it. You describe what you see.',
    },
    {
      number: '02',
      title: 'The objects are read',
      body: 'Each object maps to a dimension of your inner world. The reading draws from depth psychology and 50 years of symbolic research.',
    },
    {
      number: '03',
      title: 'Get your reading',
      body: 'A precise, personal reading. Not generic. Written only for what you described.',
    },
  ];

  return (
    <section style={{ padding: SECTION_PAD }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                ...GLASS,
                padding: '2.25rem',
                borderRadius: '30px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.75rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                {step.number}
              </span>
              <div style={{ marginTop: '2.5rem' }}>
                <h3
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: '0.85rem',
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ ...BODY, fontSize: '0.9rem' }}>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── The Experience ───────────────────────────────────────────────────────────



function TheExperience({ language }: { language: 'EN' | 'DE' }) {
  const experienceFeaturesData = t(language, 'experience.features');
  const experienceFeatures = Array.isArray(experienceFeaturesData) ? experienceFeaturesData : [
    {
      title: 'Five objects. No right answers.',
      body: 'A simple space is described to you. Five objects appear in it. You describe what you see, and how you see it.',
    },
    {
      title: 'A reading that sees through the surface.',
      body: 'Each object maps to something real. The reading draws from depth psychology and decades of symbolic research.',
    },
    {
      title: 'It names what you already knew.',
      body: 'A precise, personal reading. Not generic. Written only for what you described in your own words.',
    },
  ];
  const features = experienceFeatures.map((f, i) => ({
    shape: <img src={["/images/icon-star.png", "/images/icon-small-star.png", "/images/icon-circle.png"][i]} alt="" style={{ width: '125px', height: '125px', objectFit: 'contain' }} />,
    title: f.title,
    body: f.body,
  }));

  return (
    <section
      style={{
        padding: SECTION_PAD,
        background: 'rgba(255,255,255,0.01)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} style={{ marginBottom: '3rem' }}>
            <SectionPill label={t(language, 'experience.label')} />
            <h2 style={{ ...H2 }}>{t(language, 'experience.title')}</h2>
            <p style={{ ...BODY, maxWidth: '420px' }}>
              {t(language, 'experience.subtitle')}
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.85, ease: EASE, delay: i * 0.18 }}
                style={{
                  ...GLASS,
                  padding: '2.5rem',
                  borderRadius: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem',
                  minHeight: '300px',
                }}
              >
                <div>{f.shape}</div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#fff',
                      marginBottom: '0.75rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ ...BODY, fontSize: '0.9rem' }}>{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Foundation ───────────────────────────────────────────────────────────────

function Foundation({ language }: { language: 'EN' | 'DE' }) {
  const authors = ['Jung', 'Hillman', 'von Franz', 'Estés', 'Winnicott'];

  return (
    <section
      style={{
        padding: SECTION_PAD,
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 120% 70% at 50% 50%, rgba(80,30,160,0.22) 0%, transparent 70%)',
      }}
    >

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <SectionPill label={t(language, 'theoryAndResearch.label')} />
          </motion.div>

          <motion.h2 variants={fadeUp} style={{
            ...H2,
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(1.75rem, 3.5vw, 4rem)',
            fontWeight: 500,
            color: 'rgba(240,235,255,0.55)',
          }}>
            {t(language, 'theoryAndResearch.title')}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            style={{
              ...BODY,
              maxWidth: '600px',
              margin: '0 auto 3rem',
            }}
          >
            {(() => {
              const text = t(language, 'theoryAndResearch.body');
              const highlights = language === 'EN'
                ? ['depth psychologists', 'believed the psyche speaks in images']
                : ['Tiefenpsychologen', 'die glaubten, dass die Psyche in Bildern spricht'];

              let parts = [text];
              highlights.forEach(highlight => {
                const newParts: (string | JSX.Element)[] = [];
                parts.forEach(part => {
                  if (typeof part === 'string') {
                    const regex = new RegExp(`(${highlight})`, 'gi');
                    const split = part.split(regex);
                    split.forEach((s, i) => {
                      if (regex.test(s)) {
                        newParts.push(<span key={i} style={{ color: '#ffffff' }}>{s}</span>);
                      } else {
                        newParts.push(s);
                      }
                    });
                  } else {
                    newParts.push(part);
                  }
                });
                parts = newParts;
              });
              return parts;
            })()}
          </motion.p>

          <motion.div
            variants={stagger}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
            }}
          >
            {authors.map((author, i) => (
              <motion.span
                key={i}
                variants={fadeIn}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.4)',
                  padding: '0.28rem 0.9rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {author}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      "It bypasses the way I think. If you'd asked me directly, I don't know if I'd have answered as honestly, or even known how to answer.",
    name: 'Sarah K.',
    role: 'Designer',
  },
  {
    quote: "Scary how accurate it is. I really didn't expect that.",
    name: 'Tom R.',
    role: 'Founder',
  },
  {
    quote:
      "It named something I knew was there but didn't know how to put into words.",
    name: 'Maya L.',
    role: 'Content Strategist',
  },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[number] }) {
  return (
    <div
      style={{
        ...GLASS,
        width: '380px',
        flexShrink: 0,
        padding: '2rem',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.18rem' }}>
        {[...Array(5)].map((_, j) => (
          <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill="#7c3aed">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <p
        style={{
          ...BODY,
          fontSize: '0.9rem',
          color: 'rgba(240,235,255,0.75)',
          fontStyle: 'italic',
          flex: 1,
        }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(167,139,250,0.4))',
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 500,
              color: '#fff',
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.38)',
            }}
          >
            {t.role}
          </div>
        </div>
      </div>
    </div>
  );
}

function Testimonials({ language }: { language: 'EN' | 'DE' }) {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      style={{
        padding: `clamp(6rem, 12vw, 10rem) 0`,
        background: 'rgba(255,255,255,0.015)',
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 clamp(1.5rem, 5vw, 4rem)',
          marginBottom: '3rem',
        }}
      >
        <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
          <SectionPill label={t(language, 'testimonials.label')} />
          <h2 style={{ ...H2, textAlign: 'center', margin: '0 auto 1.25rem' }}>
            {t(language, 'testimonials.title')}
          </h2>
        </motion.div>
      </motion.div>

      {/* Marquee */}
      <div style={{ position: 'relative' }}>
        {/* Left fade mask */}
        <img
          src="/images/Hero_Gradient.png"
          alt=""
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '200px',
            objectFit: 'cover',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        {/* Right fade mask — mirrored */}
        <img
          src="/images/Hero_Gradient.png"
          alt=""
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: '200px',
            objectFit: 'cover',
            pointerEvents: 'none',
            zIndex: 2,
            transform: 'scaleX(-1)',
          }}
        />

        <div style={{ overflow: 'hidden' }}>
          <div
            className="marquee-inner"
            style={{
              display: 'flex',
              gap: '1.5rem',
              width: 'max-content',
              animation: 'marquee 30s linear infinite',
              paddingLeft: '1.5rem',
            }}
          >
            {doubled.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

type Billing = 'monthly' | 'annual';

interface PricingTier {
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  subtitleMonthly: string | null;
  subtitleAnnual: string | null;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

function Pricing({ language }: { language: 'EN' | 'DE' }) {
  const [billing, setBilling] = useState<Billing>('annual');

  const pricingTiersData = t(language, 'pricing.tiers');
  const pricingTiers = Array.isArray(pricingTiersData) ? pricingTiersData : [
    {
      name: 'Free',
      price: '0€',
      subtitle: null,
      features: ['First reading preview', 'Five trait summaries', 'Strategic lens lines'],
      cta: 'Begin for free',
      highlighted: false,
    },
    {
      name: 'Single Reading',
      price: '7€',
      subtitle: 'one time',
      features: [
        'Full interpretation of one reading',
        'All five elements',
        'The pattern',
      ],
      cta: 'Unlock a reading',
      highlighted: false,
    },
    {
      name: 'Subscriber',
      price: '9€',
      subtitle: '/ month',
      features: [
        'Unlimited readings',
        'Post-reading conversation',
        'Reading history',
      ],
      cta: 'Start subscribing',
      highlighted: true,
      badge: 'Best value',
    },
  ];

  const tiers: PricingTier[] = pricingTiers.map(tier => ({
    ...tier,
    priceMonthly: tier.price,
    priceAnnual: tier.price,
    subtitleMonthly: tier.subtitle,
    subtitleAnnual: tier.subtitle,
  }));

  return (
    <section style={{ padding: SECTION_PAD }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <SectionPill label={t(language, 'pricing.label')} />
            <h2 style={{ ...H2, textAlign: 'center', margin: '0 auto 1.25rem' }}>
              {t(language, 'pricing.title')}
            </h2>
          </motion.div>

          {/* Billing toggle */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '3rem',
            }}
          >
            {(['monthly', 'annual'] as Billing[]).map((period) => (
              <button
                key={period}
                onClick={() => setBilling(period)}
                style={{
                  padding: '0.48rem 1.15rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  background: billing === period ? '#7c3aed' : 'transparent',
                  color: billing === period ? '#fff' : 'rgba(255,255,255,0.38)',
                  transition:
                    'background 0.28s cubic-bezier(0.16,1,0.3,1), color 0.28s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {period === 'monthly' ? t(language, 'pricing.billingToggle.monthly') : t(language, 'pricing.billingToggle.annual')}
              </button>
            ))}
          </motion.div>

          {/* Tier cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              textAlign: 'left',
            }}
          >
            {tiers.map((tier, i) => {
              const price =
                billing === 'annual' ? tier.priceAnnual : tier.priceMonthly;
              const subtitle =
                billing === 'annual'
                  ? tier.subtitleAnnual
                  : tier.subtitleMonthly;

              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  style={{
                    ...GLASS,
                    padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                    borderRadius: '30px',
                    background: tier.highlighted
                      ? 'rgba(124,58,237,0.25)'
                      : GLASS.background,
                    border: tier.highlighted
                      ? '1.5px solid rgba(124,58,237,0.8)'
                      : GLASS.border,
                    boxShadow: tier.highlighted
                      ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 80px rgba(124,58,237,0.35), 0 0 40px rgba(167,139,250,0.2), 0 8px 32px rgba(0,0,0,0.4)'
                      : GLASS.boxShadow,
                    position: 'relative',
                  }}
                >
                  {tier.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-0.65rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '0.3rem 0.9rem',
                        borderRadius: '9999px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 20px rgba(124,58,237,0.5), 0 0 40px rgba(167,139,250,0.3)',
                      }}
                    >
                      {tier.badge}
                    </span>
                  )}

                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.38)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}
                  >
                    {tier.name}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.3rem',
                      marginBottom: '0.3rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)',
                        fontWeight: 400,
                        color: '#fff',
                        lineHeight: 1,
                      }}
                    >
                      {price}
                    </span>
                    {subtitle && (
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                          color: 'rgba(255,255,255,0.32)',
                        }}
                      >
                        {subtitle}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      height: '1px',
                      background: 'rgba(255,255,255,0.07)',
                      margin: '1.5rem 0',
                    }}
                  />

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    {tier.features.map((feature, j) => (
                      <li
                        key={j}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.9rem',
                          color: 'rgba(240,235,255,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                        }}
                      >
                        <span
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#a78bfa',
                            flexShrink: 0,
                          }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth?mode=signup"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.9rem 2.25rem',
                      borderRadius: '9999px',
                      background: tier.highlighted ? '#7c3aed' : 'transparent',
                      border: tier.highlighted
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.2)',
                      color: tier.highlighted ? '#fff' : '#f0ebff',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      textDecoration: 'none',
                      boxShadow: tier.highlighted
                        ? '0 0 32px rgba(124,58,237,0.4)'
                        : 'none',
                    }}
                  >
                    {tier.cta}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────


function FAQ({ language }: { language: 'EN' | 'DE' }) {
  const [open, setOpen] = useState<number | null>(null);
  const faqData = t(language, 'faq');
  const faqItems = Array.isArray(faqData.items) ? faqData.items : [];

  return (
    <section
      style={{
        padding: SECTION_PAD,
        background: 'rgba(255,255,255,0.01)',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(3rem, 6vw, 6rem)',
          alignItems: 'start',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <SectionPill label={faqData.label} />
            <h2 style={H2}>
              {faqData.title}
            </h2>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {faqItems.map((item: any, i: number) => (
            <motion.div key={i} variants={fadeUp}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.2rem 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.95rem',
                    color: open === i ? '#fff' : 'rgba(240,235,255,0.65)',
                    lineHeight: 1.5,
                    transition: 'color 0.22s',
                  }}
                >
                  {item.q}
                </span>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '1.1rem',
                    lineHeight: 1,
                    transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
                    transform: open === i ? 'rotate(45deg)' : 'none',
                  }}
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p
                      style={{
                        ...BODY,
                        fontSize: '0.9rem',
                        padding: '1rem 0 1.25rem',
                      }}
                    >
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function FooterCTA({ language }: { language: 'EN' | 'DE' }) {
  return (
    <section
      style={{
        padding: SECTION_PAD,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 70% 65% at 50% 100%, rgba(124,58,237,0.2) 0%, transparent 65%)',
        }}
      />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        style={{ position: 'relative' }}
      >
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(3rem, 9vw, 6.5rem)',
            fontWeight: 400,
            fontStyle: 'normal',
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            maxWidth: '700px',
            margin: '0 auto 1.5rem',
          }}
        >
          {t(language, 'footerCta.title')}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          style={{
            ...BODY,
            maxWidth: '360px',
            margin: '0 auto 2.5rem',
          }}
        >
          {t(language, 'footerCta.subtitle')}
        </motion.p>

        <motion.div variants={fadeUp}>
          <Link
            href="/auth?mode=signup"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2.25rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: '#f0ebff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 500,
              letterSpacing: '0.01em',
              textDecoration: 'none',
            }}
          >
            {t(language, 'footerCta.cta')}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ language }: { language: 'EN' | 'DE' }) {
  return (
    <footer
      style={{
        padding: '2.5rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <CubeIcon size={17} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            The Cube
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[
            { labelKey: 'footer.privacyPolicy', href: '/privacy' },
            { labelKey: 'footer.termsOfService', href: '/terms' },
          ].map(({ labelKey, href }) => (
            <Link
              key={labelKey}
              href={href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.28)',
                textDecoration: 'none',
              }}
            >
              {t(language, labelKey)}
            </Link>
          ))}
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          {t(language, 'footer.copyright')}
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const { language } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard');
    });
  }, []);


  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-inner:hover {
              animation-play-state: paused;
            }
          `,
        }}
      />
      <main
        style={{
          background: '#000000',
          color: '#fff',
          overflowX: 'hidden',
          width: '100%',
        }}
      >
        <Nav language={language} />
        <Hero language={language} />
        <StatsBar language={language} />
        <HowItWorks language={language} />
        <TheExperience language={language} />
        <Foundation language={language} />
        <Testimonials language={language} />
        <Pricing language={language} />
        <FAQ language={language} />
        <FooterCTA language={language} />
        <Footer language={language} />
      </main>
    </>
  );
}
