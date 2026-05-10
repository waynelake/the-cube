'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CubeIcon } from '@/components/cube-icon';
import { ThemeToggle } from '@/components/theme-provider';
import {
  PaidContent, parseSummary, ReadingTraits,
  ELEMENT_KEYS, ELEMENT_LABELS, TRAIT_MAP,
} from '@/components/reading-display';
import { Menu, X, LogOut, Plus, MoreHorizontal, Pencil, Pin } from 'lucide-react';

type SessionItem = {
  id: string;
  session_number: number;
  started_at: string;
  insight: { traits: ReadingTraits; summary: string; custom_title?: string | null } | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatName(email: string): string {
  return email.split('@')[0].split(/[._\-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const MIN_W = 200, MAX_W = 400, DEFAULT_W = 280;

function Sidebar({
  sessions, selectedId, loading, email, displayName,
  pinnedIds, onSelect, onClose, onSignOut, onSaveName, onPin, onHide, onRename,
}: {
  sessions: SessionItem[]; selectedId: string | null; loading: boolean;
  email: string; displayName: string; pinnedIds: Set<string>;
  onSelect: (id: string) => void; onClose?: () => void; onSignOut: () => void;
  onSaveName: (name: string) => Promise<void>;
  onPin: (id: string) => void;
  onHide: (id: string) => void;
  onRename: (id: string, title: string) => Promise<void>;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid rgba(124,58,237,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <CubeIcon size={20} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
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
            color: '#ffffff', fontFamily: "'Inter', sans-serif",
            fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none',
          }}
        >
          <Plus size={14} />
          New reading
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {loading ? (
          <p style={{ padding: '1rem 1.5rem', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading...</p>
        ) : sessions.length === 0 ? (
          <p style={{ padding: '1rem 1.5rem', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>No readings yet.</p>
        ) : sessions.map(s => {
          const title = s.insight?.custom_title
            || parseSummary(s.insight?.summary || '').summation
            || `Reading ${s.session_number}`;
          return (
            <div
              key={s.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => { setHoveredId(null); setMenuOpenId(null); }}
            >
              {editingTitleId === s.id ? (
                <div style={{ padding: '0.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    autoFocus
                    value={titleInput}
                    onChange={e => setTitleInput(e.target.value)}
                    style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(124,58,237,0.3)', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { onRename(s.id, titleInput); setEditingTitleId(null); }
                      if (e.key === 'Escape') setEditingTitleId(null);
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => { onRename(s.id, titleInput); setEditingTitleId(null); }} style={{ flex: 1, padding: '0.25rem', borderRadius: '4px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Save</button>
                    <button onClick={() => setEditingTitleId(null)} style={{ flex: 1, padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelect(s.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: hoveredId === s.id ? '0.75rem 2rem 0.75rem 1.5rem' : '0.75rem 1.5rem',
                    background: selectedId === s.id ? 'rgba(124,58,237,0.1)' : 'transparent',
                    border: 'none', borderLeft: selectedId === s.id ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                    {pinnedIds.has(s.id) && <Pin size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatDate(s.started_at)}
                    </p>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {title}
                  </p>
                </button>
              )}

              {hoveredId === s.id && editingTitleId !== s.id && (
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === s.id ? null : s.id); }}
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}
                >
                  <MoreHorizontal size={14} />
                </button>
              )}

              {menuOpenId === s.id && (
                <div style={{ position: 'absolute', right: '0.5rem', top: 'calc(100% - 0.5rem)', zIndex: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', overflow: 'hidden', minWidth: '120px' }}>
                  {[
                    {
                      label: 'Rename',
                      action: () => {
                        setEditingTitleId(s.id);
                        setTitleInput(title);
                        setMenuOpenId(null);
                      },
                    },
                    {
                      label: pinnedIds.has(s.id) ? 'Unpin' : 'Pin',
                      action: () => { onPin(s.id); setMenuOpenId(null); },
                    },
                    {
                      label: 'Hide',
                      action: () => { onHide(s.id); setMenuOpenId(null); },
                    },
                  ].map(({ label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.875rem', background: 'none', border: 'none', color: label === 'Hide' ? '#e05a5a' : 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid rgba(124,58,237,0.08)', padding: '1rem 1.5rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            {editingName ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(124,58,237,0.3)', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { onSaveName(nameInput); setEditingName(false); }
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => { onSaveName(nameInput); setEditingName(false); }} style={{ flex: 1, padding: '0.25rem', borderRadius: '4px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Save</button>
                  <button onClick={() => setEditingName(false)} style={{ flex: 1, padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.15rem' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {displayName}
                </p>
                <button
                  onClick={() => { setNameInput(displayName); setEditingName(true); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex', flexShrink: 0 }}
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
            {!editingName && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email}
              </p>
            )}
          </div>
          {!editingName && (
            <button onClick={onSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', flexShrink: 0, display: 'flex', alignItems: 'center' }} title="Sign out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_W);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const widthAtDrag = useRef(DEFAULT_W);
  const currentWidthRef = useRef(DEFAULT_W);

  useEffect(() => { currentWidthRef.current = sidebarWidth; }, [sidebarWidth]);

  const loadDashboard = useCallback(async (urlSession: string | null = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth?mode=signin'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, subscription_plan, email, display_name')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!profile) { setLoading(false); return; }

    setEmail(profile.email || user.email || '');
    setDisplayName(profile.display_name || formatName(profile.email || user.email || ''));

    const { data: rawSessions } = await supabase
      .from('sessions')
      .select('id, session_number, started_at')
      .eq('profile_id', profile.id)
      .eq('synthesis_status', 'complete')
      .order('started_at', { ascending: false });

    if (!rawSessions?.length) { setLoading(false); return; }

    const { data: insights } = await supabase
      .from('derived_insights')
      .select('session_id, traits, summary, custom_title, hidden')
      .in('session_id', rawSessions.map(s => s.id))
      .not('hidden', 'eq', true);

    const insightMap = Object.fromEntries((insights || []).map(i => [i.session_id, i]));

    const items: SessionItem[] = rawSessions
      .filter(s => insightMap[s.id])
      .map(s => ({
        id: s.id,
        session_number: s.session_number,
        started_at: s.started_at,
        insight: {
          traits: insightMap[s.id].traits as ReadingTraits,
          summary: insightMap[s.id].summary,
          custom_title: insightMap[s.id].custom_title,
        },
      }));

    setSessions(items);
    const preselect = urlSession && items.find(s => s.id === urlSession) ? urlSession : (items[0]?.id ?? null);
    setSelectedId(preselect);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      const w = Math.min(MAX_W, Math.max(MIN_W, Number(savedWidth)));
      setSidebarWidth(w);
      currentWidthRef.current = w;
    }
    const savedPins = localStorage.getItem('pinned-readings');
    if (savedPins) setPinnedIds(new Set(JSON.parse(savedPins)));

    const params = new URLSearchParams(window.location.search);
    const urlSession = params.get('session');
    loadDashboard(urlSession);
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

  const handlePin = (id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('pinned-readings', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleHide = async (id: string) => {
    await supabase.from('derived_insights').update({ hidden: true }).eq('session_id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) {
      setSelectedId(sessions.find(s => s.id !== id)?.id ?? null);
    }
  };

  const handleRename = async (id: string, title: string) => {
    await supabase.from('derived_insights').update({ custom_title: title }).eq('session_id', id);
    setSessions(prev => prev.map(s =>
      s.id === id && s.insight ? { ...s, insight: { ...s.insight, custom_title: title } } : s
    ));
  };

  const handleSaveName = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ display_name: name }).eq('auth_user_id', user.id);
    setDisplayName(name);
  };

  const selected = sessions.find(s => s.id === selectedId) ?? null;

  const sortedSessions = [...sessions].sort((a, b) =>
    (pinnedIds.has(b.id) ? 1 : 0) - (pinnedIds.has(a.id) ? 1 : 0)
  );

  const sidebarProps = {
    sessions: sortedSessions, selectedId, loading, email, displayName,
    pinnedIds,
    onSelect: handleSelect, onSignOut: handleSignOut,
    onSaveName: handleSaveName, onPin: handlePin, onHide: handleHide, onRename: handleRename,
  };

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
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {formatDate(selected.started_at)}
              </p>
            )}
          </div>
          <ThemeToggle />
        </nav>

        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading your readings...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', padding: '2rem' }}>
              <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 500 }}>No readings yet.</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
                  Start a reading to get your first symbolic interpretation.
                </p>
                <Link href="/experience" style={{ display: 'inline-block', padding: '0.9rem 2.5rem', borderRadius: '8px', background: 'var(--accent)', color: '#ffffff', fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', boxShadow: '0 0 32px rgba(124,58,237,0.3)' }}>
                  Start your reading
                </Link>
              </div>
            </div>
          ) : !selected || !selected.insight ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                {selected ? 'This reading is still being prepared.' : 'Select a reading.'}
              </p>
            </div>
          ) : (
            <div className="reading-container">
              <div style={{ marginBottom: '3.5rem' }}>
                <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.2', marginBottom: '0.6rem' }}>
                  What Your Space Reveals
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDate(selected.started_at)}
                </p>
              </div>

              <PaidContent summary={selected.insight?.summary ?? ''} />
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
