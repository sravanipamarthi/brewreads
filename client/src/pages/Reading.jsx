import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useMood } from '../context/MoodContext'
import { THEMES } from '../styles/themes'
import SpotifyPlayer from '../components/SpotifyPlayer'
import CoffeeButton from '../components/CoffeeButton'

/* ════════════════════════════════════════════════════════════════
   GUTENBERG TEXT FETCHER
   Searches Project Gutenberg for the book and fetches real text
════════════════════════════════════════════════════════════════ */
const fetchGutenbergText = async (title, authors) => {
  try {
    const author = Array.isArray(authors) ? authors[0] : authors || ''
    // Search Gutenberg API
    const searchRes = await axios.get('https://gutendex.com/books', {
      params: { search: `${title} ${author}` }
    })

    const results = searchRes.data?.results || []
    if (results.length === 0) return { found: false }

    const book = results[0]
    // Get plain text format
    const formats = book.formats || {}
    const textUrl =
      formats['text/plain; charset=utf-8'] ||
      formats['text/plain; charset=us-ascii'] ||
      formats['text/plain'] ||
      null

    if (!textUrl) return { found: false, meta: book }

    // Fetch actual text
    const textRes = await axios.get(textUrl)
    const rawText = textRes.data

    // Clean up Gutenberg header/footer
    const startMarkers = [
      '*** START OF THE PROJECT GUTENBERG',
      '***START OF THE PROJECT GUTENBERG',
      '*** START OF THIS PROJECT GUTENBERG',
      '*END*THE SMALL PRINT',
    ]
    const endMarkers = [
      '*** END OF THE PROJECT GUTENBERG',
      '***END OF THE PROJECT GUTENBERG',
      '*** END OF THIS PROJECT GUTENBERG',
      'End of the Project Gutenberg',
      'End of Project Gutenberg',
    ]

    let text = rawText
    for (const marker of startMarkers) {
      const idx = text.indexOf(marker)
      if (idx !== -1) {
        text = text.slice(text.indexOf('\n', idx) + 1)
        break
      }
    }
    for (const marker of endMarkers) {
      const idx = text.indexOf(marker)
      if (idx !== -1) { text = text.slice(0, idx); break }
    }

    // Split into chapters/paragraphs
    const paragraphs = text
      .split(/\n{2,}/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 30)

    // Group paragraphs into chapters (~50 paragraphs each)
    const chapterSize = 50
    const chapters = []
    for (let i = 0; i < paragraphs.length; i += chapterSize) {
      chapters.push(paragraphs.slice(i, i + chapterSize))
    }

    return {
      found: true,
      title: book.title,
      authors: book.authors?.map(a => a.name) || [],
      chapters,
      totalChapters: chapters.length,
      totalParagraphs: paragraphs.length,
      gutenbergId: book.id,
      coverUrl: book.formats['image/jpeg'] || null,
    }
  } catch (err) {
    console.error('Gutenberg fetch error:', err.message)
    return { found: false }
  }
}

/* ── Progress bar ─────────────────────────────────────────────── */
const ProgressBar = ({ progress, color }) => (
  <div style={{ position:'fixed', top:0, left:0, right:0, height:3, zIndex:100, background:'rgba(255,255,255,0.06)' }}>
    <div style={{ height:'100%', width:`${progress}%`, background:color, transition:'width 0.4s ease', borderRadius:'0 2px 2px 0' }}/>
  </div>
)

/* ── Candle flicker ───────────────────────────────────────────── */
const Candle = ({ color }) => {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    c.width = 100; c.height = 100
    let raf, t = 0
    const draw = () => {
      ctx.clearRect(0, 0, 100, 100)
      t += 0.06
      const flicker = Math.sin(t) * 0.15 + Math.sin(t * 2.3) * 0.08
      const size = 24 + flicker * 7
      const g = ctx.createRadialGradient(50, 50, 0, 50, 50, size)
      g.addColorStop(0, `rgba(255,240,180,${0.65 + flicker * 0.2})`)
      g.addColorStop(0.4, `${color}33`)
      g.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(50, 50, size, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [color])
  return <canvas ref={ref} style={{ position:'fixed', bottom:80, right:80, pointerEvents:'none', zIndex:1, opacity:0.5 }}/>
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function Reading() {
  const navigate = useNavigate()
  const { mood, musicEnabled } = useMood()
  const theme = THEMES[mood] || THEMES.cozy
  const book  = JSON.parse(sessionStorage.getItem('brewreads_reading') || 'null')

  const [gutData, setGutData]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [chapter, setChapter]       = useState(0)
  const [progress, setProgress]     = useState(book?.progress || 0)
  const [fontSize, setFontSize]     = useState(17)
  const [lineHeight, setLineHeight] = useState(1.9)
  const [showControls, setShowControls] = useState(true)
  const [showPlayer, setShowPlayer] = useState(musicEnabled)
  const [saving, setSaving]         = useState(false)
  const [visible, setVisible]       = useState(false)
  const controlsTimer = useRef(null)
  const readerRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
    resetControlsTimer()
    if (book) loadBook()
    return () => clearTimeout(controlsTimer.current)
  }, [])

  // Auto-update progress when chapter changes
  useEffect(() => {
    if (!gutData) return
    const pct = Math.round(((chapter + 1) / gutData.totalChapters) * 100)
    setProgress(pct)
    saveProgress(pct)
    // Scroll to top of reader
    readerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [chapter, gutData])

  const loadBook = async () => {
    setLoading(true)
    const data = await fetchGutenbergText(book.title, book.authors)
    setGutData(data)
    setLoading(false)
  }

  const resetControlsTimer = () => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000)
  }

  const saveProgress = async (val) => {
    if (!book?._id) return
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `http://localhost:8000/api/books/progress/${book._id}`,
        { progress: val },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (!book) return (
    <div style={{ ...page, background:theme.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ color:theme.text, fontSize:18, fontFamily:"'Georgia',serif", marginBottom:16 }}>No book selected</p>
        <button onClick={() => navigate('/books')}
          style={{ padding:'12px 24px', background:theme.btnBg, color:theme.btnText, border:'none', borderRadius:50, cursor:'pointer', fontFamily:"'Georgia',serif" }}>
          ← back to books
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ ...page, background:theme.readingBg }}
      onMouseMove={resetControlsTimer} onTouchStart={resetControlsTimer}>
      <style>{css}</style>

      {theme.grain && <div style={grainLayer}/>}
      <ProgressBar progress={progress} color={theme.primary}/>
      {(mood==='cozy'||mood==='romantic') && <Candle color={theme.primary}/>}

      {/* ── Controls overlay ── */}
      <div style={{ ...controls, opacity:showControls?1:0, transition:'opacity 0.5s ease' }}>

        {/* Top bar */}
        <div style={{ ...topBar, borderBottomColor:theme.primary+'22' }}>
          <button onClick={() => navigate('/books')}
            style={{ ...iconBtn, color:theme.subtext }}>← books</button>

          <div style={bookMeta}>
            <span style={{ ...metaTitle, color:theme.text }}>{book.title}</span>
            {gutData?.found && (
              <span style={{ color:theme.primary, fontSize:10, letterSpacing:'1px' }}>
                Chapter {chapter+1} of {gutData.totalChapters}
              </span>
            )}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:2 }}>
            <button onClick={() => setFontSize(f=>Math.max(13,f-1))}
              style={{ ...iconBtn, color:theme.subtext }}>A-</button>
            <button onClick={() => setFontSize(f=>Math.min(24,f+1))}
              style={{ ...iconBtn, color:theme.subtext }}>A+</button>
            <button onClick={() => setLineHeight(l=>l===1.9?1.5:1.9)}
              style={{ ...iconBtn, color:theme.subtext }} title="Toggle line spacing">≡</button>
            {musicEnabled && (
              <button onClick={() => setShowPlayer(v=>!v)}
                style={{ ...iconBtn, color:showPlayer?theme.primary:theme.subtext }}>🎵</button>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ ...bottomBar, borderTopColor:theme.primary+'22' }}>
          <span style={{ color:theme.subtext, fontSize:10, letterSpacing:'1px', minWidth:55 }}>
            {saving ? 'saving…' : `${progress}%`}
          </span>
          <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:theme.primary, transition:'width 0.4s ease' }}/>
          </div>
          <button onClick={() => navigate('/shelf')}
            style={{ ...shelfBtn, color:theme.subtext, borderColor:theme.primary+'33' }}>
            📚 shelf
          </button>
        </div>
      </div>

      {/* ── READER ── */}
      <div ref={readerRef} className={visible?'r-in':'r-out'} style={readerWrap}
        onClick={resetControlsTimer}>

        {/* Loading */}
        {loading && (
          <div style={loadingWrap}>
            <div style={{ ...loadSpinner, borderTopColor:theme.primary }} className="spin"/>
            <p style={{ color:theme.subtext, fontStyle:'italic', marginTop:16, fontSize:13 }}>
              Searching Project Gutenberg…
            </p>
            <p style={{ color:theme.subtext, opacity:0.5, fontSize:11, marginTop:6 }}>
              fetching {book.title}
            </p>
          </div>
        )}

        {/* Book found — show text */}
        {!loading && gutData?.found && (
          <>
            {/* Chapter header — only show on first chapter */}
            {chapter === 0 && (
              <div style={chapterHeader}>
                <div style={titlePage}>
                  {book.thumbnail && (
                    <img src={book.thumbnail} alt={book.title}
                      style={{ width:120, height:170, objectFit:'cover', borderRadius:8,
                        boxShadow:`0 12px 40px rgba(0,0,0,0.5), 0 0 30px ${theme.glow}`,
                        marginBottom:20 }}/>
                  )}
                  <h1 style={{ ...titleH, color:theme.readingText }}>{book.title}</h1>
                  <p style={{ ...titleAuthor, color:theme.primary }}>
                    {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
                  </p>

                  {book.moodReason && (
                    <div style={{ ...moodBox, borderColor:theme.primary+'33', background:theme.card }}>
                      <p style={{ color:theme.subtext, fontSize:12.5, fontStyle:'italic', margin:0, lineHeight:1.6, textAlign:'center' }}>
                        ✦ {book.moodReason}
                      </p>
                    </div>
                  )}

                  <div style={{ ...divider, background:`linear-gradient(90deg,transparent,${theme.primary}44,transparent)` }}/>
                </div>
              </div>
            )}

            {/* Chapter indicator */}
            <p style={{ ...chapterLabel, color:theme.primary }}>
              — {chapter === 0 ? 'Beginning' : `Part ${chapter + 1}`} —
            </p>

            {/* THE ACTUAL BOOK TEXT */}
            <div style={textBody}>
              {gutData.chapters[chapter].map((para, i) => (
                <p key={i} style={{
                  ...paragraph,
                  fontSize,
                  lineHeight,
                  color: theme.readingText,
                  fontFamily: theme.readingFont,
                  // First paragraph of chapter — drop cap effect
                  ...(i === 0 ? { marginTop:0 } : {}),
                }}>
                  {/* Drop cap on first letter of first paragraph */}
                  {i === 0 ? (
                    <>
                      <span style={{ ...dropCap, color:theme.primary, fontFamily:theme.font }}>
                        {para[0]}
                      </span>
                      {para.slice(1)}
                    </>
                  ) : para}
                </p>
              ))}
            </div>

            {/* Chapter navigation */}
            <div style={chapterNav}>
              <button
                onClick={() => setChapter(c => Math.max(0, c-1))}
                disabled={chapter === 0}
                style={{
                  ...chapterBtn,
                  borderColor: theme.cardBorder,
                  color: chapter === 0 ? theme.subtext+'44' : theme.subtext,
                  opacity: chapter === 0 ? 0.4 : 1,
                }}
                className="chapter-btn"
              >
                ← previous
              </button>

              <div style={{ textAlign:'center' }}>
                <p style={{ color:theme.subtext, fontSize:11, letterSpacing:'1.5px' }}>
                  {chapter+1} / {gutData.totalChapters}
                </p>
                <p style={{ color:theme.primary, fontSize:10, letterSpacing:'1px', marginTop:2 }}>
                  {progress}% complete
                </p>
              </div>

              <button
                onClick={() => setChapter(c => Math.min(gutData.totalChapters-1, c+1))}
                disabled={chapter === gutData.totalChapters-1}
                style={{
                  ...chapterBtn,
                  background: chapter < gutData.totalChapters-1 ? theme.btnBg : 'transparent',
                  color: chapter < gutData.totalChapters-1 ? theme.btnText : theme.subtext+'44',
                  border: chapter < gutData.totalChapters-1 ? 'none' : `1px solid ${theme.cardBorder}`,
                  opacity: chapter === gutData.totalChapters-1 ? 0.4 : 1,
                  boxShadow: chapter < gutData.totalChapters-1 ? `0 4px 20px ${theme.glow}` : 'none',
                }}
                className="chapter-btn"
              >
                next →
              </button>
            </div>

            {/* Finished! */}
            {chapter === gutData.totalChapters-1 && progress >= 95 && (
              <div style={{ ...finishedBox, borderColor:theme.primary+'44', background:theme.card }}>
                <p style={{ fontSize:32, marginBottom:8 }}>{theme.emoji}</p>
                <p style={{ color:theme.text, fontSize:18, fontWeight:700, fontFamily:"'Georgia',serif", marginBottom:6 }}>
                  You finished it!
                </p>
                <p style={{ color:theme.subtext, fontSize:13, fontStyle:'italic' }}>
                  "{theme.authorVoice}"
                </p>
                <button onClick={() => navigate('/shelf')}
                  style={{ ...finishedBtn, background:theme.btnBg, color:theme.btnText, boxShadow:`0 6px 24px ${theme.glow}` }}
                  className="chapter-btn">
                  save to shelf →
                </button>
              </div>
            )}
          </>
        )}

        {/* Book NOT on Gutenberg */}
        {!loading && gutData && !gutData.found && (
          <div style={notFoundWrap}>
            {book.thumbnail && (
              <img src={book.thumbnail} alt={book.title}
                style={{ width:120, height:170, objectFit:'cover', borderRadius:10,
                  boxShadow:`0 12px 40px rgba(0,0,0,0.5)`, marginBottom:24 }}/>
            )}
            <h1 style={{ ...titleH, color:theme.readingText, marginBottom:8 }}>{book.title}</h1>
            <p style={{ color:theme.primary, fontStyle:'italic', marginBottom:16 }}>
              {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
            </p>

            {book.moodReason && (
              <div style={{ ...moodBox, borderColor:theme.primary+'33', background:theme.card, maxWidth:500, margin:'0 auto 24px' }}>
                <p style={{ color:theme.subtext, fontSize:13, fontStyle:'italic', margin:0, lineHeight:1.6, textAlign:'center' }}>
                  ✦ {book.moodReason}
                </p>
              </div>
            )}

            {book.description && (
              <div style={{ maxWidth:580, margin:'0 auto 28px', textAlign:'left' }}>
                <p style={{ color:theme.primary, fontSize:11, letterSpacing:'2px', marginBottom:12, textAlign:'center' }}>ABOUT THIS BOOK</p>
                <p style={{ color:theme.readingText, fontSize, lineHeight:1.9, fontFamily:theme.readingFont }}>
                  {book.description}
                </p>
              </div>
            )}

            <div style={{ ...divider, background:`linear-gradient(90deg,transparent,${theme.primary}44,transparent)`, maxWidth:400, margin:'0 auto 24px' }}/>

            <p style={{ color:theme.subtext, fontSize:13, fontStyle:'italic', marginBottom:20 }}>
              This book isn't available in full text yet — but your reading journey doesn't end here.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:320, margin:'0 auto' }}>
              {book.previewLink && (
                <a href={book.previewLink} target="_blank" rel="noreferrer"
                  style={{ ...extLink, background:theme.btnBg, color:theme.btnText, boxShadow:`0 6px 24px ${theme.glow}` }}>
                  Read preview on Google Books ↗
                </a>
              )}
              <button onClick={() => navigate('/books')}
                style={{ ...extOutline, borderColor:theme.cardBorder, color:theme.subtext }}>
                ← find another book
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spotify */}
      <SpotifyPlayer mood={mood} />

      {/* Coffee button */}
      <CoffeeButton mood={mood} />
    </div>
  )
}

/* ── Styles ──────────────────────────────────────────────────────── */
const page       = { minHeight:'100vh', position:'relative', overflow:'hidden', fontFamily:"'Georgia',serif" }
const grainLayer = { position:'fixed', inset:0, pointerEvents:'none', zIndex:1, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")` }
const controls   = { position:'fixed', inset:0, zIndex:50, pointerEvents:'none', display:'flex', flexDirection:'column', justifyContent:'space-between' }
const topBar     = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px', background:'rgba(0,0,0,0.55)', backdropFilter:'blur(20px)', borderBottom:'1px solid', pointerEvents:'auto' }
const bottomBar  = { display:'flex', alignItems:'center', gap:12, padding:'10px 20px', background:'rgba(0,0,0,0.55)', backdropFilter:'blur(20px)', borderTop:'1px solid', pointerEvents:'auto' }
const bookMeta   = { display:'flex', flexDirection:'column', alignItems:'center', flex:1, gap:2 }
const metaTitle  = { fontSize:12.5, fontWeight:700, fontFamily:"'Georgia',serif", textAlign:'center' }
const iconBtn    = { background:'transparent', border:'none', cursor:'pointer', fontSize:12.5, padding:'4px 7px', opacity:0.7, fontFamily:"'Georgia',serif" }
const shelfBtn   = { background:'transparent', border:'1px solid', borderRadius:50, padding:'4px 10px', fontSize:11, cursor:'pointer', fontFamily:"'Georgia',serif" }

const readerWrap = { position:'relative', zIndex:2, maxWidth:680, margin:'0 auto', padding:'72px 28px 100px', minHeight:'100vh' }

const loadingWrap  = { display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'30vh' }
const loadSpinner  = { width:36, height:36, border:'3px solid rgba(255,255,255,0.1)', borderRadius:'50%' }

const chapterHeader= { marginBottom:8 }
const titlePage    = { display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', paddingBottom:8 }
const titleH       = { fontSize:'clamp(22px,4vw,32px)', fontWeight:800, fontFamily:"'Georgia',serif", marginBottom:10, lineHeight:1.2 }
const titleAuthor  = { fontSize:15, fontStyle:'italic', marginBottom:16 }
const moodBox      = { padding:'12px 16px', borderRadius:12, border:'1px solid', width:'100%', maxWidth:440, marginBottom:16 }
const divider      = { height:1, width:'100%', marginTop:8, marginBottom:24 }

const chapterLabel = { fontSize:12, letterSpacing:'3px', textAlign:'center', marginBottom:28, textTransform:'uppercase', opacity:0.7 }

const textBody  = { marginBottom:48 }
const paragraph = { marginBottom:24, textIndent:'2em', textAlign:'justify' }
const dropCap   = { float:'left', fontSize:'4em', lineHeight:0.75, marginRight:8, marginTop:8, fontWeight:800 }

const chapterNav= { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'24px 0', borderTop:'1px solid rgba(255,255,255,0.06)', marginBottom:24 }
const chapterBtn= { padding:'11px 22px', borderRadius:50, fontSize:13, cursor:'pointer', fontFamily:"'Georgia',serif", letterSpacing:'0.5px', transition:'all 0.25s ease', border:'1px solid' }

const finishedBox = { textAlign:'center', padding:'32px', borderRadius:20, border:'1px solid', marginBottom:24 }
const finishedBtn = { display:'inline-block', marginTop:16, padding:'12px 28px', border:'none', borderRadius:50, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Georgia',serif" }

const notFoundWrap= { textAlign:'center', paddingTop:'72px' }
const extLink     = { display:'block', padding:'13px', borderRadius:50, fontSize:13.5, fontWeight:700, fontFamily:"'Georgia',serif", textDecoration:'none', letterSpacing:'0.5px', textAlign:'center', transition:'all 0.25s ease' }
const extOutline  = { display:'block', padding:'11px', borderRadius:50, fontSize:13, fontFamily:"'Georgia',serif", cursor:'pointer', letterSpacing:'0.5px', textAlign:'center', background:'transparent', border:'1px solid', transition:'all 0.22s' }

const musicFloat  = { position:'fixed', bottom:88, right:16, zIndex:100, width:48, height:48, borderRadius:'50%', border:'none', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }

const css = `
  * { box-sizing:border-box; margin:0; padding:0; }
  .r-out { opacity:0; transition:opacity .8s ease; }
  .r-in  { opacity:1; transition:opacity .8s ease; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .spin { animation:spin 1s linear infinite; }

  .chapter-btn:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); }
  .chapter-btn:active:not(:disabled) { transform:translateY(0); }
`