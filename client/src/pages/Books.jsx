import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useMood } from '../context/MoodContext'
import { THEMES } from '../styles/themes'
import SpotifyPlayer from '../components/SpotifyPlayer'
import CoffeeButton from '../components/CoffeeButton'

/* ── Book Card ────────────────────────────────────────────────── */
const BookCard = ({ book, theme, index, onSave, saved }) => {
  const [hovered, setHovered] = useState(false)
  const [saving, setSaving]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(book)
    setSaving(false)
  }

  const handleRead = () => {
    if (book.previewLink) {
      window.open(book.previewLink, '_blank')
    } else if (book.infoLink) {
      window.open(book.infoLink, '_blank')
    }
  }

  return (
    <div
      className="book-card"
      style={{
        ...cardWrap,
        background: hovered ? theme.card.replace('0.07','0.12') : theme.card,
        border: `1px solid ${hovered ? theme.primary + '55' : theme.cardBorder}`,
        boxShadow: hovered
          ? `0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${theme.glow}`
          : '0 4px 24px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        animationDelay: `${index * 0.12}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card top shimmer */}
      <div style={{ ...cardShimmer, background: `linear-gradient(90deg, transparent, ${theme.primary}44, transparent)` }}/>

      <div style={cardInner}>
        {/* Book cover */}
        <div style={coverWrap}>
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              style={coverImg}
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div style={{ ...coverPlaceholder, background: theme.btnBg }}>
              <span style={{ fontSize: 32 }}>📖</span>
              <span style={{ fontSize: 10, color: theme.btnText, opacity: 0.7, textAlign: 'center', padding: '0 8px' }}>
                {book.title?.slice(0, 30)}
              </span>
            </div>
          )}
          {/* Type badge */}
          <div style={{ ...typeBadge, background: theme.btnBg }}>
            <span style={{ color: theme.btnText, fontSize: 9, letterSpacing: '1px' }}>
              {book.type || 'book'}
            </span>
          </div>
        </div>

        {/* Book info */}
        <div style={bookInfo}>
          <h3 style={{ ...bookTitle, color: theme.text }}>{book.title}</h3>
          {book.authors && (
            <p style={{ ...bookAuthor, color: theme.primary }}>
              {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
            </p>
          )}

          {/* AI mood match reason */}
          {book.moodReason && (
            <div style={{ ...moodReason, borderColor: theme.primary + '33', background: theme.card }}>
              <span style={{ color: theme.primary, fontSize: 12 }}>✦</span>
              <p style={{ ...moodReasonText, color: theme.subtext }}>
                {book.moodReason}
              </p>
            </div>
          )}

          {/* Description snippet */}
          {book.description && (
            <p style={{ ...bookDesc, color: theme.subtext }}>
              {book.description.slice(0, 120)}…
            </p>
          )}

          {/* Action buttons */}
          <div style={cardBtns}>
            <button
              onClick={handleRead}
              style={{ ...readBtn, background: theme.btnBg, color: theme.btnText,
                boxShadow: `0 4px 16px ${theme.glow}` }}
              className="read-btn"
            >
              {book.previewLink ? 'Read preview →' : 'View on Google Books →'}
            </button>
            <button
              onClick={handleSave}
              disabled={saved || saving}
              style={{
                ...saveBtn,
                borderColor: saved ? theme.primary : theme.cardBorder,
                color: saved ? theme.primary : theme.subtext,
                background: saved ? theme.primary + '15' : 'transparent',
              }}
              className="save-btn"
            >
              {saving ? '…' : saved ? '✓ saved' : '+ shelf'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function Books() {
  const navigate = useNavigate()
  const { mood, musicEnabled } = useMood()
  const theme = THEMES[mood] || THEMES.cozy

  const [books, setBooks]         = useState([])
  const [aiNote, setAiNote]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [savedBooks, setSavedBooks] = useState(new Set())
  const [visible, setVisible]     = useState(false)
  const [showPlayer, setShowPlayer] = useState(musicEnabled)
  const description = sessionStorage.getItem('brewreads_description') || ''

  useEffect(() => {
    loadBooks()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const loadBooks = () => {
    // Load from sessionStorage (set by Describe page)
    const stored = sessionStorage.getItem('brewreads_books')
    if (stored) {
      const data = JSON.parse(stored)
      setBooks(data.books || data || [])
      setAiNote(data.aiNote || data.message || '')
      setLoading(false)
    } else {
      // Fallback — refetch if no data
      navigate('/describe')
    }
  }

  const handleSave = async (book) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:8000/api/books/save',
        {
          mood,
          title:       book.title,
          authors:     book.authors,
          thumbnail:   book.thumbnail,
          description: book.description,
          previewLink: book.previewLink,
          infoLink:    book.infoLink,
          type:        book.type || 'book',
          moodReason:  book.moodReason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSavedBooks(prev => new Set([...prev, book.title]))
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return (
    <div style={{ ...page, background: theme.bg, transition: 'background 0.5s ease' }}>
      <style>{css}</style>

      {/* Atmosphere */}
      <div style={{ ...glowBg, background: `radial-gradient(ellipse 70% 55% at 50% 25%, ${theme.glow} 0%, transparent 70%)` }}/>
      {theme.grain && <div style={grainLayer}/>}
      <div style={subtleGrain}/>

      <div className={visible ? 'p-in' : 'p-out'} style={wrap}>

        {/* Nav row */}
        <div style={navRow}>
          <button onClick={() => navigate('/describe')}
            style={{ ...navBtn, color: theme.subtext, borderColor: theme.cardBorder }}
            className="nav-btn">
            ← describe
          </button>
          <button onClick={() => navigate('/shelf')}
            style={{ ...navBtn, color: theme.subtext, borderColor: theme.cardBorder }}
            className="nav-btn">
            my shelf →
          </button>
        </div>

        {/* Mood badge */}
        <div style={moodBadge}>
          <span style={{ fontSize: 28 }}>{theme.emoji}</span>
          <div>
            <p style={{ ...moodName, color: theme.primary }}>{theme.name}</p>
            <p style={{ ...moodVoice, color: theme.subtext }}>"{theme.tagline}"</p>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ ...heading, color: theme.text, fontFamily: theme.font }}>
          {loading ? 'finding your reads…' : 'here\'s what I found for you'}
        </h1>

        {/* AI personal note */}
        {aiNote && !loading && (
          <div style={{ ...aiNoteWrap, borderColor: theme.primary + '33', background: theme.card }}
            className="ai-note-in">
            <span style={{ color: theme.primary, fontSize: 16 }}>✦</span>
            <p style={{ ...aiNoteText, color: theme.text }}>
              {aiNote}
            </p>
          </div>
        )}

        {/* User's description recap */}
        {description && !loading && (
          <div style={{ ...descRecap, color: theme.subtext }}>
            <span style={{ opacity: 0.5 }}>you said: </span>
            <em>"{description.slice(0, 80)}{description.length > 80 ? '…' : ''}"</em>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={loadingWrap}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                ...loadingCard,
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                animationDelay: `${i * 0.15}s`,
              }} className="shimmer"/>
            ))}
          </div>
        )}

        {/* Book cards */}
        {!loading && books.length > 0 && (
          <div style={booksGrid}>
            {books.map((book, i) => (
              <BookCard
                key={i}
                book={book}
                theme={theme}
                index={i}
                onSave={handleSave}
                saved={savedBooks.has(book.title)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && books.length === 0 && (
          <div style={emptyWrap}>
            <span style={{ fontSize: 48 }}>{theme.emoji}</span>
            <p style={{ color: theme.text, fontSize: 16, margin: '12px 0 6px' }}>
              Hmm, couldn't find the right match
            </p>
            <p style={{ color: theme.subtext, fontSize: 13, fontStyle: 'italic' }}>
              Try describing it differently
            </p>
            <button onClick={() => navigate('/describe')}
              style={{ ...retryBtn, background: theme.btnBg, color: theme.btnText,
                boxShadow: `0 4px 20px ${theme.glow}` }}
              className="retry-btn">
              try again →
            </button>
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <p style={{ ...footNote, color: theme.subtext }}>
            ✦ &nbsp; {books.length} reads found &nbsp;·&nbsp; matched to your {theme.name.toLowerCase()} mood
          </p>
        )}
      </div>

      {/* Spotify player */}
      <SpotifyPlayer mood={mood} />

      {/* Coffee button */}
      <CoffeeButton mood={mood} />
    </div>
  )
}

/* ── Styles ──────────────────────────────────────────────────────── */
const page = {
  minHeight: '100vh', position: 'relative', overflow: 'hidden',
  display: 'flex', justifyContent: 'center',
  fontFamily: "'Georgia', serif", padding: '32px 20px 80px',
}
const glowBg     = { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }
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
  width: '100%', marginBottom: 24,
}
const navBtn = {
  background: 'transparent', border: '1px solid',
  borderRadius: 50, padding: '6px 16px',
  fontSize: 12, cursor: 'pointer',
  fontFamily: "'Georgia', serif",
  letterSpacing: '1px', fontStyle: 'italic',
  transition: 'all 0.2s ease',
}

const moodBadge = {
  display: 'flex', alignItems: 'center', gap: 12,
  marginBottom: 20, alignSelf: 'flex-start',
}
const moodName  = { fontSize: 13, fontWeight: 700, letterSpacing: '2px', margin: 0, textTransform: 'uppercase' }
const moodVoice = { fontSize: 11.5, fontStyle: 'italic', margin: 0, opacity: 0.7 }

const heading = {
  fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700,
  margin: '0 0 16px', letterSpacing: '0.3px',
  alignSelf: 'flex-start',
}

const aiNoteWrap = {
  display: 'flex', gap: 10, alignItems: 'flex-start',
  width: '100%', padding: '14px 16px',
  borderRadius: 14, border: '1px solid',
  backdropFilter: 'blur(12px)',
  marginBottom: 12,
}
const aiNoteText = {
  fontSize: 13, fontStyle: 'italic', lineHeight: 1.65,
  margin: 0, fontFamily: "'Georgia', serif",
}

const descRecap = {
  alignSelf: 'flex-start', fontSize: 12,
  marginBottom: 24, fontFamily: "'Georgia', serif",
  opacity: 0.6,
}

/* Loading shimmer cards */
const loadingWrap = {
  width: '100%', display: 'flex', flexDirection: 'column', gap: 16,
}
const loadingCard = {
  width: '100%', height: 140, borderRadius: 18,
  backdropFilter: 'blur(12px)',
}

/* Books grid */
const booksGrid = {
  width: '100%', display: 'flex',
  flexDirection: 'column', gap: 16,
}

/* Individual card */
const cardWrap = {
  width: '100%', borderRadius: 20,
  overflow: 'hidden', position: 'relative',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  animation: 'card-in 0.5s ease both',
}
const cardShimmer = {
  position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
}
const cardInner = {
  display: 'flex', gap: 16, padding: '18px',
}

const coverWrap = {
  flexShrink: 0, position: 'relative',
  width: 90, height: 130,
}
const coverImg = {
  width: '100%', height: '100%',
  objectFit: 'cover', borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
}
const coverPlaceholder = {
  width: '100%', height: '100%', borderRadius: 8,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: 6,
}
const typeBadge = {
  position: 'absolute', bottom: -6, left: '50%',
  transform: 'translateX(-50%)',
  padding: '2px 8px', borderRadius: 50,
  textTransform: 'uppercase', letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
}

const bookInfo  = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }
const bookTitle = { fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.3, fontFamily: "'Georgia', serif" }
const bookAuthor= { fontSize: 12, margin: 0, fontStyle: 'italic', opacity: 0.9 }

const moodReason = {
  display: 'flex', gap: 6, alignItems: 'flex-start',
  padding: '7px 10px', borderRadius: 8, border: '1px solid',
  backdropFilter: 'blur(8px)',
}
const moodReasonText = { fontSize: 11, fontStyle: 'italic', margin: 0, lineHeight: 1.5 }

const bookDesc = { fontSize: 11.5, margin: 0, lineHeight: 1.6, opacity: 0.7, fontStyle: 'italic' }

const cardBtns = { display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }
const readBtn  = {
  padding: '7px 14px', borderRadius: 50,
  border: 'none', fontSize: 12, fontWeight: 700,
  fontFamily: "'Georgia', serif", cursor: 'pointer',
  letterSpacing: '0.3px', transition: 'all 0.2s ease',
}
const saveBtn  = {
  padding: '7px 14px', borderRadius: 50,
  background: 'transparent', border: '1px solid',
  fontSize: 12, cursor: 'pointer',
  fontFamily: "'Georgia', serif", letterSpacing: '0.3px',
  transition: 'all 0.2s ease',
}

const emptyWrap = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: 8, padding: '48px 0',
}
const retryBtn = {
  marginTop: 16, padding: '12px 28px',
  border: 'none', borderRadius: 50,
  fontSize: 14, fontWeight: 700,
  fontFamily: "'Georgia', serif", cursor: 'pointer',
  transition: 'all 0.25s ease',
}

const footNote = {
  fontSize: 10.5, letterSpacing: '1.5px',
  textAlign: 'center', opacity: 0.35,
  fontFamily: "'Georgia', serif", marginTop: 24,
}

const musicToggle = {
  position: 'fixed', bottom: 88, right: 16, zIndex: 100,
  width: 48, height: 48, borderRadius: '50%',
  border: 'none', fontSize: 20, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.25s ease',
}

/* ── Animations ──────────────────────────────────────────────────── */
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .p-out { opacity:0; transform:translateY(18px); transition:opacity .75s ease,transform .75s cubic-bezier(.22,1,.36,1); }
  .p-in  { opacity:1; transform:translateY(0);    transition:opacity .75s ease,transform .75s cubic-bezier(.22,1,.36,1); }

  @keyframes card-in {
    from { opacity:0; transform:translateY(24px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes shimmer {
    0%   { opacity:0.4; }
    50%  { opacity:0.7; }
    100% { opacity:0.4; }
  }
  @keyframes ai-note-in {
    from { opacity:0; transform:translateX(-10px); }
    to   { opacity:1; transform:translateX(0); }
  }

  .book-card { animation: card-in 0.5s ease both; }
  .shimmer   { animation: shimmer 1.5s ease-in-out infinite; }
  .ai-note-in { animation: ai-note-in 0.6s ease forwards; }

  .read-btn:hover { transform:translateY(-1px); filter:brightness(1.1); }
  .save-btn:hover { opacity:0.85; }
  .nav-btn:hover  { opacity:0.75; }
  .retry-btn:hover { transform:translateY(-2px); filter:brightness(1.1); }
`