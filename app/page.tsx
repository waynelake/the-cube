'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, type Variants } from 'framer-motion';
import { CubeIcon } from '@/components/cube-icon';
import { ThemeToggle } from '@/components/theme-provider';
import { supabase } from '@/lib/supabase';

const HeroCube = dynamic(() => import('@/components/hero-cube'), {
  ssr: false,
  loading: () => (
    <div style={{ width: 'min(560px, 90vw)', height: 'min(560px, 90vw)' }} />
  ),
});

// ─── Shared animation variants ────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.75, ease: EASE },
  },
};

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
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.1rem 2rem',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        background: scrolled ? 'rgba(10, 10, 15, 0.82)' : 'transparent',
        borderBottom: scrolled
          ? '1px solid rgba(124, 58, 237, 0.2)'
          : '1px solid transparent',
        transition:
          'background 0.45s cubic-bezier(0.16,1,0.3,1), border-color 0.45s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          textDecoration: 'none',
        }}
      >
        <CubeIcon size={22} />
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.66rem',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          The Cube
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <ThemeToggle />
        <Link
          href="/auth?mode=signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.52rem 1.15rem',
            borderRadius: '9999px',
            background: 'var(--accent)',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.78rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
            textDecoration: 'none',
            boxShadow: '0 0 18px rgba(124,58,237,0.35)',
            transition:
              'opacity 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1)',
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
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        padding: '0 1.5rem',
      }}
    >
      {/* Pulse-glow keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }
      `}} />

      {/* Atmospheric radial background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 900px 700px at 50% 38%, rgba(124,58,237,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Cube + pulsing glow wrapper */}
      <div style={{ position: 'relative', marginBottom: '-3rem', zIndex: 1 }}>
        {/* Pulsing radial glow behind cube */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '140%',
            height: '140%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)',
            animation: 'pulse-glow 4s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Three.js rotating cube */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
          style={{
            filter:
              'drop-shadow(0 0 80px rgba(124,58,237,0.7)) drop-shadow(0 0 160px rgba(124,58,237,0.3))',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <HeroCube />
        </motion.div>
      </div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, ease: EASE, delay: 0.55 }}
        style={{
          fontFamily: "'Cormorant Garant', 'Georgia', serif",
          fontSize: 'clamp(3.5rem, 8vw, 7rem)',
          lineHeight: 1.05,
          fontWeight: 300,
          color: 'var(--text-primary)',
          margin: '0 0 0.8rem',
          letterSpacing: '-0.02em',
          position: 'relative',
          zIndex: 1,
        }}
      >
        You&rsquo;re in a space of your own design.
      </motion.h1>

      {/* Subline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '1.08rem',
          lineHeight: 1.72,
          color: 'var(--text-secondary)',
          maxWidth: '520px',
          margin: '0 auto 1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Answer a few questions. Receive a reading that names what you already
        knew.
      </motion.p>

      {/* CTA button */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: EASE, delay: 0.95 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Link
          href="/auth?mode=signup"
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            borderRadius: '9999px',
            background: 'var(--accent)',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(124,58,237,0.4)',
            transition: 'opacity 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          Begin your reading
        </Link>
      </motion.div>

      {/* Animated scroll chevron */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1.1 }}
        style={{ marginTop: '2.5rem', position: 'relative', zIndex: 1 }}
      >
        <motion.svg
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          width="16"
          height="10"
          viewBox="0 0 16 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1.5L8 8.5L15 1.5"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </section>
  );
}

// ─── What It Is ───────────────────────────────────────────────────────────────

function WhatItIs() {
  const statements = [
    { text: 'Five objects. No right answers.', weight: 400 },
    { text: 'A reading that sees through the surface.', weight: 500 },
    { text: 'It names what you already knew.', weight: 400 },
  ];

  return (
    <section
      style={{
        padding: 'clamp(5rem, 13vw, 11rem) 1.5rem',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.66rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--accent-text)',
            marginBottom: '4.5rem',
          }}
        >
          The Experience
        </motion.p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(2rem, 4vw, 3.25rem)',
          }}
        >
          {statements.map((s, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              style={{
                fontFamily: "'Cormorant Garant', 'Georgia', serif",
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                lineHeight: 1.22,
                fontWeight: s.weight,
                color:
                  i === 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                letterSpacing: '-0.008em',
              }}
            >
              {s.text}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </section>
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
      title: 'Receive your interpretation',
      body: 'A precise, personal reading. Not generic. Written only for what you described.',
    },
  ];

  return (
    <section
      style={{
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 3rem)',
        background: 'var(--surface)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(2.5rem, 5vw, 4rem)',
          }}
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeUp}>
              <p
                style={{
                  fontFamily: "'Cormorant Garant', 'Georgia', serif",
                  fontSize: 'clamp(4rem, 8vw, 7rem)',
                  lineHeight: 1,
                  fontWeight: 300,
                  color: 'var(--accent-text)',
                  opacity: 0.45,
                  marginBottom: '1.6rem',
                }}
              >
                {step.number}
              </p>
              <h3
                style={{
                  fontFamily: "'Cormorant Garant', 'Georgia', serif",
                  fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '0.8rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.94rem',
                  lineHeight: 1.78,
                  color: 'var(--text-secondary)',
                }}
              >
                {step.body}
              </p>
            </motion.div>
          ))}
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
        padding: 'clamp(5rem, 13vw, 11rem) 1.5rem',
        background: 'var(--bg)',
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
            'radial-gradient(ellipse 600px 380px at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)',
        }}
      />

      <div
        style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}
      >
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.66rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--accent-text)',
            marginBottom: '2.5rem',
          }}
        >
          What It&rsquo;s Based On
        </motion.p>

        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          style={{
            fontFamily: "'Cormorant Garant', 'Georgia', serif",
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
            lineHeight: 1.25,
            fontWeight: 400,
            color: 'var(--text-primary)',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}
        >
          Drawn from the work of depth psychologists who believed the psyche
          speaks in images.
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.97rem',
            lineHeight: 1.82,
            color: 'var(--text-secondary)',
            marginBottom: '3.25rem',
          }}
        >
          The Cube exercise has roots in object relations theory, Jungian
          symbolism, and decades of research into how the unconscious uses
          spatial metaphor. The objects you choose, and how you describe them,
          reveal patterns you live inside but rarely see from the outside.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {authors.map((author, i) => (
            <motion.span
              key={i}
              variants={fadeIn}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                padding: '0.28rem 0.88rem',
                borderRadius: '9999px',
                border: '1px solid var(--border)',
                letterSpacing: '0.03em',
              }}
            >
              {author}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const quotes = [
    "It bypasses the way I think. If you'd asked me directly, I don't know if I'd have answered as honestly, or even known how to answer.",
    "Scary how accurate it is. I really didn't expect that.",
    "It named something I knew was there but didn't know how to put into words.",
    "It's like you know everything about me without asking me any real questions.",
  ];

  return (
    <section
      style={{
        padding: 'clamp(5rem, 13vw, 11rem) clamp(1.5rem, 5vw, 3rem)',
        background: 'var(--surface)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          {/* Section header */}
          <motion.div variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.66rem',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--accent-text)',
                marginBottom: '1rem',
              }}
            >
              What People Say
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garant', 'Georgia', serif",
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 400,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              The people who&rsquo;ve been read.
            </h2>
          </motion.div>

          {/* Featured first quote — full width */}
          <motion.div
            variants={fadeUp}
            style={{
              padding: 'clamp(2rem, 4vw, 3.5rem)',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              marginBottom: '1.25rem',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garant', 'Georgia', serif",
                fontSize: 'clamp(1.45rem, 3.2vw, 2.15rem)',
                lineHeight: 1.45,
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--text-primary)',
              }}
            >
              &ldquo;{quotes[0]}&rdquo;
            </p>
          </motion.div>

          {/* Remaining three quotes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(255px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {quotes.slice(1).map((quote, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{
                  padding: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garant', 'Georgia', serif",
                    fontSize: 'clamp(1.05rem, 1.9vw, 1.32rem)',
                    lineHeight: 1.58,
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                  }}
                >
                  &ldquo;{quote}&rdquo;
                </p>
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
      features: [
        'First reading preview',
        'Five trait summaries',
        'Strategic lens lines',
      ],
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
        padding: 'clamp(5rem, 13vw, 11rem) clamp(1.5rem, 5vw, 3rem)',
        background: 'var(--bg)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.66rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--accent-text)',
              marginBottom: '1rem',
            }}
          >
            Pricing
          </motion.p>

          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: "'Cormorant Garant', 'Georgia', serif",
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: '2.75rem',
              letterSpacing: '-0.01em',
            }}
          >
            Begin wherever you are.
          </motion.h2>

          {/* Billing toggle */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.22rem',
              borderRadius: '9999px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              marginBottom: '3.5rem',
            }}
          >
            {(['monthly', 'annual'] as Billing[]).map((period) => (
              <button
                key={period}
                onClick={() => setBilling(period)}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  background:
                    billing === period ? 'var(--accent)' : 'transparent',
                  color: billing === period ? '#fff' : 'var(--text-muted)',
                  transition:
                    'background 0.3s cubic-bezier(0.16,1,0.3,1), color 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {period === 'monthly' ? 'Monthly' : 'Annual — save 45%'}
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
                  whileHover={{ scale: 1.025, y: -5 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    padding: 'clamp(2rem, 3.5vw, 3rem)',
                    borderRadius: '20px',
                    background: 'var(--surface)',
                    border: tier.highlighted
                      ? '1px solid var(--accent)'
                      : '1px solid var(--border)',
                    boxShadow: tier.highlighted
                      ? '0 0 60px rgba(124,58,237,0.2), 0 0 0 1px var(--accent)'
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
                        background: 'var(--accent)',
                        color: '#fff',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '0.22rem 0.72rem',
                        borderRadius: '9999px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tier.badge}
                    </span>
                  )}

                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
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
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garant', 'Georgia', serif",
                        fontSize: 'clamp(2.8rem, 5vw, 4rem)',
                        fontWeight: 300,
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                      }}
                    >
                      {price}
                    </span>
                    {subtitle && (
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {subtitle}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      height: '1px',
                      background: 'var(--border)',
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
                      gap: '0.7rem',
                    }}
                  >
                    {tier.features.map((feature, j) => (
                      <li
                        key={j}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.88rem',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                        }}
                      >
                        <span
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'var(--accent-text)',
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
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: tier.highlighted
                        ? 'var(--accent)'
                        : 'transparent',
                      border: tier.highlighted
                        ? 'none'
                        : '1px solid var(--border)',
                      color: tier.highlighted ? '#fff' : 'var(--text-secondary)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'opacity 0.25s cubic-bezier(0.16,1,0.3,1)',
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

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const links = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer
      style={{
        padding: '3.25rem 1.5rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CubeIcon size={18} />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.62rem',
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            The Cube
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {links.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.73rem',
            color: 'var(--text-muted)',
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
      {/* Google Fonts: Cormorant Garant + DM Sans */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');`,
        }}
      />

      <main
        style={{
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          overflowX: 'hidden',
          width: '100%',
        }}
      >
        <Nav />
        <Hero />
        <WhatItIs />
        <HowItWorks />
        <Foundation />
        <Testimonials />
        <Pricing />
        <Footer />
      </main>
    </>
  );
}
