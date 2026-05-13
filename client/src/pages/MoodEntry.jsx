import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEMES } from '../styles/themes'
import { useMood } from '../context/MoodContext'
 
export default function MoodEntry({ mood, onComplete }) {
  const theme    = THEMES[mood] || THEMES.cozy
  const navigate = useNavigate()
  const { setMood, setMusicEnabled } = useMood()
 
  const [phase, setPhase]   = useState('bloom')   // bloom → message → music → exit
  const [lines, setLines]   = useState([])         // entry message lines revealed one by one
  const [musicChosen, setMusicChosen] = useState(false)
 
  // Split entry message into lines
  const messageLines = (theme.entryMessage || '').split('\n').filter(line => line !== undefined)
 
  // Phase timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('message'), 800)
    return () => clearTimeout(t1)
  }, [])
 
  // Reveal lines one by one
  useEffect(() => {
    if (phase !== 'message') return
    let i = 0
    const reveal = () => {
      if (i < messageLines.length) {
        setLines(prev => [...prev, messageLines[i]])
        i++
        setTimeout(reveal, messageLines[i-1]?.trim() === '' ? 400 : 700)
      } else {
        setTimeout(() => setPhase('music'), 600)
      }
    }
    const t = setTimeout(reveal, 300)
    return () => clearTimeout(t)
  }, [phase])
 
  const handleMusic = (wantsMusic) => {
    setMusicChosen(true)
    setMusicEnabled(wantsMusic)
    setMood(mood)
    setPhase('exit')
    setTimeout(() => {
      onComplete(wantsMusic)
    }, 700)
  }
 
  const handleSkip = () => {
    handleMusic(false)
  }
 
  return (
    <div style={{
      ...wrap,
      background: theme.bg,
      opacity: phase === 'exit' ? 0 : 1,
      transform: phase === 'exit' ? 'scale(1.03)' : 'scale(1)',
      transition: phase === 'exit' ? 'all 0.6s ease' : 'background 0.8s ease',
    }}>
      <style>{css}</style>
 
      {/* Mood glow */}
      <div style={{
        ...glow,
        background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${theme.glow} 0%, transparent 70%)`,
      }}/>
 
      {/* Grain */}
      {theme.grain && <div style={grain}/>}
      <div style={subtleGrain}/>
 
      {/* Bloom ring — expands on entry */}
      <div className={phase !== 'bloom' ? 'ring-expand' : ''} style={{
        ...bloomRing,
        borderColor: theme.primary + '22',
      }}/>
      <div className={phase !== 'bloom' ? 'ring-expand-2' : ''} style={{
        ...bloomRing,
        borderColor: theme.primary + '11',
        animationDelay: '0.2s',
      }}/>
 
      <div style={content}>
        {/* Mood emoji + name — small, top */}
        <div className={phase !== 'bloom' ? 'header-in' : 'header-out'} style={moodHeader}>
          <span style={moodEmoji}>{theme.emoji}</span>
          <span style={{ ...moodName, color: theme.subtext }}>
            {theme.name}
          </span>
        </div>
 
        {/* Entry message — lines reveal one by one */}
        <div style={messageWrap}>
          {lines.filter(Boolean).map((line, i) => (
            <p
                key={i}
                className="line-in"
                style={{
                ...messageLine,
                color: line.trim() === '' ? 'transparent' : theme.text,
                fontSize: line.trim() === 'Breathe.' || line.trim() === 'Peace.' ? 22 : 15,
                fontWeight: line.trim() === 'Breathe.' || line.trim() === 'Peace.' ? 700 : 400,
                letterSpacing: line.trim() === 'Breathe.' ? '4px' : '0.3px',
                marginBottom: line.trim() === '' ? 12 : 6,
                fontStyle: i === 0 ? 'normal' : 'italic',
                }}
            >
                {line.trim() === '' ? '\u00A0' : line}
            </p>
        ))}
        </div>
 
        {/* Author voice line */}
        {phase === 'music' || phase === 'exit' ? (
          <div className="voice-in" style={{ ...authorVoice, color: theme.subtext }}>
            — {theme.authorVoice}
          </div>
        ) : null}
 
        {/* Music prompt */}
        {(phase === 'music' || phase === 'exit') && !musicChosen && (
          <div className="music-prompt-in" style={musicPrompt}>
            {/* Divider */}
            <div style={{ ...divider, background: `linear-gradient(90deg, transparent, ${theme.primary}44, transparent)` }}/>
 
            <p style={{ ...musicQuestion, color: theme.text }}>
              🎵 Want music with this mood?
            </p>
            <p style={{ ...musicSub, color: theme.subtext }}>
              A curated playlist, perfectly matched.
            </p>
 
            {/* Playlist preview */}
            <div style={{ ...playlistPreview, borderColor: theme.cardBorder, background: theme.card }}>
              <span style={{ fontSize:20 }}>{theme.emoji}</span>
              <div>
                <p style={{ ...previewTitle, color: theme.text }}>
                  {getPlaylistName(mood)}
                </p>
                <p style={{ ...previewDesc, color: theme.subtext }}>
                  {getPlaylistDesc(mood)}
                </p>
              </div>
              <span style={{ fontSize:18 }}>🎵</span>
            </div>
 
            {/* Buttons */}
            <div style={btnRow}>
              <button
                onClick={() => handleMusic(true)}
                style={{ ...yesBtn, background: theme.btnBg, color: theme.btnText,
                  boxShadow: `0 6px 24px ${theme.glow}` }}
                className="yes-btn"
              >
                Yes, set the vibe ✨
              </button>
              <button
                onClick={handleSkip}
                style={{ ...noBtn, borderColor: theme.cardBorder, color: theme.subtext }}
                className="no-btn"
              >
                Not now
              </button>
            </div>
          </div>
        )}
 
        {/* Loading state after choice */}
        {musicChosen && (
          <div className="voice-in" style={{ textAlign:'center', marginTop:24 }}>
            <p style={{ color: theme.text, fontSize:14, fontStyle:'italic' }}>
              Opening your {theme.name.toLowerCase()} world…
            </p>
          </div>
        )}
      </div>
 
      {/* Skip entirely */}
      {phase === 'message' && (
        <button onClick={handleSkip} style={{ ...skipBtn, color: theme.subtext }}>
          skip →
        </button>
      )}
    </div>
  )
}
 
/* ── Playlist descriptions per mood ─────────────────────────────── */
function getPlaylistName(mood) {
  const names = {
    happy:       'Happy Hits',
    melancholy:  'Melancholy Soul',
    cozy:        'Cozy Lofi Night',
    curious:     'Curious Minds',
    adventurous: 'Epic Adventure',
    calm:        'Calm & Clear',
    romantic:    'Petals & Pages',
    focused:     'Deep Focus',
    stressed:    'Breathe & Heal',
  }
  return names[mood] || 'Mood Playlist'
}
 
function getPlaylistDesc(mood) {
  const descs = {
    happy:       'Feel-good indie pop & acoustic sunshine',
    melancholy:  'Soft piano, sad indie, quiet rain sounds',
    cozy:        'Rainy day lofi, café jazz, amber nights',
    curious:     'Ambient wonder, light electronic journeys',
    adventurous: 'Cinematic orchestral, bold & limitless',
    calm:        'Soft classical, nature sounds, meditation',
    romantic:    'Romantic jazz, soft R&B, timeless love',
    focused:     'Deep focus beats, no lyrics, in the zone',
    stressed:    'Gentle piano, 432Hz healing, breathe slowly',
  }
  return descs[mood] || 'Curated for your mood'
}
 
/* ── Styles ──────────────────────────────────────────────────────── */
const wrap = {
  position:'fixed', inset:0, zIndex:50,
  display:'flex', alignItems:'center', justifyContent:'center',
  fontFamily:"'Georgia',serif",
  overflow:'hidden',
}
const glow = {
  position:'absolute', inset:0, pointerEvents:'none',
}
const grain = {
  position:'absolute', inset:0, pointerEvents:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`,
}
const subtleGrain = {
  position:'absolute', inset:0, pointerEvents:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E")`,
}
const bloomRing = {
  position:'absolute', inset:0, borderRadius:'50%',
  width:300, height:300, margin:'auto',
  border:'1px solid', pointerEvents:'none',
}
 
const content = {
  position:'relative', zIndex:2,
  width:'100%', maxWidth:440,
  padding:'40px 32px',
  display:'flex', flexDirection:'column', alignItems:'center',
}
const moodHeader = {
  display:'flex', alignItems:'center', gap:8,
  marginBottom:28,
}
const moodEmoji = { fontSize:28 }
const moodName  = {
  fontSize:12, letterSpacing:'3px', textTransform:'uppercase',
  fontStyle:'normal',
}
 
const messageWrap = {
  textAlign:'center', marginBottom:16,
  width:'100%', maxWidth:340,
}
const messageLine = {
  margin:'0 0 6px',
  lineHeight:1.75,
  fontFamily:"'Georgia',serif",
  transition:'all 0.3s ease',
}
 
const authorVoice = {
  fontSize:12, fontStyle:'italic',
  letterSpacing:'0.5px', marginBottom:20,
  textAlign:'center', opacity:0.6,
}
 
const musicPrompt = {
  width:'100%', display:'flex',
  flexDirection:'column', alignItems:'center',
}
const divider = { width:'60%', height:1, marginBottom:20 }
const musicQuestion = {
  fontSize:17, fontWeight:700,
  margin:'0 0 5px', textAlign:'center',
  fontFamily:"'Georgia',serif",
}
const musicSub = {
  fontSize:12, fontStyle:'italic',
  margin:'0 0 16px', textAlign:'center',
}
 
const playlistPreview = {
  display:'flex', alignItems:'center', gap:12,
  width:'100%', padding:'12px 16px',
  borderRadius:14, border:'1px solid',
  backdropFilter:'blur(12px)',
  marginBottom:20,
}
const previewTitle = { fontSize:13, fontWeight:700, margin:0 }
const previewDesc  = { fontSize:11, margin:0, fontStyle:'italic', opacity:0.7 }
 
const btnRow = {
  display:'flex', flexDirection:'column',
  gap:10, width:'100%',
}
const yesBtn = {
  width:'100%', padding:'14px',
  border:'none', borderRadius:50,
  fontSize:14.5, fontWeight:700,
  fontFamily:"'Georgia',serif",
  letterSpacing:'0.5px', cursor:'pointer',
  transition:'all 0.25s ease',
}
const noBtn = {
  width:'100%', padding:'12px',
  background:'transparent',
  border:'1px solid', borderRadius:50,
  fontSize:13, cursor:'pointer',
  fontFamily:"'Georgia',serif",
  letterSpacing:'0.5px',
  transition:'all 0.22s ease',
}
 
const skipBtn = {
  position:'fixed', bottom:28, right:28,
  background:'transparent', border:'none',
  fontSize:13, cursor:'pointer',
  fontFamily:"'Georgia',serif",
  fontStyle:'italic', opacity:0.4,
  transition:'opacity 0.2s',
}
 
/* ── Animations ──────────────────────────────────────────────────── */
const css = `
  * { box-sizing:border-box; }
 
  @keyframes ring-expand {
    from { transform:scale(0.8); opacity:0.6; }
    to   { transform:scale(8);   opacity:0; }
  }
  @keyframes header-in {
    from { opacity:0; transform:translateY(-10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes line-in {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes voice-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes prompt-in {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
 
  .ring-expand   { animation:ring-expand 1.2s ease-out forwards; }
  .ring-expand-2 { animation:ring-expand 1.2s ease-out 0.2s forwards; }
  .header-in     { animation:header-in 0.5s ease forwards; }
  .header-out    { opacity:0; }
  .line-in       { animation:line-in 0.5s ease forwards; }
  .voice-in      { animation:voice-in 0.8s ease forwards; }
  .music-prompt-in { animation:prompt-in 0.6s cubic-bezier(.22,1,.36,1) forwards; }
 
  .yes-btn:hover { transform:translateY(-2px) scale(1.02); filter:brightness(1.1); }
  .yes-btn:active { transform:translateY(0) scale(0.98); }
  .no-btn:hover  { opacity:0.8; }
`