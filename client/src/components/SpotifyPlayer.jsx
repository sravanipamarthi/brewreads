import { useState } from 'react'
import { THEMES } from '../styles/themes'

/* ── Mood playlists ───────────────────────────────────────────── */
export const MOOD_PLAYLISTS = {
  happy:       { id: '37i9dQZF1DXdPec7aLTmlC', name: 'Happy Hits',       desc: 'Feel-good indie & acoustic' },
  melancholy:  { id: '37i9dQZF1DX3YSRoSdA634', name: 'Melancholy Soul',   desc: 'Soft piano & sad indie' },
  cozy:        { id: '37i9dQZF1DWWQRwui0ExPn', name: 'Cozy Lofi Night',   desc: 'Rainy day lofi & café jazz' },
  curious:     { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Curious Minds',     desc: 'Ambient & light electronic' },
  adventurous: { id: '37i9dQZF1DWZd79rJ6a7lp', name: 'Epic Adventure',    desc: 'Cinematic orchestral' },
  calm:        { id: '37i9dQZF1DWZqd5JICZI0u', name: 'Calm & Clear',      desc: 'Soft classical & meditation' },
  romantic:    { id: '37i9dQZF1DWSqBruwoIXkA', name: 'Petals & Pages',    desc: 'Romantic jazz & soft R&B' },
  focused:     { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus',        desc: 'No lyrics, pure focus' },
  stressed:    { id: '37i9dQZF1DX3Aq4mBFMPYD', name: 'Breathe & Heal',    desc: 'Gentle piano & 432Hz healing' },
}

/* ════════════════════════════════════════════════════════════════
   SpotifyPlayer
   — Always visible floating 🎵 button
   — Click → opens a panel with embedded Spotify playlist
   — No login needed, works immediately
   — Mood-matched playlist auto-loads
════════════════════════════════════════════════════════════════ */
export default function SpotifyPlayer({ mood }) {
  const theme    = THEMES[mood] || THEMES.cozy
  const playlist = MOOD_PLAYLISTS[mood] || MOOD_PLAYLISTS.cozy
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{css}</style>

      {/* Always visible floating music button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          ...floatBtn,
          background: open ? theme.primary : theme.btnBg,
          boxShadow: `0 4px 20px ${theme.glow}`,
          transform: open ? 'scale(0.92)' : 'scale(1)',
        }}
        className="spotify-float"
        title="Music for this mood"
      >
        🎵
      </button>

      {/* Panel — slides up when open */}
      {open && (
        <>
          <div style={{
            ...panel,
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: `0 -4px 40px rgba(0,0,0,0.5), 0 0 30px ${theme.glow}`,
          }}>

            {/* Header */}
            <div style={{ ...panelHead, borderBottomColor: theme.primary + '22' }}>
              <div>
                <p style={{ ...panelTitle, color: theme.text }}>
                  🎵 {playlist.name}
                </p>
                <p style={{ ...panelSub, color: theme.subtext }}>
                  {playlist.desc} · matched to your {theme.name.toLowerCase()} mood
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ ...closeBtn, color: theme.subtext }}
              >
                ✕
              </button>
            </div>

            {/* Spotify embed — works immediately, no login */}
            <iframe
              title={playlist.name}
              src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={embedFrame}
            />

            {/* Helper text */}
            <p style={{ ...helperText, color: theme.subtext }}>
              ✦ Hit play above · No Spotify login needed
            </p>
          </div>

          {/* Backdrop */}
          <div style={backdrop} onClick={() => setOpen(false)} />
        </>
      )}
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────────────── */
const floatBtn = {
  position: 'fixed', bottom: 88, right: 16, zIndex: 100,
  width: 48, height: 48, borderRadius: '50%',
  border: 'none', fontSize: 20, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.25s ease',
  fontFamily: "'Georgia', serif",
}

const panel = {
  position: 'fixed', bottom: 144, right: 16, zIndex: 101,
  width: 320,
  background: 'rgba(10,8,20,0.95)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 18,
  overflow: 'hidden',
  fontFamily: "'Georgia', serif",
  animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
}

const panelHead = {
  display: 'flex', alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 14px 10px',
  borderBottom: '1px solid',
}
const panelTitle = { fontSize: 13, fontWeight: 700, margin: 0 }
const panelSub   = { fontSize: 10.5, fontStyle: 'italic', margin: '2px 0 0', opacity: 0.7 }
const closeBtn   = {
  background: 'transparent', border: 'none',
  cursor: 'pointer', fontSize: 14, opacity: 0.5,
  padding: '2px 5px',
}

const embedFrame = {
  display: 'block', borderRadius: 0,
  background: 'transparent',
}

const helperText = {
  fontSize: 10, textAlign: 'center',
  padding: '8px 0 10px',
  letterSpacing: '1px',
  fontFamily: "'Georgia', serif",
}

const backdrop = {
  position: 'fixed', inset: 0, zIndex: 99,
  background: 'transparent',
}

const css = `
  @keyframes slideUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .spotify-float:hover { transform:scale(1.1) !important; }
`