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
        marginBottom: '1.5rem',
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          textDecoration: 'none',
        }}
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
        <Link
          href="/auth?mode=signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.5rem 1.1rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'border-color 0.25s',
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
        padding: '13rem 1.5rem 6rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(124,58,237,0.22) 0%, transparent 65%)',
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
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '2.25rem',
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
              padding: '0.8rem 2rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'transparent',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.88rem',
              fontWeight: 500,
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

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto 6rem',
        padding: '0 clamp(1.5rem, 5vw, 3rem)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{
          display: 'flex',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.025)',
          overflow: 'hidden',
        }}
      >
        {[
          { value: '15', label: 'Different Languages', showDivider: true },
          { value: '120+', label: 'Years of Psychology', showDivider: true },
          { value: null, label: null, showDivider: true },
          { value: '100+', label: 'Users Played', showDivider: false },
        ].map((item, i) => {
          if (item.value === null) {
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem 1.75rem',
                  borderRight: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '24px',
                    borderRadius: '12px',
                    background: '#7c3aed',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '3px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                    }}
                  />
                </div>
              </div>
            );
          }
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '1.25rem 1.75rem',
                borderRight: item.showDivider
                  ? '1px solid rgba(255,255,255,0.07)'
                  : 'none',
                flex: '1 1 auto',
              }}
            >
              <span
                style={{
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                •
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "'Gotens', sans-serif",
                    fontSize: '1.25rem',
                    color: '#fff',
                    lineHeight: 1.1,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.38)',
                    marginTop: '0.15rem',
                  }}
                >
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
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
    <section
      style={{
        padding: 'clamp(3rem, 7vw, 6rem) clamp(1.5rem, 5vw, 3rem)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                padding: '2rem 2rem 2.25rem',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '1.1rem',
                  left: '1.5rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                {step.number}
              </span>
              <div style={{ marginTop: '2.25rem' }}>
                <h3
                  style={{
                    fontFamily: "'Gotens', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: '#fff',
                    marginBottom: '0.7rem',
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.42)',
                  }}
                >
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── The Experience ───────────────────────────────────────────────────────────

function Starburst({ size = 72, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      style={{ opacity }}
    >
      <path
        d="M40 2L43.5 36.5L78 40L43.5 43.5L40 78L36.5 43.5L2 40L36.5 36.5Z"
        fill="white"
      />
      <path
        d="M40 18L42.5 37.5L62 40L42.5 42.5L40 62L37.5 42.5L18 40L37.5 37.5Z"
        fill="white"
        opacity="0.35"
      />
    </svg>
  );
}

function PillShape() {
  return (
    <div
      style={{
        width: '52px',
        height: '90px',
        borderRadius: '9999px',
        background:
          'linear-gradient(155deg, rgba(196,181,253,0.85) 0%, rgba(124,58,237,0.5) 100%)',
      }}
    />
  );
}

function TheExperience() {
  const features = [
    {
      shape: <Starburst size={72} />,
      title: 'Five objects. No right answers.',
      body: 'A simple space is described to you. Five objects appear in it. You describe what you see, and how you see it.',
    },
    {
      shape: <PillShape />,
      title: 'A reading that sees through the surface.',
      body: 'Each object maps to something real. The reading draws from depth psychology and decades of symbolic research.',
    },
    {
      shape: <Starburst size={60} opacity={0.7} />,
      title: 'It names what you already knew.',
      body: 'A precise, personal reading. Not generic. Written only for what you described in your own words.',
    },
  ];

  return (
    <section
      style={{
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
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
          <motion.div variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
            <SectionPill label="How it works" />
            <h2
              style={{
                fontFamily: "'Gotens', sans-serif",
                fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.0,
                letterSpacing: '-0.01em',
                maxWidth: '640px',
                marginBottom: '1.1rem',
              }}
            >
              The Experience
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.97rem',
                color: 'rgba(255,255,255,0.45)',
                maxWidth: '420px',
                lineHeight: 1.72,
              }}
            >
              Answer a few questions. Receive a reading that names what you
              already knew.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1rem',
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{
                  padding: '2.25rem',
                  borderRadius: '18px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem',
                  minHeight: '280px',
                }}
              >
                <div>{f.shape}</div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Gotens', sans-serif",
                      fontSize: '1.4rem',
                      fontWeight: 400,
                      color: '#fff',
                      marginBottom: '0.6rem',
                      lineHeight: 1.25,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.85rem',
                      lineHeight: 1.75,
                      color: 'rgba(255,255,255,0.42)',
                    }}
                  >
                    {f.body}
                  </p>
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
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
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
            'radial-gradient(ellipse 700px 500px at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)',
        }}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <SectionPill label="What It's Based On" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'Gotens', sans-serif",
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              fontWeight: 400,
              color: '#fff',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              marginBottom: '1.5rem',
            }}
          >
            Drawn from the work of{' '}
            <span style={{ color: 'rgba(167,139,250,0.85)' }}>
              depth psychologists
            </span>{' '}
            who believed the psyche speaks in images.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.93rem',
              lineHeight: 1.82,
              color: 'rgba(255,255,255,0.42)',
              marginBottom: '3rem',
              maxWidth: '620px',
            }}
          >
            The Cube exercise has roots in object relations theory, Jungian
            symbolism, and decades of research into how the unconscious uses
            spatial metaphor. The objects you choose, and how you describe them,
            reveal patterns you live inside but rarely see from the outside.
          </motion.p>

          <motion.div
            variants={stagger}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
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

function Testimonials() {
  const testimonials = [
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

  return (
    <section
      style={{
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        background: 'rgba(255,255,255,0.015)',
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
            <SectionPill label="Testimonial" />
            <h2
              style={{
                fontFamily: "'Gotens', sans-serif",
                fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.1,
              }}
            >
              Reasons why you'll love The Cube
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.18rem' }}>
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="#7c3aed"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.9rem',
                    lineHeight: 1.72,
                    color: 'rgba(255,255,255,0.7)',
                    fontStyle: 'italic',
                    flex: 1,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: 'auto',
                  }}
                >
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
              </motion.div>
            ))}
          </div>
        </motion.div>
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
    <section
      style={{
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <SectionPill label="Pricing" />
            <h2
              style={{
                fontFamily: "'Gotens', sans-serif",
                fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.1,
                marginBottom: '2.5rem',
              }}
            >
              Begin wherever you are.
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
                  color:
                    billing === period ? '#fff' : 'rgba(255,255,255,0.38)',
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
              gap: '1rem',
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
                    padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                    borderRadius: '18px',
                    background: tier.highlighted
                      ? 'rgba(124,58,237,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    backdropFilter: tier.highlighted ? 'blur(20px)' : 'blur(16px)',
                    WebkitBackdropFilter: tier.highlighted
                      ? 'blur(20px)'
                      : 'blur(16px)',
                    border: tier.highlighted
                      ? '1px solid rgba(124,58,237,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: tier.highlighted
                      ? '0 0 60px rgba(124,58,237,0.18)'
                      : 'none',
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
                      margin: '1.4rem 0',
                    }}
                  />

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                  >
                    {tier.features.map((feature, j) => (
                      <li
                        key={j}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.86rem',
                          color: 'rgba(255,255,255,0.55)',
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
                      padding: '0.78rem',
                      borderRadius: '10px',
                      background: tier.highlighted ? '#7c3aed' : 'transparent',
                      border: tier.highlighted
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.1)',
                      color: tier.highlighted
                        ? '#fff'
                        : 'rgba(255,255,255,0.5)',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'opacity 0.22s cubic-bezier(0.16,1,0.3,1)',
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
        padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
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
            <h2
              style={{
                fontFamily: "'Gotens', sans-serif",
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.05,
              }}
            >
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
                    fontSize: '0.9rem',
                    color: open === i ? '#fff' : 'rgba(255,255,255,0.65)',
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
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.875rem',
                        lineHeight: 1.78,
                        color: 'rgba(255,255,255,0.42)',
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
        padding: 'clamp(5rem, 10vw, 9rem) 1.5rem',
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
            color: '#fff',
            lineHeight: 1.0,
            marginBottom: '2rem',
          }}
        >
          Start your<br />Experience Today
        </motion.h2>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.38)',
            maxWidth: '360px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.68,
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
              padding: '0.85rem 2.25rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'transparent',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.88rem',
              fontWeight: 500,
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

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`,
        }}
      />
      <main
        style={{
          background: '#09090f',
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
