import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import bgImage from '../assets/bookshop.jpg'

/* ── Floating hearts + sparks — same as Login ─────────────────── */
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
      ctx.save(); ctx.globalAlpha = alpha
      ctx.strokeStyle = `rgba(255,210,160,${alpha})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(x, y + size * 0.3)
      ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.4)
      ctx.bezierCurveTo(x - size, y + size * 0.8, x, y + size * 1.2, x, y + size * 1.4)
      ctx.bezierCurveTo(x, y + size * 1.2, x + size, y + size * 0.8, x + size, y + size * 0.4)
      ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3)
      ctx.stroke(); ctx.restore()
    }

    const drawSpark = (ctx, x, y, size, alpha) => {
      ctx.save(); ctx.globalAlpha = alpha
      ctx.fillStyle = `rgba(255,200,100,${alpha})`
      ctx.beginPath(); ctx.arc(x, y, size * 0.3, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = `rgba(255,220,130,${alpha * 0.7})`
      ctx.lineWidth = 0.8; ctx.beginPath()
      ctx.moveTo(x - size * 0.6, y); ctx.lineTo(x + size * 0.6, y)
      ctx.moveTo(x, y - size * 0.6); ctx.lineTo(x, y + size * 0.6)
      ctx.stroke(); ctx.restore()
    }

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      items.forEach(p => {
        p.phase += p.sway; p.y -= p.speed
        p.x += p.drift + Math.sin(p.phase) * 0.3
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.phase * 2))
        if (p.y < -30) { p.y = c.height + 20; p.x = Math.random() * c.width }
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

/* ── Password strength meter ──────────────────────────────────── */
const StrengthMeter = ({ password, theme }) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ]
  const score  = checks.filter(Boolean).length
  const colors = ['', '#ef4444', '#f59e0b', '#84cc16', '#22c55e']
  const labels = ['', 'weak', 'fair', 'good', 'strong']
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display:'flex', gap:4, marginBottom:3 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex:1, height:2.5, borderRadius:2,
            background: i <= score ? colors[score] : 'rgba(200,160,80,0.15)',
            transition: 'all 0.3s ease',
          }}/>
        ))}
      </div>
      <span style={{ fontSize:10.5, color:colors[score], letterSpacing:'1px', fontFamily:"'Georgia',serif" }}>
        {labels[score]}
      </span>
    </div>
  )
}

/* ── Glowing book SVG — same as Login ────────────────────────── */
const GlowBook = () => (
  <svg viewBox="0 0 280 180" width="240" height="154"
    style={{ display:'block', margin:'0 auto', filter:'drop-shadow(0 0 16px rgba(200,140,40,0.55))' }}>
    <defs>
      <radialGradient id="bGlow" cx="50%" cy="60%" r="55%">
        <stop offset="0%"   stopColor="#ffcc60" stopOpacity="0.45"/>
        <stop offset="100%" stopColor="#ff4400" stopOpacity="0"/>
      </radialGradient>
      <filter id="ng2"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <ellipse cx="140" cy="140" rx="100" ry="42" fill="url(#bGlow)" filter="url(#ng2)"/>
    <path d="M140 110 Q85 82 42 48 Q22 30 32 12" stroke="rgba(200,140,40,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M140 110 Q185 75 228 42 Q248 22 243 5"  stroke="rgba(200,140,40,0.18)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {[[52,48],[62,33],[224,40],[236,22],[102,18],[178,15]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,200,80,0.38)" className="sparkdot"/>
    ))}
    <path d="M72 135 Q107 112 140 110 L140 165 Q107 168 72 175 Z"
      fill="none" stroke="rgba(220,170,80,0.88)" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M72 135 Q107 112 140 110 L140 165 Q107 168 72 175 Z" fill="rgba(200,150,60,0.07)"/>
    <path d="M140 110 Q173 112 208 135 L208 175 Q173 168 140 165 Z"
      fill="none" stroke="rgba(220,170,80,0.88)" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M140 110 Q173 112 208 135 L208 175 Q173 168 140 165 Z" fill="rgba(200,150,60,0.07)"/>
    <line x1="140" y1="110" x2="140" y2="165" stroke="rgba(240,190,80,0.75)" strokeWidth="2"/>
    <ellipse cx="140" cy="166" rx="11" ry="3.5" fill="rgba(255,180,40,0.45)" filter="url(#ng2)"/>
  </svg>
)

const QUOTES = [
  { q: 'Not all those who wander are lost.', a: 'Tolkien' },
  { q: 'A reader lives a thousand lives before he dies.', a: 'G.R.R. Martin' },
  { q: 'One must always be careful of books.', a: 'Cassandra Clare' },
  { q: 'She read books as one would breathe air.', a: 'Annie Dillard' },
]

export default function Signup() {
  const [form, setForm]     = useState({ name:'', email:'', password:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await axios.post('http://localhost:8000/api/auth/signup', form)
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

      {/* Real bookshop photo background */}
      <div style={{ ...photoBg, backgroundImage:`url(${bgImage})` }}/>
      <div style={overlay}/>
      <div style={vignette}/>
      <FloatingElements />

      <div className={visible ? 'ui-in' : 'ui-out'} style={ui}>

        {/* Brand */}
        <div style={brandRow}>
          <span style={brandCup}>☕</span>
          <span style={brandName}>BrewReads</span>
        </div>
        <p style={brandSub}>your story starts here</p>

        {/* Glowing book illustration */}
        <div className="book-float" style={{ marginBottom:6 }}>
          <GlowBook />
        </div>

        {/* Frosted card */}
        <div style={card}>
          <div style={cardShine}/>

          <h2 style={cardTitle}>create your nook</h2>
          <p style={cardSub}>nine moods · endless pages · one perfect read ✦</p>

          {error && <div className="eshake" style={errBox}>{error}</div>}

          <form onSubmit={submit} style={{ width:'100%' }}>
            {/* Name */}
            <div style={fieldWrap} className="inp-wrap">
              <span style={fIcon}>✦</span>
              <div style={{ flex:1 }}>
                <input className="inp" style={inp} type="text"
                  placeholder="what shall we call you?"
                  value={form.name}
                  onChange={e => setForm(f=>({...f,name:e.target.value}))}
                  required/>
                <div style={fLine} className="fline"/>
              </div>
            </div>

            {/* Email */}
            <div style={{ ...fieldWrap, marginTop:18 }} className="inp-wrap">
              <span style={fIcon}>✉</span>
              <div style={{ flex:1 }}>
                <input className="inp" style={inp} type="email"
                  placeholder="your email"
                  value={form.email}
                  onChange={e => setForm(f=>({...f,email:e.target.value}))}
                  required/>
                <div style={fLine} className="fline"/>
              </div>
            </div>

            {/* Password */}
            <div style={{ ...fieldWrap, marginTop:18 }} className="inp-wrap">
              <span style={fIcon}>🔒</span>
              <div style={{ flex:1 }}>
                <input className="inp" style={inp} type="password"
                  placeholder="create a password"
                  value={form.password}
                  onChange={e => setForm(f=>({...f,password:e.target.value}))}
                  required/>
                <div style={fLine} className="fline"/>
                <StrengthMeter password={form.password}/>
              </div>
            </div>

            {/* Buttons */}
            <div style={btnRow}>
              <Link to="/login" style={btnLeft} className="bleft">
                Sign in
              </Link>
              <button type="submit" disabled={loading}
                style={{...btnRight,...(loading?{opacity:.55,cursor:'not-allowed'}:{})}}
                className="bright">
                {loading ? <span className="blink">creating…</span> : 'Begin →'}
              </button>
            </div>
          </form>
        </div>

        {/* Quote */}
        <p style={quoteEl}>
          "{quote.q}"
          <span style={quoteAuth}> — {quote.a}</span>
        </p>

        {/* Mood teaser */}
        <div style={moodTeaser}>
          {['😊','🌙','💖','💭','😤','😌','😢','🎯','😵'].map((e,i) => (
            <span key={i} className="mdot" style={mdot}>{e}</span>
          ))}
        </div>
        <p style={moodLabel}>9 moods waiting for you</p>

      </div>
    </div>
  )
}

/* ── Styles — identical palette to Login ─────────────────────── */
const page = {
  minHeight:'100vh', position:'relative', overflow:'hidden',
  display:'flex', alignItems:'center', justifyContent:'center',
  fontFamily:"'Georgia',serif",
}
const photoBg = {
  position:'fixed', inset:0, zIndex:0,
  backgroundSize:'cover', backgroundPosition:'center top',
  backgroundRepeat:'no-repeat',
  filter:'brightness(0.55) saturate(0.85)',
}
const overlay = {
  position:'fixed', inset:0, zIndex:1, pointerEvents:'none',
  background:'rgba(8,4,0,0.45)',
}
const vignette = {
  position:'fixed', inset:0, zIndex:1, pointerEvents:'none',
  background:`
    radial-gradient(ellipse 70% 50% at 50% 40%, rgba(180,100,20,0.12) 0%, transparent 65%),
    radial-gradient(ellipse 100% 40% at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 70%)
  `,
}
const ui = {
  position:'relative', zIndex:4,
  width:'100%', maxWidth:400,
  display:'flex', flexDirection:'column', alignItems:'center',
  padding:'32px 28px 40px',
}
const brandRow = { display:'flex', alignItems:'center', gap:10, marginBottom:4 }
const brandCup  = { fontSize:24 }
const brandName = {
  fontSize:26, fontWeight:700, letterSpacing:'2.5px',
  color:'#f5e6c0', fontFamily:"'Georgia',serif",
  textShadow:'0 2px 24px rgba(220,150,40,0.6)',
}
const brandSub = {
  fontSize:11, color:'rgba(220,185,120,0.5)',
  fontStyle:'italic', letterSpacing:'1.5px', marginBottom:4,
}
const card = {
  width:'100%',
  background:'rgba(255,235,200,0.10)',
  backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
  borderRadius:24, padding:'28px 30px 24px',
  border:'1px solid rgba(220,175,100,0.2)',
  boxShadow:'0 2px 0 rgba(255,255,255,0.06) inset, 0 8px 40px rgba(0,0,0,0.4)',
  marginBottom:20, position:'relative', overflow:'hidden',
}
const cardShine = {
  position:'absolute', top:0, left:'10%', right:'10%', height:1,
  background:'linear-gradient(90deg, transparent, rgba(220,175,100,0.45), transparent)',
}
const cardTitle = { fontSize:19, fontWeight:700, color:'#f0e0c0', margin:'0 0 4px', fontFamily:"'Georgia',serif" }
const cardSub   = { fontSize:11.5, color:'rgba(220,185,120,0.5)', fontStyle:'italic', margin:'0 0 22px', fontFamily:"'Georgia',serif" }
const errBox    = {
  background:'rgba(200,60,60,0.08)', border:'1px solid rgba(200,60,60,0.2)',
  borderRadius:10, padding:'9px 14px', fontSize:12.5, color:'#f09090',
  marginBottom:14, textAlign:'center', fontFamily:"'Georgia',serif",
}
const fieldWrap = { width:'100%', display:'flex', alignItems:'flex-end', gap:12 }
const fIcon     = { fontSize:13, opacity:0.35, paddingBottom:6 }
const inp       = {
  width:'100%', padding:'6px 0', background:'transparent',
  border:'none', outline:'none', fontSize:14.5, color:'#f0e0c0',
  fontFamily:"'Georgia',serif",
}
const fLine     = { height:1, width:'100%', background:'rgba(210,170,90,0.3)', transition:'background 0.22s ease' }
const btnRow    = { display:'flex', gap:14, marginTop:28, width:'100%' }
const btnLeft   = {
  flex:1, padding:'12px 0', background:'transparent',
  border:'1px solid rgba(210,170,80,0.35)', borderRadius:8,
  fontSize:13.5, fontWeight:600, color:'rgba(230,190,110,0.8)',
  fontFamily:"'Georgia',serif", textAlign:'center', textDecoration:'none',
  letterSpacing:'0.5px', transition:'all 0.22s ease',
}
const btnRight  = {
  flex:1, padding:'12px 0',
  background:'linear-gradient(135deg, #7a4808 0%, #b06c10 100%)',
  border:'none', borderRadius:8, fontSize:13.5, fontWeight:700,
  color:'#fff8e8', fontFamily:"'Georgia',serif",
  letterSpacing:'0.5px', cursor:'pointer',
  boxShadow:'0 4px 24px rgba(150,90,10,0.4)', transition:'all 0.22s ease',
}
const quoteEl   = {
  fontSize:11.5, color:'rgba(210,175,110,0.38)',
  fontStyle:'italic', textAlign:'center',
  lineHeight:1.7, marginBottom:16, maxWidth:300,
  fontFamily:"'Georgia',serif",
}
const quoteAuth = { display:'block', marginTop:4, fontSize:10.5, color:'rgba(190,155,90,0.28)', fontStyle:'normal', letterSpacing:'0.5px' }
const moodTeaser= { display:'flex', gap:5, marginBottom:4 }
const mdot      = { fontSize:14, opacity:0.3 }
const moodLabel = { fontSize:9.5, color:'rgba(180,140,70,0.25)', letterSpacing:'2px', fontFamily:"'Georgia',serif" }

const css = `
  * { box-sizing:border-box; margin:0; padding:0; }

  .ui-out { opacity:0; transform:translateY(18px); transition:opacity .9s ease,transform .9s cubic-bezier(.22,1,.36,1); }
  .ui-in  { opacity:1; transform:translateY(0);    transition:opacity .9s ease,transform .9s cubic-bezier(.22,1,.36,1); }

  @keyframes book-float { 0%,100%{transform:translateY(0) rotate(-.5deg)} 50%{transform:translateY(-8px) rotate(.5deg)} }
  @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes eshake     { 15%{transform:translateX(-5px)} 35%{transform:translateX(5px)} 55%{transform:translateX(-3px)} 75%{transform:translateX(3px)} 100%{transform:none} }
  @keyframes sparkpulse { 0%,100%{opacity:.4} 50%{opacity:.9} }

  .book-float { animation:book-float 5s ease-in-out infinite; }
  .blink      { animation:blink 1.5s ease-in-out infinite; }
  .eshake     { animation:eshake .45s ease; }
  .sparkdot   { animation:sparkpulse 2.5s ease-in-out infinite; }

  .inp::placeholder { color:rgba(200,160,80,0.28); }
  .inp { caret-color:#d4a040; }
  .inp-wrap:focus-within .fline { background:rgba(220,175,80,0.65) !important; }

  .bleft:hover  { background:rgba(200,160,60,0.1) !important; border-color:rgba(220,180,80,0.55) !important; }
  .bright:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(150,90,10,0.55) !important; background:linear-gradient(135deg,#8a5210 0%,#c07818 100%) !important; }
  .bright:active:not(:disabled) { transform:translateY(0); }

  .mdot { transition:opacity .2s,transform .2s; cursor:default; }
  .mdot:hover { opacity:.85 !important; transform:scale(1.3) translateY(-2px); }
`