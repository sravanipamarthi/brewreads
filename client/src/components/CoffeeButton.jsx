import { useState, useEffect } from 'react'
import { THEMES } from '../styles/themes'

/* ── Mood-specific coffee messages ───────────────────────────── */
const COFFEE_MESSAGES = {
  happy:       'Celebrate with a coffee! ☀️',
  melancholy:  'A warm cup might help 🌧️',
  cozy:        'Order a cozy latte? 🕯️',
  curious:     'Fuel your curiosity ☕',
  adventurous: 'Adventure needs fuel! 🌌',
  calm:        'A gentle cup of calm 🍵',
  romantic:    'Something sweet? 🌹',
  focused:     'Stay sharp, get coffee 🎯',
  stressed:    'Take a break, you deserve it 💙',
}

/* ── Fetch nearby cafes using OpenStreetMap Overpass API ─────── */
const fetchCafesOSM = async (lat, lng, radius = 2000) => {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="cafe"](around:${radius},${lat},${lng});
      node["amenity"="coffee_shop"](around:${radius},${lat},${lng});
      node["shop"="coffee"](around:${radius},${lat},${lng});
    );
    out body 10;
  `
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  const data = await res.json()
  return data.elements || []
}

/* ── Distance calculation ─────────────────────────────────────── */
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLng/2)**2
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return d < 1 ? `${Math.round(d*1000)}m` : `${d.toFixed(1)}km`
}

/* ── Individual Café Card ─────────────────────────────────────── */
const CafeCard = ({ cafe, userLat, userLng, theme }) => {
  const name    = cafe.tags?.name || 'Unnamed Café'
  const address = cafe.tags?.['addr:street']
    ? `${cafe.tags['addr:housenumber'] || ''} ${cafe.tags['addr:street']}`.trim()
    : cafe.tags?.['addr:full'] || ''
  const opening = cafe.tags?.opening_hours || ''
  const phone   = cafe.tags?.phone || cafe.tags?.['contact:phone'] || ''
  const website = cafe.tags?.website || cafe.tags?.['contact:website'] || ''
  const distance = getDistance(userLat, userLng, cafe.lat, cafe.lon)

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' cafe')}&center=${cafe.lat},${cafe.lon}`

  return (
    <a href={mapsUrl} target="_blank" rel="noreferrer"
      style={cardStyle} className="cafe-card">
      <div style={cardLeft}>
        <div style={{ ...cafeIconWrap, background: theme.btnBg }}>
          ☕
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <p style={{ ...cafeName, color: theme.text }}>{name}</p>
          {address && (
            <p style={{ ...cafeAddr, color: theme.subtext }}>{address}</p>
          )}
          <div style={cafeMeta}>
            <span style={{ ...pill, background: theme.card, border:`1px solid ${theme.cardBorder}`, color: theme.primary }}>
              📍 {distance}
            </span>
            {opening && (
              <span style={{ ...pill, background: theme.card, border:`1px solid ${theme.cardBorder}`, color: theme.subtext }}>
                🕐 {opening.slice(0, 20)}
              </span>
            )}
          </div>
        </div>
      </div>
      <span style={{ color: theme.primary, fontSize:16, flexShrink:0 }}>→</span>
    </a>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function CoffeeButton({ mood }) {
  const theme   = THEMES[mood] || THEMES.cozy
  const message = COFFEE_MESSAGES[mood] || 'Order coffee nearby ☕'

  const [open, setOpen]       = useState(false)
  const [cafes, setCafes]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [userPos, setUserPos] = useState(null)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (open && !fetched) findCafes()
  }, [open])

  const findCafes = () => {
    setLoading(true); setError('')

    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false); return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords
        setUserPos({ lat, lng })
        try {
          const elements = await fetchCafesOSM(lat, lng)
          if (elements.length === 0) {
            setError('No cafés found within 2km')
          } else {
            // Sort by distance
            const sorted = elements
              .filter(e => e.lat && e.lon)
              .sort((a, b) => {
                const da = getDistance(lat, lng, a.lat, a.lon)
                const db = getDistance(lat, lng, b.lat, b.lon)
                return parseFloat(da) - parseFloat(db)
              })
              .slice(0, 8)
            setCafes(sorted)
          }
        } catch (err) {
          setError('Could not load cafés. Try again.')
        } finally {
          setLoading(false)
          setFetched(true)
        }
      },
      () => {
        setError('Allow location access to find nearby cafés')
        setLoading(false)
      },
      { timeout: 8000 }
    )
  }

  const openMaps = () => {
    const url = userPos
      ? `https://www.google.com/maps/search/cafe/@${userPos.lat},${userPos.lng},15z`
      : `https://www.google.com/maps/search/cafe+near+me`
    window.open(url, '_blank')
  }

  return (
    <>
      <style>{css}</style>

      {/* Floating ☕ button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          ...floatBtn,
          background: theme.btnBg,
          boxShadow: `0 4px 20px ${theme.glow}`,
          transform: open ? 'scale(0.92)' : 'scale(1)',
        }}
        className="coffee-float"
        title={message}
      >
        ☕
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          ...panel,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: `0 8px 48px rgba(0,0,0,0.55), 0 0 30px ${theme.glow}`,
        }}>
          {/* Header */}
          <div style={{ ...panelHead, borderBottomColor: theme.primary+'22' }}>
            <div>
              <p style={{ ...panelTitle, color: theme.text }}>☕ nearby cafés</p>
              <p style={{ ...panelSub, color: theme.subtext }}>{message}</p>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={openMaps}
                style={{ ...mapsBtn, background: theme.btnBg, color: theme.btnText }}
                className="maps-btn" title="Open in Google Maps">
                🗺
              </button>
              <button onClick={() => setOpen(false)}
                style={{ ...closeBtn, color: theme.subtext }}>✕</button>
            </div>
          </div>

          {/* Body */}
          <div style={panelBody}>

            {/* Loading */}
            {loading && (
              <div style={center}>
                <div style={{ ...spinner, borderTopColor: theme.primary }} className="spin"/>
                <p style={{ color:theme.subtext, fontSize:12, marginTop:14, fontStyle:'italic' }}>
                  finding cafés near you…
                </p>
                <p style={{ color:theme.subtext, fontSize:10.5, marginTop:4, opacity:0.5 }}>
                  powered by OpenStreetMap
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div style={center}>
                <span style={{ fontSize:32, marginBottom:12 }}>☕</span>
                <p style={{ color:theme.subtext, fontSize:13, fontStyle:'italic',
                  marginBottom:16, textAlign:'center' }}>
                  {error}
                </p>
                <button onClick={openMaps}
                  style={{ ...actionBtn, background:theme.btnBg, color:theme.btnText,
                    boxShadow:`0 4px 20px ${theme.glow}` }}
                  className="maps-btn">
                  Open Google Maps →
                </button>
                {fetched && (
                  <button onClick={() => { setFetched(false); findCafes() }}
                    style={{ ...actionBtn, background:'transparent', color:theme.subtext,
                      border:`1px solid ${theme.cardBorder}`, marginTop:8 }}>
                    Try again
                  </button>
                )}
              </div>
            )}

            {/* Café list */}
            {!loading && !error && cafes.length > 0 && (
              <>
                <p style={{ color:theme.subtext, fontSize:9.5, letterSpacing:'1.5px', marginBottom:10 }}>
                  {cafes.length} CAFÉS FOUND · TAP TO OPEN IN MAPS
                </p>
                <div style={cafeList}>
                  {cafes.map((cafe, i) => (
                    <CafeCard key={cafe.id || i} cafe={cafe}
                      userLat={userPos.lat} userLng={userPos.lng} theme={theme}/>
                  ))}
                </div>
                <button onClick={openMaps}
                  style={{ ...actionBtn, background:'transparent', color:theme.subtext,
                    border:`1px solid ${theme.cardBorder}`, marginTop:12 }}>
                  View all on Google Maps →
                </button>
                <p style={{ color:theme.subtext, fontSize:9.5, textAlign:'center',
                  marginTop:8, opacity:0.4, letterSpacing:'0.5px' }}>
                  data © OpenStreetMap contributors
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && <div style={backdrop} onClick={() => setOpen(false)}/>}
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────────────── */
const floatBtn = {
  position:'fixed', bottom:140, right:16, zIndex:100,
  width:48, height:48, borderRadius:'50%',
  border:'none', fontSize:20, cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center',
  transition:'all 0.25s ease',
}
const panel = {
  position:'fixed', bottom:140, right:24, zIndex:101,
  width:320, maxHeight:'62vh',
  background:'rgba(10,8,20,0.93)',
  backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
  borderRadius:20, overflow:'hidden',
  display:'flex', flexDirection:'column',
  fontFamily:"'Georgia',serif",
}
const panelHead  = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 14px 11px', borderBottom:'1px solid', flexShrink:0 }
const panelTitle = { fontSize:14, fontWeight:700, margin:0 }
const panelSub   = { fontSize:11, fontStyle:'italic', margin:'2px 0 0', opacity:0.7 }
const mapsBtn    = { width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }
const closeBtn   = { background:'transparent', border:'none', cursor:'pointer', fontSize:14, opacity:0.5, padding:'2px 5px' }
const panelBody  = { padding:'13px 13px 14px', overflowY:'auto', flex:1 }
const center     = { display:'flex', flexDirection:'column', alignItems:'center', padding:'18px 0' }
const spinner    = { width:28, height:28, border:'2.5px solid rgba(255,255,255,0.07)', borderRadius:'50%' }
const actionBtn  = { width:'100%', padding:'10px', border:'none', borderRadius:50, fontSize:13, fontWeight:600, fontFamily:"'Georgia',serif", cursor:'pointer', letterSpacing:'0.5px', transition:'all 0.22s ease' }
const cafeList   = { display:'flex', flexDirection:'column', gap:8 }
const cardStyle  = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 11px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', textDecoration:'none', cursor:'pointer', transition:'all 0.2s ease' }
const cardLeft   = { display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }
const cafeIconWrap={ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }
const cafeName   = { fontSize:12.5, fontWeight:700, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }
const cafeAddr   = { fontSize:10, margin:'1px 0 4px', opacity:0.6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }
const cafeMeta   = { display:'flex', gap:4, flexWrap:'wrap' }
const pill       = { padding:'2px 7px', borderRadius:50, fontSize:9.5, letterSpacing:'0.3px' }
const backdrop   = { position:'fixed', inset:0, zIndex:99, background:'transparent' }

const css = `
  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { animation:spin 1s linear infinite; }
  .coffee-float:hover { transform:scale(1.1) !important; }
  .cafe-card:hover { background:rgba(255,255,255,0.08) !important; transform:translateX(-2px); }
  .maps-btn:hover { opacity:0.85; }
`