import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEMES, MOOD_ORDER, MOOD_DESCRIPTIONS } from '../styles/themes'

/* ══════════════════════════════════════════════════════════════════
   SPLASH SCREEN
   ══════════════════════════════════════════════════════════════════ */
const SplashScreen = ({ onDone }) => {
  const [step, setStep] = useState(0)
  const tagline = 'where every mood finds its story'
  const [typed, setTyped] = useState('')
  const typingRef = useRef(null)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400)
    const t2 = setTimeout(() => setStep(2), 1100)
    const t3 = setTimeout(() => setStep(3), 1900)
    const t4 = setTimeout(() => setStep(4), 4400)
    const t5 = setTimeout(() => onDone(), 5000)
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (step !== 3) return
    let i = 0
    typingRef.current = setInterval(() => {
      i++
      setTyped(tagline.slice(0, i))
      if (i >= tagline.length) clearInterval(typingRef.current)
    }, 48)
    return () => clearInterval(typingRef.current)
  }, [step])

  return (
    <div style={{
      ...splashWrap,
      opacity: step === 4 ? 0 : 1,
      transition: step === 4 ? 'opacity 0.7s ease' : 'none',
    }}>
      <style>{splashCss}</style>

      {/* Twinkling stars */}
      {Array.from({length:35},(_,i) => (
        <div key={i} className="sstar" style={{
          left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
          width:`${Math.random()*2+0.5}px`, height:`${Math.random()*2+0.5}px`,
          animationDelay:`${Math.random()*4}s`,
          animationDuration:`${Math.random()*3+2}s`,
        }}/>
      ))}

      {/* Ambient glow */}
      <div style={splashGlow}/>

      <div style={splashContent}>
        {/* Cup pops in */}
        <div className={step>=1?'cup-in':'cup-out'} style={splashCup}>☕</div>

        {/* Brand rises */}
        <div className={step>=2?'brand-in':'brand-out'} style={splashBrand}>
          BrewReads
        </div>

        {/* Tagline types itself */}
        <div style={{ ...splashTagline, opacity: step>=3?1:0, transition:'opacity 0.5s ease' }}>
          {typed}
          {step===3 && typed.length<tagline.length && <span style={splashCursor}>|</span>}
        </div>

        {/* Mood dots appear after tagline */}
        <div style={{ ...splashDots, opacity: step>=3 && typed.length>20 ? 1:0, transition:'opacity 0.8s ease 0.5s' }}>
          {MOOD_ORDER.map((m,i) => (
            <span key={m} style={{ fontSize:18, animationDelay:`${i*0.1}s` }} className="dot-pop">
              {THEMES[m].emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MOOD CAROUSEL
   ══════════════════════════════════════════════════════════════════ */
const MoodCarousel = () => {
  const navigate = useNavigate()
  const [current, setCurrent]   = useState(0)
  const [dir, setDir]           = useState(1)
  const [visible, setVisible]   = useState(false)
  const [exiting, setExiting]   = useState(false)
  const [showEntry, setShowEntry] = useState(false) // entry message preview
  const touchStart = useRef(null)
  const dragStart  = useRef(null)

  const mood  = MOOD_ORDER[current]
  const theme = THEMES[mood]

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  // Reset entry message when mood changes
  useEffect(() => {
    setShowEntry(false)
    const t = setTimeout(() => setShowEntry(true), 600)
    return () => clearTimeout(t)
  }, [current])

  const goTo = (idx) => {
    if (idx === current) return
    setDir(idx > current ? 1 : -1)
    setCurrent(idx)
  }
  const next = () => goTo((current+1) % MOOD_ORDER.length)
  const prev = () => goTo((current-1+MOOD_ORDER.length) % MOOD_ORDER.length)

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStart.current = null
  }
  const onMouseDown = (e) => { dragStart.current = e.clientX }
  const onMouseUp   = (e) => {
    if (dragStart.current === null) return
    const dx = e.clientX - dragStart.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    dragStart.current = null
  }

  const handleGetStarted = () => {
    setExiting(true)
    sessionStorage.setItem('brewreads_pending_mood', MOOD_ORDER[current])
    setTimeout(() => navigate('/login'), 600)
  }

  return (
    <div
      style={{ ...carouselPage, background: theme.bg, transition:'background 0.85s ease' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}   onMouseUp={onMouseUp}
    >
      <style>{carouselCss}</style>

      {/* Mood atmosphere glow */}
      <div style={{
        ...moodGlow,
        background:`radial-gradient(ellipse 70% 60% at 50% 30%, ${theme.glow} 0%, transparent 70%)`,
        transition:'background 0.85s ease',
      }}/>

      {/* Grain overlay for moods that use it */}
      {theme.grain && <div style={grainOverlay}/>}

      {/* Grain always subtle */}
      <div style={subtleGrain}/>

      <div
        className={visible ? 'c-in' : 'c-out'}
        style={{
          ...carouselWrap,
          opacity: exiting ? 0 : 1,
          transform: exiting ? 'scale(0.95) translateY(10px)' : 'scale(1)',
          transition: exiting ? 'all 0.5s ease' : undefined,
        }}
      >
        {/* ── TOP — brand + question ── */}
        <div style={topSection}>
          <p style={miniLogo}>☕ BrewReads</p>
          <h1 style={{ ...question, color: theme.text, transition:'color 0.5s ease' }}>
            how are you feeling?
          </h1>
          <p style={{ ...swipeHint, color: theme.subtext, transition:'color 0.5s ease' }}>
            swipe to explore · {current+1} of {MOOD_ORDER.length}
          </p>
        </div>

        {/* ── CARD STACK ── */}
        <div style={stackWrap} className="no-select">
          {/* Back cards — depth effect */}
          {[-2,-1].map(offset => {
            const idx = (current + Math.abs(offset)) % MOOD_ORDER.length
            const t2  = THEMES[MOOD_ORDER[idx]]
            return (
              <div key={offset} style={{
                ...backCard,
                background: t2.card,
                border: `1px solid ${t2.cardBorder}`,
                transform: `rotate(${offset*3.5}deg) scale(${0.88+offset*0.06}) translateY(${offset*-6}px)`,
                opacity: 0.3 + offset*0.15,
              }}/>
            )
          })}

          {/* Main card */}
          <div
            key={current}
            className={`card-enter-${dir>0?'r':'l'}`}
            style={{
              ...mainCard,
              background: theme.card,
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 48px ${theme.glow}`,
            }}
          >
            {/* Top shimmer */}
            <div style={{ ...cardShimmer, background:`linear-gradient(90deg,transparent,${theme.primary}55,transparent)` }}/>

            {/* Emoji */}
            <div style={cardEmoji}>{theme.emoji}</div>

            {/* Mood name */}
            <h2 style={{ ...cardName, color:theme.text, fontFamily:theme.font }}>
              {theme.name}
            </h2>

            {/* Author voice — the emotional hook */}
            <p style={{ ...cardVoice, color:theme.subtext }}>
              "{theme.authorVoice}"
            </p>

            {/* Mood description */}
            <p style={{ ...cardDesc, color:theme.subtext }}>
              {MOOD_DESCRIPTIONS[mood]}
            </p>

            {/* Divider with tagline */}
            <div style={taglineRow}>
              <div style={{ ...taglineLine, background:theme.primary }}/>
              <p style={{ ...taglineText, color:theme.subtext }}>{theme.tagline}</p>
              <div style={{ ...taglineLine, background:theme.primary }}/>
            </div>

            {/* Entry message preview — fades in after card settles */}
            <div style={{
              ...entryPreview,
              opacity: showEntry ? 1 : 0,
              transition: 'opacity 0.6s ease',
              borderColor: theme.primary + '33',
            }}>
              <p style={{ ...entryText, color: theme.text }}>
                {/* Show just first line of entry message */}
                {theme.entryMessage.split('\n')[0]}
              </p>
            </div>

            {/* Bottom pill — particles type */}
            <div style={{ ...cardPill, background:theme.btnBg }}>
              <span style={{ color:theme.btnText, fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase' }}>
                {theme.particles} · {theme.name.toLowerCase()} reads
              </span>
            </div>
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        <div style={navRow}>
          <button onClick={prev}
            style={{ ...arrowBtn, borderColor:theme.primary+'44', color:theme.subtext }}
            className="arr-btn">
            ←
          </button>

          {/* Dot indicators */}
          <div style={dotRow}>
            {MOOD_ORDER.map((m,i) => (
              <button key={m} onClick={() => goTo(i)} style={{
                ...dotBtn,
                width: i===current ? 22 : 7,
                background: i===current ? theme.primary : theme.subtext,
                opacity: i===current ? 1 : 0.28,
                transition:'all 0.35s ease',
              }}/>
            ))}
          </div>

          <button onClick={next}
            style={{ ...arrowBtn, borderColor:theme.primary+'44', color:theme.subtext }}
            className="arr-btn">
            →
          </button>
        </div>

        {/* ── CTA ── */}
        <button
          onClick={handleGetStarted}
          style={{ ...ctaBtn, background:theme.btnBg, color:theme.btnText, boxShadow:`0 8px 32px ${theme.glow}` }}
          className="cta-btn"
        >
          find my {theme.name.toLowerCase()} reads →
        </button>

        {/* Already have account */}
        <p style={{ ...alreadyRow, color:theme.subtext }}>
          already a reader?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ ...alreadyLink, color:theme.primary, borderBottomColor:theme.primary+'44' }}
          >
            sign in
          </span>
        </p>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [phase, setPhase] = useState('splash') // 'splash' | 'carousel'

  // Smooth transition — no white flash
  // Keep a persistent dark background underneath both phases
  return (
    <div style={{ minHeight:'100vh', background:'#06040e', position:'relative' }}>
      {/* Splash — fades out */}
      <div style={{
        position: phase === 'carousel' ? 'absolute' : 'relative',
        inset: 0,
        opacity: phase === 'carousel' ? 0 : 1,
        transition: 'opacity 0.8s ease',
        pointerEvents: phase === 'carousel' ? 'none' : 'auto',
        zIndex: phase === 'carousel' ? 0 : 1,
      }}>
        <SplashScreen onDone={() => setPhase('carousel')} />
      </div>

      {/* Carousel — fades in */}
      <div style={{
        position: phase === 'splash' ? 'absolute' : 'relative',
        inset: 0,
        opacity: phase === 'splash' ? 0 : 1,
        transition: 'opacity 0.8s ease',
        pointerEvents: phase === 'splash' ? 'none' : 'auto',
        zIndex: phase === 'splash' ? 0 : 1,
      }}>
        <MoodCarousel />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   STYLES — SPLASH
   ══════════════════════════════════════════════════════════════════ */
const splashWrap = {
  minHeight:'100vh', background:'#06040e',
  display:'flex', alignItems:'center', justifyContent:'center',
  position:'relative', overflow:'hidden',
  fontFamily:"'Georgia',serif",
}
const splashGlow = {
  position:'absolute', inset:0, pointerEvents:'none',
  background:'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(180,120,255,0.06) 0%, transparent 70%)',
}
const splashContent = {
  display:'flex', flexDirection:'column', alignItems:'center',
  gap:10, position:'relative', zIndex:1,
}
const splashCup   = { fontSize:56, lineHeight:1, display:'block' }
const splashBrand = {
  fontSize:40, fontWeight:800, letterSpacing:'4px',
  color:'#f0e0c0', fontFamily:"'Georgia',serif",
  textShadow:'0 0 40px rgba(220,160,60,0.45)',
}
const splashTagline = {
  fontSize:13, color:'rgba(200,170,110,0.5)',
  fontStyle:'italic', letterSpacing:'2px', minHeight:22,
}
const splashCursor = { animation:'cblink 0.7s ease-in-out infinite' }
const splashDots   = {
  display:'flex', gap:8, marginTop:8, flexWrap:'wrap', justifyContent:'center',
}

/* ══════════════════════════════════════════════════════════════════
   STYLES — CAROUSEL
   ══════════════════════════════════════════════════════════════════ */
const carouselPage = {
  minHeight:'100vh', position:'relative', overflow:'hidden',
  display:'flex', alignItems:'center', justifyContent:'center',
  fontFamily:"'Georgia',serif", userSelect:'none',
}
const moodGlow = {
  position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
}
const grainOverlay = {
  position:'fixed', inset:0, pointerEvents:'none', zIndex:1,
  backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
}
const subtleGrain = {
  position:'fixed', inset:0, pointerEvents:'none', zIndex:1,
  backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
}
const carouselWrap = {
  position:'relative', zIndex:2,
  width:'100%', maxWidth:420,
  padding:'28px 22px 36px',
  display:'flex', flexDirection:'column', alignItems:'center',
  transition:'all 0.5s ease',
}
const topSection = { textAlign:'center', marginBottom:18, width:'100%' }
const miniLogo   = { fontSize:12.5, color:'rgba(255,255,255,0.25)', letterSpacing:'2px', marginBottom:14 }
const question   = {
  fontSize:'clamp(22px,5vw,28px)', fontWeight:700,
  margin:'0 0 6px', fontFamily:"'Georgia',serif", letterSpacing:'0.5px',
}
const swipeHint  = { fontSize:11, fontStyle:'italic', letterSpacing:'1.5px', margin:0 }

// Card stack
const stackWrap = {
  width:'100%', position:'relative', height:340, marginBottom:20,
}
const backCard = {
  position:'absolute', inset:0, borderRadius:24,
  backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
  transition:'all 0.4s ease',
}
const mainCard = {
  position:'absolute', inset:0, borderRadius:24,
  padding:'24px 24px 0',
  display:'flex', flexDirection:'column', alignItems:'center',
  backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
  overflow:'hidden', cursor:'grab',
}
const cardShimmer = {
  position:'absolute', top:0, left:'10%', right:'10%', height:1,
}
const cardEmoji = { fontSize:42, marginBottom:8, lineHeight:1 }
const cardName  = {
  fontSize:24, fontWeight:800, margin:'0 0 8px', letterSpacing:'1px',
}
const cardVoice = {
  fontSize:12, fontStyle:'italic', textAlign:'center',
  lineHeight:1.65, margin:'0 0 8px', maxWidth:260,
  fontFamily:"'Georgia',serif",
}
const cardDesc  = {
  fontSize:11, textAlign:'center',
  lineHeight:1.5, margin:'0 0 12px', maxWidth:260,
  opacity:0.7,
}
const taglineRow  = { display:'flex', alignItems:'center', gap:8, width:'100%', marginBottom:10 }
const taglineLine = { flex:1, height:1, opacity:0.3 }
const taglineText = { fontSize:9.5, letterSpacing:'1.5px', fontStyle:'italic', whiteSpace:'nowrap' }

// Entry message preview
const entryPreview = {
  width:'100%', padding:'8px 12px',
  background:'rgba(255,255,255,0.04)',
  borderRadius:8, border:'1px solid',
  marginBottom:12,
}
const entryText = {
  fontSize:11, fontStyle:'italic', textAlign:'center',
  lineHeight:1.6, margin:0, fontFamily:"'Georgia',serif",
  opacity:0.75,
}

const cardPill = {
  position:'absolute', bottom:0, left:0, right:0,
  padding:'9px', textAlign:'center',
  borderRadius:'0 0 24px 24px',
}

// Navigation
const navRow   = { display:'flex', alignItems:'center', gap:14, width:'100%', justifyContent:'center', marginBottom:18 }
const arrowBtn = {
  width:44, height:44, borderRadius:'50%',
  background:'transparent', border:'1px solid',
  fontSize:18, cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center',
  transition:'all 0.2s ease', fontFamily:'monospace',
}
const dotRow = { display:'flex', gap:5, alignItems:'center' }
const dotBtn = { height:7, borderRadius:4, border:'none', cursor:'pointer', padding:0 }

// CTA
const ctaBtn = {
  width:'100%', padding:'14px',
  border:'none', borderRadius:50,
  fontSize:14.5, fontWeight:700,
  fontFamily:"'Georgia',serif",
  letterSpacing:'0.5px', cursor:'pointer',
  transition:'all 0.25s ease', marginBottom:16,
}
const alreadyRow  = { fontSize:12.5, fontFamily:"'Georgia',serif", textAlign:'center' }
const alreadyLink = { fontStyle:'italic', cursor:'pointer', borderBottom:'1px dotted', paddingBottom:1 }

/* ══════════════════════════════════════════════════════════════════
   ANIMATION CSS
   ══════════════════════════════════════════════════════════════════ */
const splashCss = `
  * { box-sizing:border-box; margin:0; padding:0; }

  @keyframes cblink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes star-tw   { 0%,100%{opacity:.15} 50%{opacity:.75} }
  @keyframes cup-pop   { 0%{opacity:0;transform:scale(.4) translateY(24px)} 65%{transform:scale(1.12) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes brand-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dot-pop   { 0%{opacity:0;transform:scale(0)} 60%{transform:scale(1.2)} 100%{opacity:1;transform:scale(1)} }

  .sstar     { position:absolute; border-radius:50%; background:white; animation:star-tw var(--d,3s) ease-in-out infinite; }
  .cup-out   { opacity:0; transform:scale(.4) translateY(24px); }
  .cup-in    { animation:cup-pop 0.75s cubic-bezier(.34,1.56,.64,1) forwards; }
  .brand-out { opacity:0; transform:translateY(18px); }
  .brand-in  { animation:brand-up 0.65s ease forwards; }
  .dot-pop   { display:inline-block; opacity:0; animation:dot-pop 0.4s ease forwards; }
`

const carouselCss = `
  * { box-sizing:border-box; margin:0; padding:0; }

  .c-out { opacity:0; transform:translateY(18px); transition:opacity .65s ease,transform .65s cubic-bezier(.22,1,.36,1); }
  .c-in  { opacity:1; transform:translateY(0);    transition:opacity .65s ease,transform .65s cubic-bezier(.22,1,.36,1); }
  .no-select { user-select:none; -webkit-user-select:none; }

  @keyframes slide-r { from{opacity:0;transform:translateX(70px) rotate(2.5deg) scale(.96)} to{opacity:1;transform:none} }
  @keyframes slide-l { from{opacity:0;transform:translateX(-70px) rotate(-2.5deg) scale(.96)} to{opacity:1;transform:none} }

  .card-enter-r { animation:slide-r 0.42s cubic-bezier(.22,1,.36,1) forwards; }
  .card-enter-l { animation:slide-l 0.42s cubic-bezier(.22,1,.36,1) forwards; }

  .arr-btn:hover  { opacity:.8; transform:scale(1.1); }
  .arr-btn:active { transform:scale(.94); }

  .cta-btn:hover  { transform:translateY(-2px) scale(1.02); filter:brightness(1.1); }
  .cta-btn:active { transform:translateY(0) scale(.98); }
`