'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';
import { ThemeToggle } from '@/components/theme-provider';
import {
  PaidContent, PaywallSection, parseSummary, ReadingTraits,
  ELEMENT_KEYS, ELEMENT_LABELS, TRAIT_MAP,
} from '@/components/reading-display';
import { Menu, X, LogOut, Plus } from 'lucide-react';

type SessionItem = {
  id: string;
  session_number: number;
  started_at: string;
  insight: { traits: ReadingTraits; summary: string } | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatName(email: string): string {
  return email.split('@')[0].split(/[._\-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const MIN_W = 200, MAX_W = 400, DEFAULT_W = 280;

function Sidebar({
  sessions, selectedId, loading, email, userName, isPaid,
  onSelect, onClose, onSignOut,
}: {
  sessions: SessionItem[]; selectedId: string | null; loading: boolean;
  email: string; userName: string; isPaid: boolean;
  onSelect: (id: string) => void; onClose?: () => void; onSignOut: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid rgba(124,58,237,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <CubeIcon size={20} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              The Cube
            </span>
          </Link>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>
        <Link
          href="/experience"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.55rem 1rem', borderRadius: '8px', background: 'var(--accent)',
            color: '#ffffff', fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none',
          }}
        >
          <Plus size={14} />
          New reading
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {loading ? (
          <p style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading...</p>
        ) : sessions.length === 0 ? (
          <p style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>No readings yet.</p>
        ) : sessions.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem',
              background: selectedId === s.id ? 'rgba(124,58,237,0.1)' : 'transparent',
              border: 'none', borderLeft: selectedId === s.id ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              {formatDate(s.started_at)}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {s.insight ? (parseSummary(s.insight.summary).summation || 'Reading ' + s.session_number) : 'Reading ' + s.session_number}
            </p>
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(124,58,237,0.08)', padding: '1rem 1.5rem', flexShrink: 0 }}>
        {!isPaid && sessions.length > 0 && selectedId && (
          <div style={{ marginBottom: '1rem', padding: '0.875rem 0.875rem 0.875rem 1rem', background: 'rgba(124,58,237,0.06)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.12)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', lineHeight: '1.5' }}>
              Unlock the full reading — all five elements and the pattern.
            </p>
            <Link href={`/unlock?session=${selectedId}`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.74rem', color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
              Unlock for 7 EUR →
            </Link>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </p>
          </div>
          <button onClick={onSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', flexShrink: 0, display: 'flex', alignItems: 'center' }} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_W);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const widthAtDrag = useRef(DEFAULT_W);
  const currentWidthRef = useRef(DEFAULT_W);

  useEffect(() => { currentWidthRef.current = sidebarWidth; }, [sidebarWidth]);

  const loadDashboard = useCallback(async (urlSession: string | null = null, forceIsPaid = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth?mode=signin'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, subscription_plan, email')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!profile) { setLoading(false); return; }

    setEmail(profile.email || user.email || '');
    setIsPaid(profile.subscription_plan === 'one_time' || forceIsPaid);

    const { data: rawSessions } = await supabase
      .from('sessions')
      .select('id, session_number, started_at')
      .eq('profile_id', profile.id)
      .eq('synthesis_status', 'complete')
      .order('started_at', { ascending: false });

    if (!rawSessions?.length) { setLoading(false); return; }

    const { data: insights } = await supabase
      .from('derived_insights')
      .select('session_id, traits, summary')
      .in('session_id', rawSessions.map(s => s.id));

    const insightMap = Object.fromEntries((insights || []).map(i => [i.session_id, i]));

    const items: SessionItem[] = rawSessions.map(s => ({
      id: s.id,
      session_number: s.session_number,
      started_at: s.started_at,
      insight: insightMap[s.id]
        ? { traits: insightMap[s.id].traits as ReadingTraits, summary: insightMap[s.id].summary }
        : null,
    }));

    setSessions(items);
    const preselect = urlSession && items.find(s => s.id === urlSession) ? urlSession : (items[0]?.id ?? null);
    setSelectedId(preselect);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarWidth');
    if (saved) {
      const w = Math.min(MAX_W, Math.max(MIN_W, Number(saved)));
      setSidebarWidth(w);
      currentWidthRef.current = w;
    }
    const params = new URLSearchParams(window.location.search);
    const urlSession = params.get('session');
    const forceIsPaid = params.get('payment') === 'success';
    loadDashboard(urlSession, forceIsPaid);
  }, [loadDashboard]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const next = Math.min(MAX_W, Math.max(MIN_W, widthAtDrag.current + (e.clientX - dragStartX.current)));
      setSidebarWidth(next);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      localStorage.setItem('sidebarWidth', String(currentWidthRef.current));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const onDragStart = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    widthAtDrag.current = sidebarWidth;
    e.preventDefault();
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };
  const handleSelect = (id: string) => { setSelectedId(id); setDrawerOpen(false); };

  const selected = sessions.find(s => s.id === selectedId) ?? null;
  const userName = email ? formatName(email) : '';

  const sidebarProps = { sessions, selectedId, loading, email, userName, isPaid, onSelect: handleSelect, onSignOut: handleSignOut };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg)', overflow: 'hidden' }}>
      <aside className="dash-sidebar" style={{ width: sidebarWidth, minWidth: sidebarWidth, height: '100vh', background: 'var(--surface)', borderRight: '1px solid rgba(124,58,237,0.08)', flexShrink: 0, overflow: 'hidden' }}>
        <Sidebar {...sidebarProps} />
      </aside>

      <div
        className="dash-resize"
        onMouseDown={onDragStart}
        style={{ width: 4, cursor: 'col-resize', flexShrink: 0, background: 'transparent', transition: 'background 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,0.35)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      />

      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid rgba(124,58,237,0.08)', background: 'var(--bg)', flexShrink: 0 }}>
          <button className="dash-menu-btn" onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'none', alignItems: 'center' }}>
            <Menu size={20} />
          </button>
          <div>
            {selected && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {formatDate(selected.started_at)}
              </p>
            )}
          </div>
          <ThemeToggle />
        </nav>

        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading your readings...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', padding: '2rem' }}>
              <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 500 }}>No readings yet.</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
                  Start a reading to get your first symbolic interpretation.
                </p>
                <Link href="/experience" style={{ display: 'inline-block', padding: '0.9rem 2.5rem', borderRadius: '8px', background: 'var(--accent)', color: '#ffffff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', boxShadow: '0 0 32px rgba(124,58,237,0.3)' }}>
                  Start your reading
                </Link>
              </div>
            </div>
          ) : !selected?.insight ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                {selected ? 'This reading is still being prepared.' : 'Select a reading.'}
              </p>
            </div>
          ) : (
            <div className="reading-container">
              <div style={{ marginBottom: '3.5rem' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>
                  Reading {selected.session_number}
                </p>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.2', marginBottom: '0.6rem' }}>
                  The Space of {userName || 'You'}
                </h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDate(selected.started_at)}
                </p>
              </div>

              {!isPaid && (
                <div style={{ marginBottom: '3rem' }}>
                  {ELEMENT_KEYS.map((key, i) => (
                    <div key={key}>
                      <div style={{ padding: '1.5rem 0' }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.6rem' }}>
                          {ELEMENT_LABELS[key]}
                        </p>
                        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)', color: 'var(--text-primary)', lineHeight: '1.5', fontWeight: 400 }}>
                          {selected.insight.traits[TRAIT_MAP[key]]}
                        </p>
                      </div>
                      {i < ELEMENT_KEYS.length - 1 && (
                        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isPaid
                ? <PaidContent summary={selected.insight.summary} />
                : <PaywallSection sessionId={selected.id} summary={selected.insight.summary} />
              }
            </div>
          )}
        </div>
      </main>

      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,10,15,0.75)' }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, background: 'var(--surface)', borderRight: '1px solid rgba(124,58,237,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <Sidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar { display: none !important; }
          .dash-resize { display: none !important; }
          .dash-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
