import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import bgImage from '../assets/bookshop.jpg'

/* ── Floating hearts + sparkles canvas ───────────────────────────────────── */
const FloatingElements = () => {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)

    const items = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      type: i % 3 === 0 ? 'heart' : 'spark',
      size: Math.random() * 8 + 4,
      alpha: Math.random() * 0.35 + 0.1,
      speed: Math.random() * 0.5 + 0.2,
      drift: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
      sway: Math.random() * 0.008 + 0.003,
    }))

    const drawHeart = (ctx, x, y, size, alpha) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = `rgba(255,210,160,${alpha})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(x, y + size * 0.3)
      ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.4)
      ctx.bezierCurveTo(x - size, y + size * 0.8, x, y + size * 1.2, x, y + size * 1.4)
      ctx.bezierCurveTo(x, y + size * 1.2, x + size, y + size * 0.8, x + size, y + size * 0.4)
      ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3)
      ctx.stroke()
      ctx.restore()
    }

    const drawSpark = (ctx, x, y, size, alpha) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = `rgba(255,200,100,${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2)
      ctx.fill()
      // small cross sparkle
      ctx.strokeStyle = `rgba(255,220,130,${alpha * 0.7})`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(x - size * 0.6, y); ctx.lineTo(x + size * 0.6, y)
      ctx.moveTo(x, y - size * 0.6); ctx.lineTo(x, y + size * 0.6)
      ctx.stroke()
      ctx.restore()
    }

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      items.forEach(p => {
        p.phase += p.sway
        p.y -= p.speed
        p.x += p.drift + Math.sin(p.phase) * 0.3
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.phase * 2))
        if (p.y < -30) {
          p.y = c.height + 20
          p.x = Math.random() * c.width
        }
        if (p.type === 'heart') drawHeart(ctx, p.x, p.y, p.size, a)
        else drawSpark(ctx, p.x, p.y, p.size, a)
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:3 }} />
}

/* ── Glowing neon book SVG ────────────────────────────────────────────────── */
const GlowBook = () => (
  <svg viewBox="0 0 280 220" width="280" height="220"
    style={{ display:'block', margin:'0 auto', filter:'drop-shadow(0 0 18px rgba(200,140,40,0.6))' }}>
    <defs>
      <radialGradient id="bookGlow" cx="50%" cy="60%" r="55%">
        <stop offset="0%"   stopColor="#ffcc60" stopOpacity="0.5"/>
        <stop offset="50%"  stopColor="#ff8800" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#ff4400" stopOpacity="0"/>
      </radialGradient>
      <filter id="ng"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>

    {/* Ambient glow pool behind book */}
    <ellipse cx="140" cy="160" rx="110" ry="50" fill="url(#bookGlow)" filter="url(#ng)"/>

    {/* Swirl lines emanating from book */}
    <path d="M140 130 Q80 100 40 60 Q20 40 30 20"
      stroke="rgba(200,140,40,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"
      className="swirl"/>
    <path d="M140 130 Q180 90 230 50 Q250 30 245 10"
      stroke="rgba(200,140,40,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"
      className="swirl"/>
    <path d="M120 140 Q70 130 30 120 Q10 115 5 100"
      stroke="rgba(180,120,30,0.18)" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <path d="M160 140 Q210 130 250 115 Q270 108 272 92"
      stroke="rgba(180,120,30,0.18)" strokeWidth="1" fill="none" strokeLinecap="round"/>
    {/* Small trailing dots */}
    {[[50,55],[60,40],[225,48],[238,30],[100,25],[180,22]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="1.5"
        fill="rgba(255,200,80,0.4)" className="sparkdot"/>
    ))}

    {/* Book body — open, perspective view */}
    {/* Left page */}
    <path d="M70 155 Q105 130 140 128 L140 185 Q105 188 70 195 Z"
      fill="none" stroke="rgba(220,170,80,0.9)" strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Left page fill — subtle */}
    <path d="M70 155 Q105 130 140 128 L140 185 Q105 188 70 195 Z"
      fill="rgba(200,150,60,0.08)"/>
    {/* Right page */}
    <path d="M140 128 Q175 130 210 155 L210 195 Q175 188 140 185 Z"
      fill="none" stroke="rgba(220,170,80,0.9)" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M140 128 Q175 130 210 155 L210 195 Q175 188 140 185 Z"
      fill="rgba(200,150,60,0.08)"/>
    {/* Spine */}
    <line x1="140" y1="128" x2="140" y2="185"
      stroke="rgba(240,190,80,0.8)" strokeWidth="2"/>
    {/* Book cover bottom */}
    <path d="M68 195 Q105 190 140 187 Q175 190 212 195 L212 202 Q175 198 140 195 Q105 198 68 202 Z"
      fill="rgba(160,100,20,0.4)" stroke="rgba(200,140,40,0.5)" strokeWidth="1"/>
    {/* Page lines on left */}
    {[138,145,152,159,166].map((y,i) => (
      <line key={i} x1={82+i*2} y1={y} x2={136} y2={y-4}
        stroke="rgba(220,180,80,0.2)" strokeWidth="0.7"/>
    ))}
    {/* Page lines on right */}
    {[138,145,152,159,166].map((y,i) => (
      <line key={i} x1={144} y1={y-4} x2={198-i*2} y2={y}
        stroke="rgba(220,180,80,0.2)" strokeWidth="0.7"/>
    ))}

    {/* Glow core at spine base */}
    <ellipse cx="140" cy="186" rx="12" ry="4"
      fill="rgba(255,180,40,0.5)" filter="url(#ng)"/>
  </svg>
)

const QUOTES = [
  { q: 'A reader lives a thousand lives before he dies.', a: 'G.R.R. Martin' },
  { q: 'There is no friend as loyal as a book.', a: 'Hemingway' },
  { q: 'Not all those who wander are lost.', a: 'Tolkien' },
  { q: 'She read books as one would breathe air.', a: 'Annie Dillard' },
  { q: 'Late night reading is its own kind of magic.', a: 'Anon' },
]

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await axios.post('https://brewreads-api.onrender.com/api/auth/login', form)
      loginUser(res.data.user, res.data.token)
      const pendingMood = sessionStorage.getItem('brewreads_pending_mood')
      navigate(pendingMood ? '/mood-entry' : '/mood')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div style={page}>
      <style>{css}</style>

      {/* ── Real photo background ── */}
      <div style={{ ...photoBg, backgroundImage:`url(${bgImage})` }}/>

      {/* Dark overlay — deepens the photo, makes form readable */}
      <div style={overlay}/>

      {/* Warm vignette from centre */}
      <div style={vignette}/>

      {/* Floating hearts + sparks */}
      <FloatingElements />

      {/* ── Main content ── */}
      <div className={visible ? 'ui-in' : 'ui-out'} style={content}>

        {/* Brand */}
        <div style={brandRow}>
          <span style={brandCup}>☕</span>
          <span style={brandName}>BrewReads</span>
        </div>
        <p style={brandSub}>a quiet place for restless readers</p>

        {/* Glowing book illustration */}
        <div className="book-float" style={{ marginBottom: 8 }}>
          <GlowBook />
        </div>

        {/* Frosted transparent card — shows bookshop through it */}
        <div style={card}>
          <div style={cardShine}/>

          <h2 style={cardTitle}>welcome back</h2>
          <p style={cardSub}>your shelf is waiting ✦</p>

          {error && <div className="eshake" style={errBox}>{error}</div>}

          <form onSubmit={submit} style={{ width:'100%' }}>
            {/* Underline input fields */}
            <div style={fieldWrap}>
              <span style={fieldIcon}>✉</span>
              <div style={{ flex:1 }}>
                <input className="fi" style={fieldInp} type="email"
                  placeholder="your email"
                  value={form.email}
                  onChange={e => setForm(f=>({...f,email:e.target.value}))}
                  required/>
                <div className="fline" style={fieldLine}/>
              </div>
            </div>

            <div style={{ ...fieldWrap, marginTop:20 }}>
              <span style={fieldIcon}>🔒</span>
              <div style={{ flex:1 }}>
                <input className="fi" style={fieldInp} type="password"
                  placeholder="password"
                  value={form.password}
                  onChange={e => setForm(f=>({...f,password:e.target.value}))}
                  required/>
                <div className="fline" style={fieldLine}/>
              </div>
            </div>

            {/* Two pill buttons */}
            <div style={btnRow}>
              <Link to="/signup" style={btnSignup} className="bsignup">
                Sign up
              </Link>
              <button type="submit" disabled={loading}
                style={{...btnSignin, ...(loading?{opacity:.55,cursor:'not-allowed'}:{})}}
                className="bsignin">
                {loading ? <span className="blink">…</span> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>

        {/* Quote */}
        <p style={quoteEl}>
          "{quote.q}"
          <span style={quoteAuth}> — {quote.a}</span>
        </p>

      </div>
    </div>
  )
}

/* ── Styles ──────────────────────────────────────────────────────────────────── */
const page = {
  minHeight:'100vh', position:'relative', overflow:'hidden',
  display:'flex', alignItems:'center', justifyContent:'center',
  fontFamily:"'Georgia',serif",
}

/* Real photo — covers full screen */
const photoBg = {
  position:'fixed', inset:0, zIndex:0,
  backgroundSize:'cover',
  backgroundPosition:'center top',
  backgroundRepeat:'no-repeat',
  filter:'brightness(0.55) saturate(0.85)',
}

/* Dark overlay to deepen + unify */
const overlay = {
  position:'fixed', inset:0, zIndex:1, pointerEvents:'none',
  background:'rgba(8,4,0,0.45)',
}

/* Warm centre vignette */
const vignette = {
  position:'fixed', inset:0, zIndex:1, pointerEvents:'none',
  background:`
    radial-gradient(ellipse 70% 50% at 50% 40%, rgba(180,100,20,0.12) 0%, transparent 65%),
    radial-gradient(ellipse 100% 40% at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 70%)
  `,
}

const content = {
  position:'relative', zIndex:4,
  width:'100%', maxWidth:400,
  display:'flex', flexDirection:'column', alignItems:'center',
  padding:'32px 24px 40px',
}

const brandRow = { display:'flex', alignItems:'center', gap:10, marginBottom:4 }
const brandCup  = { fontSize:26 }
const brandName = {
  fontSize:28, fontWeight:700, letterSpacing:'2.5px',
  color:'#f5e6c0',
  fontFamily:"'Georgia',serif",
  textShadow:'0 2px 24px rgba(220,150,40,0.6)',
}
const brandSub = {
  fontSize:11, color:'rgba(220,185,120,0.5)',
  fontStyle:'italic', letterSpacing:'1.8px', marginBottom:4,
}

/* Frosted card — peach-warm tint, translucent */
const card = {
  width:'100%',
  background:'rgba(255,235,200,0.10)',
  backdropFilter:'blur(20px)',
  WebkitBackdropFilter:'blur(20px)',
  borderRadius:24,
  padding:'28px 30px 24px',
  border:'1px solid rgba(220,175,100,0.2)',
  boxShadow:`
    0 2px 0 rgba(255,255,255,0.06) inset,
    0 8px 40px rgba(0,0,0,0.4),
    0 0 60px rgba(180,110,20,0.08)
  `,
  marginBottom:20,
  position:'relative', overflow:'hidden',
}
const cardShine = {
  position:'absolute', top:0, left:'10%', right:'10%', height:1,
  background:'linear-gradient(90deg, transparent, rgba(220,175,100,0.45), transparent)',
}
const cardTitle = {
  fontSize:20, fontWeight:700, color:'#f0e0c0',
  margin:'0 0 3px', fontFamily:"'Georgia',serif",
  textShadow:'0 1px 8px rgba(0,0,0,0.4)',
}
const cardSub = {
  fontSize:12, color:'rgba(220,185,120,0.5)',
  fontStyle:'italic', margin:'0 0 22px',
  fontFamily:"'Georgia',serif",
}
const errBox = {
  background:'rgba(180,50,50,0.1)', border:'1px solid rgba(180,50,50,0.22)',
  borderRadius:10, padding:'9px 13px', fontSize:12.5,
  color:'#f09090', marginBottom:14, fontFamily:"'Georgia',serif",
}

const fieldWrap = {
  width:'100%', display:'flex', alignItems:'flex-end', gap:12,
}
const fieldIcon = { fontSize:14, opacity:0.38, paddingBottom:6 }
const fieldInp  = {
  width:'100%', padding:'6px 0',
  background:'transparent', border:'none', outline:'none',
  fontSize:14.5, color:'#f0e0c0',
  fontFamily:"'Georgia',serif",
}
const fieldLine = {
  height:1, width:'100%',
  background:'rgba(210,170,90,0.3)',
  transition:'background 0.22s ease',
}

const btnRow = {
  display:'flex', gap:14, marginTop:28, width:'100%',
}
const btnSignup = {
  flex:1, padding:'12px 0',
  background:'transparent',
  border:'1px solid rgba(210,170,80,0.35)',
  borderRadius:50, fontSize:13.5, fontWeight:600,
  color:'rgba(230,190,110,0.8)',
  fontFamily:"'Georgia',serif",
  textAlign:'center', textDecoration:'none',
  letterSpacing:'0.5px',
  transition:'all 0.22s ease',
}
const btnSignin = {
  flex:1, padding:'12px 0',
  background:'linear-gradient(135deg, #7a4808 0%, #b06c10 60%, #8a5008 100%)',
  border:'none', borderRadius:50,
  fontSize:13.5, fontWeight:700,
  color:'#fff8e8',
  fontFamily:"'Georgia',serif",
  letterSpacing:'0.5px', cursor:'pointer',
  boxShadow:'0 4px 22px rgba(150,90,10,0.45)',
  transition:'all 0.22s ease',
}

const quoteEl = {
  fontSize:11.5, color:'rgba(210,175,110,0.38)',
  fontStyle:'italic', textAlign:'center',
  lineHeight:1.7, maxWidth:300,
  fontFamily:"'Georgia',serif",
}
const quoteAuth = {
  display:'block', marginTop:4, fontSize:10.5,
  color:'rgba(190,155,90,0.28)',
  fontStyle:'normal', letterSpacing:'0.5px',
}

/* ── Animations ──────────────────────────────────────────────────────────────── */
const css = `
  * { box-sizing:border-box; margin:0; padding:0; }

  .ui-out { opacity:0; transform:translateY(18px); transition:opacity .85s ease,transform .85s cubic-bezier(.22,1,.36,1); }
  .ui-in  { opacity:1; transform:translateY(0);    transition:opacity .85s ease,transform .85s cubic-bezier(.22,1,.36,1); }

  @keyframes book-float {
    0%,100% { transform:translateY(0) rotate(-0.5deg); }
    50%      { transform:translateY(-8px) rotate(0.5deg); }
  }
  @keyframes swirl-pulse {
    0%,100% { opacity:0.6; stroke-dashoffset:0; }
    50%      { opacity:1; stroke-dashoffset:20; }
  }
  @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes eshake {
    15%{transform:translateX(-5px)} 35%{transform:translateX(5px)}
    55%{transform:translateX(-3px)} 75%{transform:translateX(3px)} 100%{transform:none}
  }
  @keyframes sparkpulse {
    0%,100%{opacity:0.4; r:1.5} 50%{opacity:0.9; r:2.5}
  }

  .book-float { animation: book-float 5s ease-in-out infinite; }
  .swirl      { stroke-dasharray:30; animation: swirl-pulse 3s ease-in-out infinite; }
  .sparkdot   { animation: sparkpulse 2.5s ease-in-out infinite; }
  .blink      { animation: blink 1.5s ease-in-out infinite; }
  .eshake     { animation: eshake .45s ease; }

  .fi::placeholder { color:rgba(200,160,80,0.3); }
  .fi { caret-color:#d4a040; }
  .fi:focus ~ .fline { background: rgba(220,175,80,0.65) !important; }

  .bsignup:hover {
    background: rgba(200,160,60,0.1) !important;
    border-color: rgba(220,180,80,0.55) !important;
    color: rgba(245,205,120,0.95) !important;
  }
  .bsignin:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(150,90,10,0.6) !important;
    background: linear-gradient(135deg,#8a5210 0%,#c07818 100%) !important;
  }
  .bsignin:active:not(:disabled) { transform:translateY(0); }
`