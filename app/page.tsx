'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { CubeIcon } from '@/components/cube-icon';
import { ThemeToggle } from '@/components/theme-provider';
import { supabase } from '@/lib/supabase';

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
  fontFamily: "'Gotens', sans-serif",
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

function Nav() {
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
          The Cube
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ThemeToggle />
        <div id="google_translate_element" style={{ display: 'flex', alignItems: 'center' }} />
        <Link
          href="/auth?mode=signup"
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
          Begin your reading
        </Link>
      </div>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        padding: '13rem 1.5rem 7rem',
        textAlign: 'center',
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
          The Cube
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
          You see a cube. How Big is it?
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
            Begin your reading
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto 6rem', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
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
            Different<br />Languages
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Stat 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>120+</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
            Years of Psychology<br />And imagery
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
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.57rem', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.02em', marginTop: '0.1rem' }}>Users Played</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
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



function TheExperience() {
  const features = [
    {
      shape: <img src="/images/icon-star.png" alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />,
      title: 'Five objects. No right answers.',
      body: 'A simple space is described to you. Five objects appear in it. You describe what you see, and how you see it.',
    },
    {
      shape: <img src="/images/icon-small-star.png" alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />,
      title: 'A reading that sees through the surface.',
      body: 'Each object maps to something real. The reading draws from depth psychology and decades of symbolic research.',
    },
    {
      shape: <img src="/images/icon-circle.png" alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />,
      title: 'It names what you already knew.',
      body: 'A precise, personal reading. Not generic. Written only for what you described in your own words.',
    },
  ];

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
            <SectionPill label="How it works" />
            <h2 style={{ ...H2 }}>The Experience</h2>
            <p style={{ ...BODY, maxWidth: '420px' }}>
              Answer a few questions. Receive a reading that names what you
              already knew.
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
                variants={fadeUp}
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

function Foundation() {
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
            <SectionPill label="What It's Based On" />
          </motion.div>

          <motion.h2 variants={fadeUp} style={{
            ...H2,
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(1.75rem, 3.5vw, 4rem)',
            fontWeight: 500,
            color: 'rgba(240,235,255,0.55)',
          }}>
            Drawn from the work of{' '}
            <span style={{ color: '#fff' }}>depth psychologists</span>{' '}
            who{' '}
            <span style={{ color: '#fff' }}>believed the psyche speaks in images.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            style={{
              ...BODY,
              maxWidth: '600px',
              margin: '0 auto 3rem',
            }}
          >
            The Cube exercise has roots in object relations theory, Jungian
            symbolism, and decades of research into how the unconscious uses
            spatial metaphor. The objects you choose, and how you describe them,
            reveal patterns you live inside but rarely see from the outside.
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

function Testimonials() {
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
          <SectionPill label="Testimonial" />
          <h2 style={{ ...H2, textAlign: 'center', margin: '0 auto 1.25rem' }}>
            <span style={{ display: 'block' }}>Reasons why you'll</span>
            <span style={{ display: 'block' }}>love The Cube</span>
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

function Pricing() {
  const [billing, setBilling] = useState<Billing>('annual');

  const tiers: PricingTier[] = [
    {
      name: 'Free',
      priceMonthly: '0€',
      priceAnnual: '0€',
      subtitleMonthly: null,
      subtitleAnnual: null,
      features: ['First reading preview', 'Five trait summaries', 'Strategic lens lines'],
      cta: 'Begin for free',
      highlighted: false,
    },
    {
      name: 'Single Reading',
      priceMonthly: '7€',
      priceAnnual: '7€',
      subtitleMonthly: 'one time',
      subtitleAnnual: 'one time',
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
      priceMonthly: '9€',
      priceAnnual: '59€',
      subtitleMonthly: '/ month',
      subtitleAnnual: '/ year',
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
            <SectionPill label="Pricing" />
            <h2 style={{ ...H2, textAlign: 'center', margin: '0 auto 1.25rem' }}>
              <span style={{ display: 'block' }}>Begin wherever</span>
              <span style={{ display: 'block' }}>you are.</span>
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
                {period === 'monthly' ? 'Monthly' : 'Annually (save up to 45%)'}
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
                      ? 'rgba(124,58,237,0.18)'
                      : GLASS.background,
                    border: tier.highlighted
                      ? '1px solid rgba(124,58,237,0.5)'
                      : GLASS.border,
                    boxShadow: tier.highlighted
                      ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 60px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.4)'
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
                        background: '#7c3aed',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.7rem',
                        borderRadius: '9999px',
                        whiteSpace: 'nowrap',
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
                        fontFamily: "'Gotens', sans-serif",
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

const FAQ_ITEMS = [
  {
    q: 'What exactly is The Cube?',
    a: 'The Cube is a symbolic psychological exercise rooted in depth psychology. You imagine a space and describe five objects in it. Each object maps to a dimension of your inner world, and we generate a personal reading based on what you described.',
  },
  {
    q: 'How long does a reading take?',
    a: 'Most people spend 5–10 minutes answering the questions. The reading itself is delivered immediately and takes another few minutes to read through.',
  },
  {
    q: 'Is the reading personalised to what I describe?',
    a: 'Yes. Every reading is generated from your specific answers. Two people can describe the same object completely differently, and their readings will reflect that difference.',
  },
  {
    q: 'What is it based on?',
    a: "The exercise draws from Jungian symbolism, object relations theory, and 50+ years of depth psychology research, including the work of Jung, Hillman, von Franz, Estés, and Winnicott.",
  },
  {
    q: 'Can I do more than one reading?',
    a: 'Yes. With a subscription you get unlimited readings, a post-reading conversation to explore the interpretation further, and a reading history to track patterns over time.',
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

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
            <SectionPill label="FAQ" />
            <h2 style={H2}>
              Questions &<br />Answers
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
          {FAQ_ITEMS.map((item, i) => (
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

function FooterCTA() {
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
            fontFamily: "'Gotens', sans-serif",
            fontSize: 'clamp(3rem, 9vw, 6.5rem)',
            fontWeight: 400,
            fontStyle: 'normal',
            color: '#fff',
            lineHeight: 1.0,
            marginBottom: '1.5rem',
          }}
        >
          Start your<br />Experience Today
        </motion.h2>

        <motion.p
          variants={fadeUp}
          style={{
            ...BODY,
            maxWidth: '360px',
            margin: '0 auto 2.5rem',
          }}
        >
          Join thousands of users discovering themselves through The Cube
          experience.
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
            Begin your reading
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
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
              fontFamily: "'Gotens', sans-serif",
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            The Cube
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.28)',
                textDecoration: 'none',
              }}
            >
              {label}
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
          &copy; 2026 The Cube. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard');
    });
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          layout: (window as any).google.translate.TranslateElement.InlineLayout
            .SIMPLE,
        },
        'google_translate_element'
      );
    };
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
        <Nav />
        <Hero />
        <StatsBar />
        <HowItWorks />
        <TheExperience />
        <Foundation />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FooterCTA />
        <Footer />
      </main>
    </>
  );
}
