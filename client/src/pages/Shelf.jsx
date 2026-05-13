import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useMood } from '../context/MoodContext'
import { THEMES, MOOD_ORDER } from '../styles/themes'
import CoffeeButton from '../components/CoffeeButton'
import SpotifyPlayer from '../components/SpotifyPlayer'

/* ── Progress Ring SVG ────────────────────────────────────────── */
const ProgressRing = ({ progress, color, size = 36 }) => {
  const r = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
    </svg>
  )
}

/* ── Shelf Book Card ──────────────────────────────────────────── */
const ShelfCard = ({ book, theme, onProgressUpdate, onRemove }) => {
  const [progress, setProgress] = useState(book.progress || 0)
  const [updating, setUpdating] = useState(false)
  const [hovered, setHovered]   = useState(false)

  const handleProgress = async (val) => {
    setProgress(val)
    setUpdating(true)
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `https://brewreads-api.onrender.com/api/books/progress/${book._id}`,
        { progress: val },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onProgressUpdate(book._id, val)
    } catch (err) {
      console.error('Progress update failed', err)
    } finally { setUpdating(false) }
  }

  const handleRemove = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `https://brewreads-api.onrender.com/api/books/shelf/${book._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onRemove(book._id)
    } catch (err) {
      console.error('Remove failed', err)
    }
  }

  return (
    <div
      className="shelf-card"
      style={{
        ...sCardWrap,
        background: hovered ? theme.card.replace('0.07','0.11') : theme.card,
        border: `1px solid ${hovered ? theme.primary + '44' : theme.cardBorder}`,
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${theme.glow}` : '0 4px 20px rgba(0,0,0,0.25)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={sCardInner}>
        {/* Cover + progress ring */}
        <div style={sCoverWrap}>
          {book.thumbnail ? (
            <img src={book.thumbnail} alt={book.title} style={sCoverImg}/>
          ) : (
            <div style={{ ...sCoverPlaceholder, background: theme.btnBg }}>
              <span style={{ fontSize: 24 }}>📖</span>
            </div>
          )}
          {/* Progress ring overlay */}
          <div style={sProgressRing}>
            <ProgressRing progress={progress} color={theme.primary} size={38}/>
            <span style={{ ...sProgressNum, color: theme.primary }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Book info */}
        <div style={sBookInfo}>
          <h3 style={{ ...sTitle, color: theme.text }}>{book.title}</h3>
          {book.authors?.length > 0 && (
            <p style={{ ...sAuthor, color: theme.primary }}>
              {book.authors.join(', ')}
            </p>
          )}

          {/* Mood reason */}
          {book.moodReason && (
            <p style={{ ...sMoodReason, color: theme.subtext }}>
              ✦ {book.moodReason}
            </p>
          )}

          {/* Type badge */}
          <span style={{ ...sTypeBadge, background: theme.btnBg, color: theme.btnText }}>
            {book.type || 'book'}
          </span>

          {/* Progress slider */}
          <div style={sProgressWrap}>
            <span style={{ color: theme.subtext, fontSize: 10, letterSpacing: '1px' }}>
              progress
            </span>
            <input
              type="range" min={0} max={100} value={progress}
              onChange={e => handleProgress(Number(e.target.value))}
              style={{ ...sSlider, accentColor: theme.primary }}
            />
            <span style={{ color: theme.primary, fontSize: 11, fontWeight: 700 }}>
              {progress}%
            </span>
          </div>

          {/* Action buttons */}
          <div style={sActions}>
            {book.previewLink && (
              <a href={book.previewLink} target="_blank" rel="noreferrer"
                style={{ ...sReadBtn, background: theme.btnBg, color: theme.btnText }}
                className="s-read-btn">
                continue reading →
              </a>
            )}
            <button onClick={handleRemove}
              style={{ ...sRemoveBtn, color: theme.subtext, borderColor: theme.cardBorder }}
              className="s-remove-btn">
              remove
            </button>
          </div>
        </div>
      </div>

      {/* Completed banner */}
      {progress === 100 && (
        <div style={{ ...completedBanner, background: theme.btnBg }}>
          <span style={{ color: theme.btnText, fontSize: 11, letterSpacing: '1px' }}>
            ✓ finished · {theme.emoji} {theme.name.toLowerCase()} read
          </span>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function Shelf() {
  const navigate = useNavigate()
  const { mood } = useMood()
  const theme = THEMES[mood] || THEMES.cozy

  const [readings, setReadings]   = useState([])
  const [grouped, setGrouped]     = useState({})
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all' | mood key
  const [visible, setVisible]     = useState(false)

  useEffect(() => {
    fetchShelf()
    setTimeout(() => setVisible(true), 80)
  }, [])

  const fetchShelf = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('https://brewreads-api.onrender.com/api/books/shelf', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setReadings(res.data.readings || [])
      setGrouped(res.data.grouped || {})
    } catch (err) {
      console.error('Shelf fetch error:', err)
    } finally { setLoading(false) }
  }

  const handleProgressUpdate = (id, progress) => {
    setReadings(prev => prev.map(r => r._id === id ? { ...r, progress } : r))
    setGrouped(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(m => {
        updated[m] = updated[m].map(r => r._id === id ? { ...r, progress } : r)
      })
      return updated
    })
  }

  const handleRemove = (id) => {
    setReadings(prev => prev.filter(r => r._id !== id))
    setGrouped(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(m => {
        updated[m] = updated[m].filter(r => r._id !== id)
        if (updated[m].length === 0) delete updated[m]
      })
      return updated
    })
  }

  // Books to display based on active tab
  const displayBooks = activeTab === 'all'
    ? readings
    : (grouped[activeTab] || [])

  // Stats
  const totalBooks     = readings.length
  const finishedBooks  = readings.filter(r => r.progress === 100).length
  const moodsExplored  = Object.keys(grouped).length
  const avgProgress    = readings.length
    ? Math.round(readings.reduce((sum, r) => sum + r.progress, 0) / readings.length)
    : 0

  return (
    <div style={{ ...page, background: theme.bg, transition: 'background 0.5s ease' }}>
      <style>{css}</style>

      {/* Atmosphere */}
      <div style={{ ...glowBg, background: `radial-gradient(ellipse 65% 50% at 50% 20%, ${theme.glow} 0%, transparent 70%)` }}/>
      {theme.grain && <div style={grainLayer}/>}
      <div style={subtleGrain}/>

      <div className={visible ? 'p-in' : 'p-out'} style={wrap}>

        {/* Nav */}
        <div style={navRow}>
          <button onClick={() => navigate('/mood')}
            style={{ ...navBtn, color: theme.subtext, borderColor: theme.cardBorder }}
            className="nav-btn">
            ← new mood
          </button>
          <div style={navTitle}>
            <span style={{ fontSize: 20 }}>📚</span>
            <span style={{ ...navTitleText, color: theme.text }}>my shelf</span>
          </div>
          <button onClick={() => navigate('/describe')}
            style={{ ...navBtn, color: theme.subtext, borderColor: theme.cardBorder }}
            className="nav-btn">
            find reads →
          </button>
        </div>

        {/* Stats row */}
        {!loading && readings.length > 0 && (
          <div style={statsRow} className="stats-in">
            {[
              { label: 'saved',    value: totalBooks },
              { label: 'finished', value: finishedBooks },
              { label: 'moods',    value: moodsExplored },
              { label: 'avg read', value: `${avgProgress}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ ...statCard, background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
                <span style={{ ...statVal, color: theme.primary }}>{value}</span>
                <span style={{ ...statLabel, color: theme.subtext }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mood filter tabs */}
        {!loading && Object.keys(grouped).length > 0 && (
          <div style={tabsRow}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                ...tabBtn,
                background: activeTab === 'all' ? theme.primary : theme.card,
                color: activeTab === 'all' ? theme.btnText : theme.subtext,
                border: `1px solid ${activeTab === 'all' ? theme.primary : theme.cardBorder}`,
              }}
              className="tab-btn"
            >
              all ({totalBooks})
            </button>
            {MOOD_ORDER.filter(m => grouped[m]).map(m => {
              const t = THEMES[m]
              return (
                <button
                  key={m}
                  onClick={() => setActiveTab(m)}
                  style={{
                    ...tabBtn,
                    background: activeTab === m ? t.primary : theme.card,
                    color: activeTab === m ? '#fff' : theme.subtext,
                    border: `1px solid ${activeTab === m ? t.primary : theme.cardBorder}`,
                  }}
                  className="tab-btn"
                >
                  {t.emoji} {t.name} ({grouped[m].length})
                </button>
              )
            })}
          </div>
        )}

        {/* Section heading */}
        <h1 style={{ ...heading, color: theme.text, fontFamily: theme.font }}>
          {loading
            ? 'loading your shelf…'
            : readings.length === 0
            ? 'your shelf is empty'
            : activeTab === 'all'
            ? `all your reads (${totalBooks})`
            : `${THEMES[activeTab]?.name} reads (${displayBooks.length})`
          }
        </h1>

        {/* Loading state */}
        {loading && (
          <div style={loadingWrap}>
            {[0,1,2].map(i => (
              <div key={i} style={{ ...loadCard, background: theme.card, border: `1px solid ${theme.cardBorder}`, animationDelay: `${i * 0.15}s` }}
                className="shimmer"/>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && readings.length === 0 && (
          <div style={emptyWrap}>
            <span style={{ fontSize: 56 }}>📚</span>
            <p style={{ color: theme.text, fontSize: 18, margin: '16px 0 8px', fontFamily: "'Georgia', serif" }}>
              Your shelf is waiting for its first story
            </p>
            <p style={{ color: theme.subtext, fontSize: 13, fontStyle: 'italic', marginBottom: 24 }}>
              Find a read that matches your mood and save it here
            </p>
            <button onClick={() => navigate('/mood')}
              style={{ ...emptyBtn, background: theme.btnBg, color: theme.btnText, boxShadow: `0 6px 24px ${theme.glow}` }}
              className="empty-btn">
              choose a mood →
            </button>
          </div>
        )}

        {/* Books list */}
        {!loading && displayBooks.length > 0 && (
          <div style={booksList}>
            {displayBooks.map((book, i) => {
              const bookTheme = THEMES[book.mood] || theme
              return (
                <ShelfCard
                  key={book._id}
                  book={book}
                  theme={bookTheme}
                  onProgressUpdate={handleProgressUpdate}
                  onRemove={handleRemove}
                />
              )
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && readings.length > 0 && (
          <p style={{ ...footNote, color: theme.subtext }}>
            ✦ &nbsp; {totalBooks} reads saved across {moodsExplored} moods
          </p>
        )}
      </div>

      {/* Coffee button */}
      <CoffeeButton mood={mood} />

      {/* Spotify player */}
      <SpotifyPlayer mood={mood} />
    </div>
  )
}

/* ── Styles ──────────────────────────────────────────────────────── */
const page = {
  minHeight: '100vh', position: 'relative', overflow: 'hidden',
  display: 'flex', justifyContent: 'center',
  fontFamily: "'Georgia', serif", padding: '32px 20px 80px',
}
const glowBg = { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }
const grainLayer = {
  position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`,
}
const subtleGrain = {
  position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E")`,
}
const wrap = {
  position: 'relative', zIndex: 2,
  width: '100%', maxWidth: 680,
  display: 'flex', flexDirection: 'column', alignItems: 'center',
}

const navRow = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', width: '100%', marginBottom: 24,
}
const navBtn = {
  background: 'transparent', border: '1px solid',
  borderRadius: 50, padding: '6px 16px',
  fontSize: 12, cursor: 'pointer',
  fontFamily: "'Georgia', serif",
  letterSpacing: '1px', fontStyle: 'italic',
  transition: 'all 0.2s ease',
}
const navTitle = { display: 'flex', alignItems: 'center', gap: 8 }
const navTitleText = { fontSize: 18, fontWeight: 700, fontFamily: "'Georgia', serif", letterSpacing: '1px' }

/* Stats */
const statsRow = {
  display: 'flex', gap: 10, width: '100%',
  marginBottom: 20, flexWrap: 'wrap',
}
const statCard = {
  flex: 1, minWidth: 70,
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '12px 8px', borderRadius: 14,
  backdropFilter: 'blur(12px)',
}
const statVal   = { fontSize: 22, fontWeight: 800, fontFamily: "'Georgia', serif" }
const statLabel = { fontSize: 9.5, letterSpacing: '1.5px', marginTop: 2 }

/* Tabs */
const tabsRow = {
  display: 'flex', gap: 8, width: '100%',
  marginBottom: 20, flexWrap: 'wrap',
}
const tabBtn = {
  padding: '6px 14px', borderRadius: 50,
  fontSize: 11.5, cursor: 'pointer',
  fontFamily: "'Georgia', serif",
  letterSpacing: '0.5px', fontStyle: 'italic',
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(8px)',
}

const heading = {
  fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700,
  margin: '0 0 20px', letterSpacing: '0.3px',
  alignSelf: 'flex-start',
}

const loadingWrap = { width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }
const loadCard    = { width: '100%', height: 130, borderRadius: 18 }

const emptyWrap = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', padding: '48px 0', textAlign: 'center',
}
const emptyBtn = {
  padding: '12px 28px', border: 'none', borderRadius: 50,
  fontSize: 14, fontWeight: 700,
  fontFamily: "'Georgia', serif", cursor: 'pointer',
  transition: 'all 0.25s ease',
}

const booksList = { width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }

/* Shelf card */
const sCardWrap = {
  width: '100%', borderRadius: 18, overflow: 'hidden',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  transition: 'all 0.3s ease',
  position: 'relative',
}
const sCardInner = { display: 'flex', gap: 14, padding: '16px' }
const sCoverWrap = { flexShrink: 0, position: 'relative', width: 80, height: 110 }
const sCoverImg  = { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }
const sCoverPlaceholder = { width: '100%', height: '100%', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const sProgressRing = {
  position: 'absolute', bottom: -8, right: -8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const sProgressNum = { position: 'absolute', fontSize: 9, fontWeight: 700 }

const sBookInfo  = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }
const sTitle     = { fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.3, fontFamily: "'Georgia', serif" }
const sAuthor    = { fontSize: 11.5, margin: 0, fontStyle: 'italic' }
const sMoodReason= { fontSize: 11, margin: 0, fontStyle: 'italic', opacity: 0.65, lineHeight: 1.4 }
const sTypeBadge = { alignSelf: 'flex-start', padding: '2px 8px', borderRadius: 50, fontSize: 9, letterSpacing: '0.5px', textTransform: 'uppercase' }
const sProgressWrap = { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }
const sSlider    = { flex: 1, height: 3, cursor: 'pointer' }
const sActions   = { display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }
const sReadBtn   = { padding: '6px 12px', borderRadius: 50, border: 'none', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'Georgia', serif", textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s ease' }
const sRemoveBtn = { padding: '6px 12px', borderRadius: 50, background: 'transparent', border: '1px solid', fontSize: 11, cursor: 'pointer', fontFamily: "'Georgia', serif", transition: 'all 0.2s ease' }
const completedBanner = { padding: '8px', textAlign: 'center' }

const footNote = {
  fontSize: 10.5, letterSpacing: '1.5px',
  textAlign: 'center', opacity: 0.35,
  fontFamily: "'Georgia', serif", marginTop: 24,
}

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .p-out { opacity:0; transform:translateY(18px); transition:opacity .75s ease,transform .75s cubic-bezier(.22,1,.36,1); }
  .p-in  { opacity:1; transform:translateY(0);    transition:opacity .75s ease,transform .75s cubic-bezier(.22,1,.36,1); }

  @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
  @keyframes stats-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .shimmer   { animation: shimmer 1.5s ease-in-out infinite; }
  .stats-in  { animation: stats-in 0.6s ease forwards; }
  .shelf-card { animation: stats-in 0.5s ease both; }

  .nav-btn:hover    { opacity:0.75; }
  .tab-btn:hover    { opacity:0.85; transform:translateY(-1px); }
  .s-read-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .s-remove-btn:hover { opacity:0.7; }
  .empty-btn:hover  { transform:translateY(-2px); filter:brightness(1.1); }
`