import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMood } from '../context/MoodContext'
import { THEMES, MOOD_ORDER } from '../styles/themes'
import MoodEntry from './MoodEntry'
import CoffeeButton from '../components/CoffeeButton'
import SpotifyPlayer from '../components/SpotifyPlayer'

/* ── Particle canvas per mood ─────────────────────────────────── */
const MoodParticles = ({ type, color, active }) => {
  const ref  = useRef(null)
  const raf  = useRef(null)

  useEffect(() => {
    if (!active) return
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    c.width  = c.offsetWidth
    c.height = c.offsetHeight
    const W = c.width, H = c.height
    const [r,g,b] = parseColor(color)

    const pts = Array.from({ length: 25 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 3 + 1,
      alpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.003,
      vx: (Math.random() - 0.5) * 0.3,
      vy: type === 'rain' ? Math.random() * 3 + 2 : -(Math.random() * 0.4 + 0.1),
      rot: Math.random() * Math.PI * 2,
      rotS: (Math.random() - 0.5) * 0.02,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        p.phase += p.speed; p.x += p.vx; p.y += p.vy; p.rot += p.rotS
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.phase))
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W }
        if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W }

        if (type === 'rain') {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 1, p.y + 12)
          ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.4})`
          ctx.lineWidth = 0.7; ctx.stroke()
        } else if (type === 'petals' || type === 'rosepetals') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
          ctx.beginPath()
          ctx.ellipse(0, 0, p.r * 2, p.r, 0, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`
          ctx.fill(); ctx.restore()
        } else {
          const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
          g2.addColorStop(0, `rgba(${r},${g},${b},${a})`)
          g2.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
          ctx.fillStyle = g2; ctx.fill()
        }
      })
      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf.current)
  }, [active, type, color])

  return (
    <canvas ref={ref} style={{
      position:'absolute', inset:0,
      width:'100%', height:'100%',
      pointerEvents:'none', borderRadius:20,
    }}/>
  )
}

function parseColor(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  return m ? [m[1], m[2], m[3]] : [255,255,255]
}

/* ── Individual Mood Card ─────────────────────────────────────── */
const MoodCard = ({ mood, theme, selected, hovered, onClick, onHover, index }) => (
  <div
    className={`mc ${selected?'mc-sel':''} ${hovered?'mc-hov':''}`}
    style={{
      ...cardBase,
      background: selected||hovered ? theme.card : 'rgba(255,255,255,0.02)',
      border: `1px solid ${selected ? theme.primary+'66' : hovered ? theme.primary+'33' : 'rgba(255,255,255,0.06)'}`,
      boxShadow: selected
        ? `0 0 0 1px ${theme.primary}33, 0 12px 48px rgba(0,0,0,0.55), 0 0 30px ${theme.glow}`
        : hovered ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${theme.glow}` : '0 4px 20px rgba(0,0,0,0.3)',
      transform: selected ? 'scale(1.04) translateY(-4px)' : hovered ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
      animationDelay: `${index * 0.07}s`,
      position:'relative', overflow:'hidden',
    }}
    onClick={() => onClick(mood)}
    onMouseEnter={() => onHover(mood)}
    onMouseLeave={() => onHover(null)}
  >
    <MoodParticles type={theme.particles} color={theme.particleColor} active={selected||hovered}/>

    {(selected||hovered) && (
      <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1,
        background:`linear-gradient(90deg,transparent,${theme.primary}88,transparent)` }}/>
    )}

    <div style={{ position:'relative', zIndex:1 }}>
      <span style={{ fontSize:30, display:'block', marginBottom:6,
        filter: selected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none' }}>
        {theme.emoji}
      </span>
      <h3 style={{ ...cardName, color: selected||hovered ? theme.text : 'rgba(255,255,255,0.5)',
        fontFamily: theme.font }}>
        {theme.name}
      </h3>
      <p style={{ ...cardTag, color: selected||hovered ? theme.subtext : 'rgba(255,255,255,0.22)' }}>
        {theme.tagline}
      </p>

      {selected && (
        <div style={{ position:'absolute', top:-4, right:-4, width:22, height:22,
          borderRadius:'50%', background:theme.primary,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, color:'#fff', boxShadow:`0 0 12px ${theme.primary}88` }}>
          ✓
        </div>
      )}
    </div>
  </div>
)

const cardBase = {
  borderRadius:20, padding:'20px 16px 16px',
  cursor:'pointer', transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  userSelect:'none', animation:'cardIn 0.6s ease both',
}
const cardName = { fontSize:14, fontWeight:700, margin:'0 0 4px', letterSpacing:'0.3px' }
const cardTag  = { fontSize:10.5, fontFamily:"'Georgia',serif", fontStyle:'italic', lineHeight:1.5, margin:0 }

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function MoodSelect() {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered]   = useState(null)
  const [mounted, setMounted]   = useState(false)
  const [showEntry, setShowEntry] = useState(false)
  const { user } = useAuth()
  const navigate  = useNavigate()

  const active = selected || hovered
  const activeTheme = active ? THEMES[active] : null

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const handleSelect = (mood) => {
    setSelected(prev => prev === mood ? null : mood)
  }

  const handleConfirm = () => {
    if (!selected) return
    setShowEntry(true)
  }

  const handleEntryComplete = () => {
    navigate('/describe')
  }

  const firstName = user?.name?.split(' ')[0] || 'Reader'

  return (
    <div style={{ minHeight:'100vh', position:'relative', overflow:'hidden' }}>
      <style>{css}</style>

      {/* Dynamic background */}
      <div style={{
        position:'fixed', inset:0, zIndex:0,
        background: active ? THEMES[active].bg : 'linear-gradient(160deg,#0a0a0c 0%,#0f0d12 50%,#080808 100%)',
        transition:'background 0.9s ease',
      }}/>

      {/* Grain */}
      <div style={grain}/>

      {/* Mood glow */}
      {activeTheme && (
        <div style={{
          position:'fixed', width:600, height:600, borderRadius:'50%',
          top:'5%', left:'50%', transform:'translateX(-50%)',
          background:`radial-gradient(circle,${activeTheme.glow} 0%,transparent 70%)`,
          transition:'background 0.8s ease', pointerEvents:'none', zIndex:0,
        }}/>
      )}

      {/* Content */}
      <div style={{
        ...pageWrap,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(20px)',
        transition:'all 0.7s ease',
      }}>

        {/* Header */}
        <div style={header}>
          <div className="logo-float" style={logoRow}>
            <span style={{ fontSize:26 }}>☕</span>
            <span style={{
              ...logoText,
              background: activeTheme
                ? `linear-gradient(135deg,${activeTheme.primary},${activeTheme.secondary})`
                : 'linear-gradient(135deg,#fde68a,#f59e0b)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              transition:'background 0.5s ease',
            }}>BrewReads</span>
          </div>

          <h1 style={{
            ...headline,
            color: activeTheme ? activeTheme.text : '#e8e8e8',
            transition:'color 0.5s ease',
          }}>
            Good {timeOfDay()}, {firstName}.
          </h1>

          <p style={{
            ...subline,
            color: activeTheme ? activeTheme.subtext : 'rgba(255,255,255,0.35)',
            transition:'color 0.5s ease',
            minHeight: 48,
          }}>
            {active ? THEMES[active].authorVoice : 'How are you feeling right now? Let your mood lead you to your next story.'}
          </p>

          {/* Accent line */}
          <div style={{
            height:1, width: active ? 80 : 40,
            background: activeTheme ? activeTheme.primary : 'rgba(255,255,255,0.1)',
            margin:'16px auto 0', transition:'all 0.4s ease', borderRadius:1,
          }}/>
        </div>

        {/* Mood grid */}
        <div style={grid}>
          {MOOD_ORDER.map((mood, i) => (
            <MoodCard
              key={mood} mood={mood} theme={THEMES[mood]}
              selected={selected === mood} hovered={hovered === mood}
              onClick={handleSelect} onHover={setHovered} index={i}
            />
          ))}
        </div>

        {/* CTA */}
        <div style={{
          ...ctaWrap,
          opacity: selected ? 1 : 0,
          transform: selected ? 'translateY(0)' : 'translateY(12px)',
          transition:'all 0.4s ease',
          pointerEvents: selected ? 'auto' : 'none',
        }}>
          {selected && THEMES[selected] && (
            <>
              <p style={{ ...ctaHint, color: THEMES[selected].subtext }}>
                {THEMES[selected].emoji} {THEMES[selected].name} — {THEMES[selected].tagline}
              </p>
              <button
                style={{
                  ...ctaBtn,
                  background: THEMES[selected].btnBg,
                  color: THEMES[selected].btnText,
                  boxShadow: `0 8px 32px ${THEMES[selected].glow}`,
                }}
                className="cta-btn"
                onClick={handleConfirm}
              >
                Enter {THEMES[selected].name} world →
              </button>
            </>
          )}
        </div>

        <p style={footer}>✦ &nbsp;9 moods &nbsp;·&nbsp; infinite stories &nbsp;·&nbsp; one perfect read</p>
      </div>

      {/* MoodEntry overlay */}
      {showEntry && selected && (
        <MoodEntry mood={selected} onComplete={handleEntryComplete}/>
      )}

      {/* Coffee button */}
      <CoffeeButton mood={selected || 'cozy'} />

      {/* Spotify player */}
      <SpotifyPlayer mood={selected || 'cozy'} />
    </div>
  )
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'night'
}

const grain = {
  position:'fixed', inset:0, pointerEvents:'none', zIndex:1,
  backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
}
const pageWrap = {
  position:'relative', zIndex:2,
  maxWidth:860, margin:'0 auto',
  padding:'36px 24px 60px',
  display:'flex', flexDirection:'column', alignItems:'center',
}
const header = { textAlign:'center', marginBottom:32, width:'100%' }
const logoRow = { display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:18 }
const logoText= { fontSize:24, fontWeight:800, fontFamily:"'Georgia',serif", letterSpacing:'1.5px' }
const headline= { fontSize:'clamp(20px,4vw,30px)', fontWeight:700, fontFamily:"'Georgia',serif", margin:'0 0 10px', letterSpacing:'0.5px' }
const subline = { fontSize:13.5, fontFamily:"'Georgia',serif", fontStyle:'italic', lineHeight:1.7, maxWidth:460, margin:'0 auto' }
const grid    = { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, width:'100%', marginBottom:28 }
const ctaWrap = { display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:28 }
const ctaHint = { fontSize:12, fontFamily:"'Georgia',serif", fontStyle:'italic', letterSpacing:'0.8px', margin:0 }
const ctaBtn  = { padding:'14px 36px', border:'none', borderRadius:50, fontSize:14.5, fontWeight:700, fontFamily:"'Georgia',serif", cursor:'pointer', letterSpacing:'0.5px', transition:'all 0.25s ease' }
const footer  = { fontSize:10.5, color:'rgba(255,255,255,0.15)', fontFamily:"'Georgia',serif", letterSpacing:'2px', textAlign:'center' }

const css = `
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes logo-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .logo-float { animation:logo-float 4s ease-in-out infinite; }
  .mc { transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .cta-btn:hover { transform:translateY(-3px) scale(1.03); filter:brightness(1.1); }
  .cta-btn:active { transform:translateY(0) scale(0.98); }
  @media(max-width:640px) { div[style*="repeat(3,1fr)"] { grid-template-columns:repeat(2,1fr) !important; } }
  @media(max-width:400px)  { div[style*="repeat(3,1fr)"] { grid-template-columns:1fr !important; } }
`