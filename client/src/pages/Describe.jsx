import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useMood } from '../context/MoodContext'
import { THEMES } from '../styles/themes'
import SpotifyPlayer from '../components/SpotifyPlayer'
import CoffeeButton from '../components/CoffeeButton'

/* ── Mood-specific prompt chips ───────────────────────────────────
   Each mood gets 6 tappable suggestion chips that feel native
   to that mood's emotional world
──────────────────────────────────────────────────────────────────*/
const MOOD_CHIPS = {
  happy: [
    'something that makes me smile on every page',
    'a feel-good story with a happy ending',
    'light romance with lots of banter',
    'an uplifting true story',
    'something funny and heartwarming',
    'a book that feels like sunshine',
  ],
  melancholy: [
    'something beautifully sad',
    'a story about loss and finding yourself',
    'quiet literary fiction that understands loneliness',
    'poetry that holds what words can\'t',
    'a slow burn with a bittersweet ending',
    'something cinematic and raw',
  ],
  cozy: [
    'a rainy day read with warm characters',
    'cozy mystery set in a small town',
    'something with coffee shops and slow mornings',
    'a comfort reread kind of story',
    'cottage core vibes — nature and quiet life',
    'something I can disappear into tonight',
  ],
  curious: [
    'a mind-expanding non-fiction',
    'something that makes me question everything',
    'a magical realism story',
    'science explained beautifully',
    'a philosophical journey',
    'something wonderfully strange',
  ],
  adventurous: [
    'an epic fantasy with world-building',
    'a survival story in the wild',
    'space exploration and the cosmos',
    'a travel memoir that took real courage',
    'something that makes me want to pack a bag',
    'an action-driven thriller',
  ],
  calm: [
    'something slow and meditative',
    'nature writing that breathes',
    'a gentle memoir about ordinary life',
    'poetry collections for quiet evenings',
    'a book about finding peace',
    'something with no plot twists — just beauty',
  ],
  romantic: [
    'a slow burn romance between bookworms',
    'something that makes my heart ache',
    'historical romance in a grand setting',
    'a love story that unfolds over letters',
    'something passionate and dramatic',
    'enemies to lovers with great tension',
  ],
  focused: [
    'a productivity or mindset book',
    'biography of someone who built something great',
    'a focused deep-dive into one subject',
    'something that will sharpen my thinking',
    'business insights wrapped in story',
    'a short punchy read I can finish today',
  ],
  stressed: [
    'something to help me breathe and slow down',
    'a gentle story with no pressure',
    'a short comforting read',
    'mindfulness or mental health insights',
    'something that says it\'s okay not to be okay',
    'a world I can escape into right now',
  ],
}

/* ── Mood-specific textarea placeholders ──────────────────────── */
const MOOD_PLACEHOLDERS = {
  happy:       'It\'s a golden kind of day. I want something that feels like...',
  melancholy:  'I want to feel understood tonight. Something about...',
  cozy:        'It\'s raining outside and I have coffee. I want something warm like...',
  curious:     'My mind is wide open right now. I want to explore...',
  adventurous: 'I need to go somewhere far away. Take me to...',
  calm:        'I just need something gentle and slow. Something like...',
  romantic:    'My heart is full tonight. I want something about...',
  focused:     'I\'m in the zone and ready to learn. Give me something about...',
  stressed:    'The world got too loud. I just need to escape into...',
}

/* ── Particle canvas — inherits from theme ────────────────────── */
const ThemeParticles = ({ theme }) => {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const [r,g,b] = parseRgba(theme.particleColor)
    const type = theme.particles

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + 1,
      alpha: Math.random() * 0.4 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002,
      vx: (Math.random() - 0.5) * 0.3,
      vy: type === 'rain' ? Math.random() * 4 + 3 : -(Math.random() * 0.4 + 0.1),
      rot: Math.random() * Math.PI * 2,
      rotS: (Math.random() - 0.5) * 0.02,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      particles.forEach(p => {
        p.phase += p.speed
        p.x += p.vx
        p.y += p.vy
        p.rot += p.rotS
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.phase))
        if (p.y < -20) { p.y = c.height + 20; p.x = Math.random() * c.width }
        if (p.y > c.height + 20) { p.y = -20; p.x = Math.random() * c.width }

        if (type === 'rain') {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vy * 0.1, p.y + 12)
          ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.4})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        } else if (type === 'petals' || type === 'rosepetals') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
          ctx.beginPath()
          ctx.ellipse(0, 0, p.r * 2, p.r, 0, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`
          ctx.fill(); ctx.restore()
        } else {
          const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
          g2.addColorStop(0, `rgba(${r},${g},${b},${a})`)
          g2.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
          ctx.fillStyle = g2; ctx.fill()
        }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [theme])
  return <canvas ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1 }} />
}

function parseRgba(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  return m ? [m[1], m[2], m[3]] : [255, 255, 255]
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function Describe() {
  const navigate  = useNavigate()
  const { mood, musicEnabled } = useMood()
  const theme  = THEMES[mood] || THEMES.cozy
  const chips  = MOOD_CHIPS[mood]  || MOOD_CHIPS.cozy
  const placeholder = MOOD_PLACEHOLDERS[mood] || MOOD_PLACEHOLDERS.cozy

  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [charCount, setCharCount] = useState(0)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showPlayer, setShowPlayer] = useState(musicEnabled)
  const textareaRef = useRef(null)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])
  useEffect(() => { setCharCount(text.length) }, [text])

  // Add chip text to textarea
  const addChip = (chip) => {
    const newText = text ? `${text} ${chip}` : chip
    setText(newText)
    textareaRef.current?.focus()
  }

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().length < 10) {
      setError('Tell me a little more — at least a sentence!')
      return
    }
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:8000/api/books/recommend',
        { mood, description: text },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Store recommendations in sessionStorage for Books page
      sessionStorage.setItem('brewreads_books', JSON.stringify(res.data))
      sessionStorage.setItem('brewreads_description', text)
      navigate('/books')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again!')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ ...page, background: theme.bg, transition: 'background 0.5s ease' }}>
      <style>{css}</style>

      {/* Atmosphere */}
      <ThemeParticles theme={theme} />
      <div style={{ ...glowBg, background: `radial-gradient(ellipse 65% 55% at 50% 30%, ${theme.glow} 0%, transparent 70%)` }}/>
      {theme.grain && <div style={grainLayer}/>}
      <div style={subtleGrain}/>

      {/* Main content */}
      <div className={visible ? 'p-in' : 'p-out'} style={wrap}>

        {/* Back button */}
        <button onClick={() => navigate('/mood')}
          style={{ ...backBtn, color: theme.subtext, borderColor: theme.cardBorder }}
          className="back-btn">
          ← moods
        </button>

        {/* Mood identity — top */}
        <div style={moodBadge}>
          <span style={moodBadgeEmoji}>{theme.emoji}</span>
          <div>
            <p style={{ ...moodBadgeName, color: theme.primary }}>{theme.name}</p>
            <p style={{ ...moodBadgeVoice, color: theme.subtext }}>"{theme.authorVoice}"</p>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ ...heading, color: theme.text, fontFamily: theme.font }}>
          what are you looking for?
        </h1>
        <p style={{ ...subheading, color: theme.subtext }}>
          Describe it in your own words — a feeling, a story, a topic, anything.
          <br/>The AI will find the perfect read for this moment.
        </p>

        {/* ── Prompt chips ── */}
        <div style={chipsWrap}>
          {chips.map((chip, i) => (
            <button
              key={i}
              onClick={() => addChip(chip)}
              style={{
                ...chipBtn,
                background: text.includes(chip) ? theme.primary + '33' : theme.card,
                border: `1px solid ${text.includes(chip) ? theme.primary + '88' : theme.cardBorder}`,
                color: text.includes(chip) ? theme.text : theme.subtext,
              }}
              className="chip"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── Journal textarea ── */}
        <div style={{
          ...textareaWrap,
          border: `1px solid ${focused ? theme.primary + '55' : theme.cardBorder}`,
          boxShadow: focused
            ? `0 0 0 3px ${theme.glow}, 0 8px 40px rgba(0,0,0,0.4)`
            : '0 8px 40px rgba(0,0,0,0.3)',
          background: theme.card,
          transition: 'all 0.25s ease',
        }}>
          <div style={textareaTopBar}>
            <span style={{ color: theme.subtext, fontSize: 11, letterSpacing: '1.5px' }}>
              your thoughts
            </span>
            <span style={{ color: charCount > 20 ? theme.primary : theme.subtext,
              fontSize: 11, opacity: 0.6 }}>
              {charCount} chars
            </span>
          </div>

          <textarea
            ref={textareaRef}
            className="journal-textarea"
            style={{
              ...textarea,
              color: theme.text,
              caretColor: theme.primary,
              fontFamily: theme.font,
            }}
            placeholder={placeholder}
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={6}
            maxLength={500}
          />

          {/* Char progress bar */}
          <div style={progressBar}>
            <div style={{
              ...progressFill,
              width: `${(charCount / 500) * 100}%`,
              background: theme.primary,
              opacity: 0.4,
            }}/>
          </div>
        </div>

        {error && (
          <div className="err-shake" style={{ ...errBox, borderColor: theme.primary + '44' }}>
            {error}
          </div>
        )}

        {/* ── Submit button ── */}
        <button
          onClick={handleSubmit}
          disabled={loading || text.trim().length < 5}
          style={{
            ...submitBtn,
            background: text.trim().length >= 5 ? theme.btnBg : 'rgba(255,255,255,0.08)',
            color: text.trim().length >= 5 ? theme.btnText : theme.subtext,
            boxShadow: text.trim().length >= 5 ? `0 8px 32px ${theme.glow}` : 'none',
            opacity: loading ? 0.6 : 1,
            cursor: loading || text.trim().length < 5 ? 'not-allowed' : 'pointer',
          }}
          className="submit-btn"
        >
          {loading
            ? <span className="loading-pulse">finding your perfect read…</span>
            : <>find my {theme.name.toLowerCase()} reads <span style={{ fontSize:18 }}>→</span></>
          }
        </button>

        {/* Footer note */}
        <p style={{ ...footNote, color: theme.subtext }}>
          ✦ &nbsp; powered by Groq AI &nbsp;·&nbsp; books + articles &nbsp;·&nbsp; matched to your mood
        </p>

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
  fontFamily: "'Georgia', serif", padding: '32px 20px 60px',
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
  width: '100%', maxWidth: 580,
  display: 'flex', flexDirection: 'column', alignItems: 'center',
}

const backBtn = {
  alignSelf: 'flex-start', marginBottom: 24,
  background: 'transparent', border: '1px solid',
  borderRadius: 50, padding: '6px 16px',
  fontSize: 12, cursor: 'pointer',
  fontFamily: "'Georgia', serif",
  letterSpacing: '1px', fontStyle: 'italic',
  transition: 'all 0.2s ease',
}

const moodBadge = {
  display: 'flex', alignItems: 'center', gap: 12,
  marginBottom: 24, alignSelf: 'flex-start',
}
const moodBadgeEmoji = { fontSize: 32 }
const moodBadgeName  = { fontSize: 13, fontWeight: 700, letterSpacing: '2px', margin: 0, textTransform: 'uppercase' }
const moodBadgeVoice = { fontSize: 11.5, fontStyle: 'italic', margin: 0, opacity: 0.7 }

const heading = {
  fontSize: 'clamp(24px,5vw,34px)', fontWeight: 700,
  margin: '0 0 10px', letterSpacing: '0.5px',
  alignSelf: 'flex-start', lineHeight: 1.2,
}
const subheading = {
  fontSize: 13, lineHeight: 1.7,
  margin: '0 0 28px', alignSelf: 'flex-start',
  opacity: 0.65, fontStyle: 'italic',
}

/* Chips */
const chipsWrap = {
  display: 'flex', flexWrap: 'wrap', gap: 8,
  marginBottom: 20, alignSelf: 'flex-start',
}
const chipBtn = {
  padding: '7px 14px', borderRadius: 50,
  fontSize: 12, cursor: 'pointer',
  fontFamily: "'Georgia', serif", fontStyle: 'italic',
  letterSpacing: '0.3px',
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(8px)',
}

/* Textarea */
const textareaWrap = {
  width: '100%', borderRadius: 20,
  overflow: 'hidden', marginBottom: 16,
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
}
const textareaTopBar = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px 18px 0',
}
const textarea = {
  width: '100%', padding: '12px 18px 16px',
  background: 'transparent', border: 'none', outline: 'none',
  fontSize: 15, lineHeight: 1.8,
  resize: 'none', display: 'block',
  boxSizing: 'border-box',
}
const progressBar  = { height: 2, width: '100%', background: 'rgba(255,255,255,0.04)' }
const progressFill = { height: '100%', borderRadius: 2, transition: 'width 0.3s ease' }

const errBox = {
  width: '100%', padding: '10px 16px',
  background: 'rgba(200,60,60,0.08)',
  border: '1px solid', borderRadius: 12,
  fontSize: 13, color: '#f09090',
  marginBottom: 14, fontFamily: "'Georgia', serif",
  textAlign: 'center',
}

const submitBtn = {
  width: '100%', padding: '15px',
  border: 'none', borderRadius: 50,
  fontSize: 15, fontWeight: 700,
  fontFamily: "'Georgia', serif",
  letterSpacing: '0.5px',
  transition: 'all 0.25s ease',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 8,
  marginBottom: 16,
}

const footNote = {
  fontSize: 10.5, letterSpacing: '1.5px',
  textAlign: 'center', opacity: 0.4,
  fontFamily: "'Georgia', serif",
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

  @keyframes loading-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes err-shake {
    15%{transform:translateX(-5px)} 35%{transform:translateX(5px)}
    55%{transform:translateX(-3px)} 75%{transform:translateX(3px)} 100%{transform:none}
  }

  .loading-pulse { animation: loading-pulse 1.5s ease-in-out infinite; }
  .err-shake     { animation: err-shake .45s ease; }

  .journal-textarea::placeholder { opacity: 0.3; font-style: italic; }

  .chip:hover {
    transform: translateY(-2px) scale(1.03);
    opacity: 0.9;
  }
  .chip:active { transform: translateY(0) scale(0.97); }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }

  .back-btn:hover { opacity: 0.8; transform: translateX(-2px); }
`