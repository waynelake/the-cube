'use client';

import Link from 'next/link';

export const ELEMENT_KEYS = ['cube', 'ladder', 'flowers', 'animal', 'storm'] as const;
export type ElementKey = typeof ELEMENT_KEYS[number];

export const ELEMENT_LABELS: Record<ElementKey, string> = {
  cube: 'The Cube', ladder: 'The Ladder', flowers: 'The Flowers',
  animal: 'The Animal', storm: 'The Storm',
};

export type ReadingTraits = {
  self_image?: string; ambition?: string; relationships?: string;
  freedom?: string; challenges?: string;
};

export const TRAIT_MAP: Record<ElementKey, keyof ReadingTraits> = {
  cube: 'self_image', ladder: 'ambition', flowers: 'relationships',
  animal: 'freedom', storm: 'challenges',
};

export function stripMd(text: string): string {
  return text.replace(/\*\*([^*]*)\*\*/g, '$1').replace(/\*([^*]*)\*/g, '$1');
}

export function parseSummary(raw: string) {
  const text = stripMd(raw);
  const lines = text.split('\n');

  const isSubHeader = (l: string) =>
    /^(Observation|Interpretation)(\s*\(.*?\))?[:\s]*$/.test(l.trim());
  const isElementHeader = (l: string) =>
    /^(The )?(Cube|Ladder|Flowers|Animal|Storm)(\s*[\(\-].*?)?[:\s]*$/.test(l.trim());
  const lensMatch = (l: string) =>
    l.trim().match(/^Strategic Lens[:\s]*(.*)/i);

  const elements: { body: string; lens: string }[] = [];
  let bodyLines: string[] = [];
  let lensLines: string[] = [];
  let inLens = false;
  let done = false;
  const afterLines: string[] = [];

  for (const line of lines) {
    if (done) { afterLines.push(line); continue; }
    const m = lensMatch(line);
    if (m) {
      inLens = true;
      lensLines = m[1].trim() ? [m[1].trim()] : [];
      continue;
    }
    if (inLens) {
      const t = line.trim();
      if (t) {
        lensLines.push(t);
      } else if (lensLines.length > 0) {
        const body = bodyLines
          .filter(l => !isSubHeader(l) && !isElementHeader(l))
          .join('\n').trim().replace(/\n{3,}/g, '\n\n');
        elements.push({ body, lens: lensLines.join(' ') });
        bodyLines = []; lensLines = []; inLens = false;
        if (elements.length === 5) done = true;
      }
      continue;
    }
    bodyLines.push(line);
  }

  if (inLens && lensLines.length > 0 && elements.length < 5) {
    const body = bodyLines
      .filter(l => !isSubHeader(l) && !isElementHeader(l))
      .join('\n').trim().replace(/\n{3,}/g, '\n\n');
    elements.push({ body, lens: lensLines.join(' ') });
  }

  if (elements.length === 0) {
    return {
      elements: [] as { body: string; lens: string }[],
      patternParas: text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean),
      takeaways: [] as string[],
      summation: '',
    };
  }

  const synthBlocks = afterLines.join('\n').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  const patternParas: string[] = [];
  const takeaways: string[] = [];
  let summation = '';

  for (const block of synthBlocks) {
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (blockLines.length === 1 && /^Final Synthesis[:\s]*$/i.test(blockLines[0])) continue;
    if (blockLines.every(l => /^\d+[.)]\s/.test(l))) {
      takeaways.push(...blockLines.map(l => l.replace(/^\d+[.)]\s*/, '')));
    } else if (/five distilled takeaways/i.test(block)) {
      const stripped = block.replace(/.*?five distilled takeaways[:\s]*/i, '');
      const items = stripped.split(/\d+[.)]\s+/).map(s => s.trim()).filter(Boolean);
      takeaways.push(...items);
    } else if (takeaways.length > 0 && blockLines.length === 1) {
      summation = blockLines[0];
    } else {
      patternParas.push(blockLines.join(' '));
    }
  }

  return { elements, patternParas, takeaways, summation };
}

export function PaidContent({ summary }: { summary: string }) {
  const { elements, patternParas, takeaways, summation } = parseSummary(summary);
  const CARD_LABELS = ['The Cube', 'The Ladder', 'The Flowers', 'The Animal', 'The Storm'];

  return (
    <div style={{ marginBottom: '3.5rem' }}>
      <style>{`
        .reading-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .reading-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="reading-grid">
        {elements.map((el, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '2.5rem',
            ...(i === 4 ? { gridColumn: '1 / -1' } : {}),
          }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>
              {CARD_LABELS[i]}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
              {el.body}
            </p>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1rem', color: 'var(--accent-text)', lineHeight: '1.6', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(124,58,237,0.15)' }}>
              {el.lens}
            </p>
          </div>
        ))}
      </div>

      {patternParas.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2rem' }}>
            The Pattern
          </h2>
          {patternParas.map((para, i) => (
            <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.9', marginBottom: '1.5rem' }}>
              {para}
            </p>
          ))}
        </div>
      )}

      {takeaways.length > 0 && (
        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          {takeaways.map((t, i) => (
            <p key={i} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: '1.6', paddingLeft: '1rem', marginBottom: '0.75rem' }}>
              {i + 1}. {t}
            </p>
          ))}
        </div>
      )}

      {summation && (
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--text-primary)', textAlign: 'center', lineHeight: '1.6', marginTop: '3rem', marginBottom: '3rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>
          {summation}
        </p>
      )}
    </div>
  );
}

export function PaywallSection({ sessionId, summary }: { sessionId: string; summary: string }) {
  const preview = summary.split(/\n{2,}/)[0] || '';
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', overflow: 'hidden', maxHeight: '160px', borderRadius: '12px' }}>
        <div style={{ filter: 'blur(6px)', opacity: 0.45, pointerEvents: 'none', userSelect: 'none', padding: '1.5rem', background: 'var(--surface)' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '0.95rem' }}>
            {preview}
          </p>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 85%)' }} />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', marginTop: '1.5rem', boxShadow: '0 0 60px rgba(124,58,237,0.08)' }}>
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '1rem' }}>
          Your reading continues.
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7', maxWidth: '420px', margin: '0 auto 2rem' }}>
          You&apos;ve seen enough to know this isn&apos;t generic. The full interpretation — all five elements, the pattern, and what it means — is waiting.
        </p>
        <Link href={`/unlock?session=${sessionId}`} style={{ display: 'inline-block', padding: '0.9rem 2.5rem', borderRadius: '8px', background: 'var(--accent)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', boxShadow: '0 0 32px rgba(124,58,237,0.35)' }}>
          Unlock full reading — 7 EUR
        </Link>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          One-time payment. Instant access.
        </p>
      </div>
    </div>
  );
}
