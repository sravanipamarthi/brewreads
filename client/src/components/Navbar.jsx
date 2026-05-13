import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useMood } from '../context/MoodContext'
import { THEMES } from '../styles/themes'

/* ════════════════════════════════════════════════════════════════
   NAVBAR — shows on all protected pages
   • Floating avatar top-right → opens drawer
   • Bottom nav bar → Home, Books, Shelf, Profile
   • Side drawer → full profile panel
════════════════════════════════════════════════════════════════ */

/* ── Avatar initials ──────────────────────────────────────────── */
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

/* ── Stats card ───────────────────────────────────────────────── */
const StatCard = ({ value, label, theme }) => (
  <div style={{
    flex: 1, textAlign: 'center', padding: '12px 8px',
    background: theme.card, borderRadius: 14,
    border: `1px solid ${theme.cardBorder}`,
  }}>
    <p style={{ fontSize: 22, fontWeight: 800, color: theme.primary, margin: 0, fontFamily: "'Georgia',serif" }}>
      {value}
    </p>
    <p style={{ fontSize: 10, color: theme.subtext, margin: '3px 0 0', letterSpacing: '1px' }}>
      {label}
    </p>
  </div>
)

/* ════════════════════════════════════════════════════════════════
   SIDE DRAWER
════════════════════════════════════════════════════════════════ */
const ProfileDrawer = ({ open, onClose, theme }) => {
  const { user, logoutUser } = useAuth()
  const { clearMood } = useMood()
  const navigate = useNavigate()

  const [stats, setStats]       = useState({ saved: 0, finished: 0, moods: 0, avgProgress: 0 })
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'settings'
  const [pwForm, setPwForm]     = useState({ current: '', newPw: '', confirm: '' })
  const [pwMsg, setPwMsg]       = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [fontPref, setFontPref] = useState(localStorage.getItem('br_font') || 'Georgia')
  const [darkMode] = useState(true)

  useEffect(() => {
    if (open) fetchStats()
  }, [open])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:8000/api/books/shelf', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const readings = res.data.readings || []
      const grouped  = res.data.grouped  || {}
      setStats({
        saved:       readings.length,
        finished:    readings.filter(r => r.progress === 100).length,
        moods:       Object.keys(grouped).length,
        avgProgress: readings.length
          ? Math.round(readings.reduce((s, r) => s + r.progress, 0) / readings.length)
          : 0,
      })
    } catch {}
  }

  const handleLogout = () => {
    logoutUser()
    clearMood()
    onClose()
    navigate('/')
  }

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) { setPwMsg('Fill in all fields'); return }
    if (pwForm.newPw !== pwForm.confirm)  { setPwMsg('Passwords don\'t match'); return }
    if (pwForm.newPw.length < 6)          { setPwMsg('Min 6 characters'); return }
    setPwLoading(true); setPwMsg('')
    try {
      const token = localStorage.getItem('token')
      await axios.patch('http://localhost:8000/api/auth/change-password',
        { currentPassword: pwForm.current, newPassword: pwForm.newPw },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPwMsg('✓ Password changed successfully!')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to change password')
    } finally { setPwLoading(false) }
  }

  const handleFontChange = (font) => {
    setFontPref(font)
    localStorage.setItem('br_font', font)
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'May 2026'

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          style={backdrop}
          onClick={onClose}
          className="drawer-backdrop"
        />
      )}

      {/* Drawer */}
      <div style={{
        ...drawer,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        borderLeft: `1px solid ${theme.cardBorder}`,
      }}>
        <style>{drawerCss}</style>

        {/* Header */}
        <div style={{ ...drawerHeader, borderBottomColor: theme.primary + '22' }}>
          {/* Avatar */}
          <div style={{ ...avatar, background: theme.btnBg, color: theme.btnText,
            boxShadow: `0 0 20px ${theme.glow}` }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...userName, color: theme.text }}>{user?.name || 'Reader'}</p>
            <p style={{ ...userEmail, color: theme.subtext }}>{user?.email}</p>
            <p style={{ ...userSince, color: theme.subtext }}>member since {memberSince}</p>
          </div>
          <button onClick={onClose} style={{ ...closeBtn, color: theme.subtext }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ ...tabs, borderBottomColor: theme.primary + '22' }}>
          {['profile', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                ...tabBtn,
                color: activeTab === tab ? theme.primary : theme.subtext,
                borderBottom: `2px solid ${activeTab === tab ? theme.primary : 'transparent'}`,
              }}>
              {tab === 'profile' ? '👤 Profile' : '⚙️ Settings'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={drawerBody}>

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <>
              {/* Stats */}
              <p style={{ ...sectionLabel, color: theme.subtext }}>YOUR READING STATS</p>
              <div style={statsRow}>
                <StatCard value={stats.saved}       label="saved"    theme={theme}/>
                <StatCard value={stats.finished}    label="finished" theme={theme}/>
                <StatCard value={stats.moods}       label="moods"    theme={theme}/>
                <StatCard value={`${stats.avgProgress}%`} label="avg read" theme={theme}/>
              </div>

              {/* Mood history */}
              <p style={{ ...sectionLabel, color: theme.subtext, marginTop: 20 }}>QUICK LINKS</p>
              {[
                { icon:'📚', label:'My Shelf', action: () => { navigate('/shelf'); onClose() } },
                { icon:'🎭', label:'Change Mood', action: () => { navigate('/mood'); onClose() } },
                { icon:'🔍', label:'Find New Reads', action: () => { navigate('/describe'); onClose() } },
              ].map(({ icon, label, action }) => (
                <button key={label} onClick={action}
                  style={{ ...quickLink, background: theme.card, border: `1px solid ${theme.cardBorder}`, color: theme.text }}
                  className="quick-link">
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontFamily: "'Georgia',serif" }}>{label}</span>
                  <span style={{ color: theme.subtext, fontSize: 14, marginLeft: 'auto' }}>→</span>
                </button>
              ))}

              {/* Spotify */}
              <p style={{ ...sectionLabel, color: theme.subtext, marginTop: 20 }}>SPOTIFY</p>
              <div style={{ ...spotifyCard, background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
                <span style={{ fontSize: 24 }}>🎵</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: theme.text, fontSize: 13, fontWeight: 700, margin: 0 }}>
                    {localStorage.getItem('spotify_token') ? 'Connected' : 'Not connected'}
                  </p>
                  <p style={{ color: theme.subtext, fontSize: 11, fontStyle: 'italic', margin: '2px 0 0' }}>
                    mood-matched playlists while you read
                  </p>
                </div>
                {!localStorage.getItem('spotify_token') && (
                  <span style={{ color: theme.subtext, fontSize: 11, opacity: 0.5 }}>coming soon</span>
                )}
              </div>

              {/* Subscription */}
              <p style={{ ...sectionLabel, color: theme.subtext, marginTop: 20 }}>SUBSCRIPTION</p>
              <div style={{ ...subCard, background: theme.card, border: `1px solid ${theme.primary}44` }}>
                <div>
                  <p style={{ color: theme.text, fontSize: 13, fontWeight: 700, margin: 0 }}>
                    ✦ Free Plan
                  </p>
                  <p style={{ color: theme.subtext, fontSize: 11, fontStyle: 'italic', margin: '3px 0 0' }}>
                    All 9 moods · AI recommendations · shelf
                  </p>
                </div>
                <div style={{ ...proBadge, background: theme.btnBg, color: theme.btnText }}>
                  Pro — soon
                </div>
              </div>

              {/* Logout */}
              <button onClick={handleLogout}
                style={logoutBtn} className="logout-btn">
                🚪 Sign out
              </button>
            </>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <>
              {/* Change password */}
              <p style={{ ...sectionLabel, color: theme.subtext }}>CHANGE PASSWORD</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                {[
                  { key: 'current', label: 'Current password', type: 'password' },
                  { key: 'newPw',   label: 'New password',     type: 'password' },
                  { key: 'confirm', label: 'Confirm new password', type: 'password' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label style={{ ...fieldLabel, color: theme.subtext }}>{label}</label>
                    <input
                      type={type}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ ...settingInput, background: theme.card, border: `1px solid ${theme.cardBorder}`, color: theme.text }}
                      className="setting-input"
                      placeholder="••••••••"
                    />
                  </div>
                ))}
              </div>
              {pwMsg && (
                <p style={{ fontSize: 12, color: pwMsg.includes('✓') ? '#4ade80' : '#f87171',
                  fontStyle: 'italic', marginBottom: 8 }}>
                  {pwMsg}
                </p>
              )}
              <button onClick={handleChangePassword} disabled={pwLoading}
                style={{ ...saveBtn, background: theme.btnBg, color: theme.btnText,
                  boxShadow: `0 4px 16px ${theme.glow}`, opacity: pwLoading ? 0.6 : 1 }}
                className="save-btn">
                {pwLoading ? 'Saving…' : 'Update password'}
              </button>

              {/* Reading font */}
              <p style={{ ...sectionLabel, color: theme.subtext, marginTop: 20 }}>READING FONT</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Georgia', 'Arial', 'Palatino', 'Courier New'].map(font => (
                  <button key={font} onClick={() => handleFontChange(font)}
                    style={{
                      ...fontBtn,
                      background: fontPref === font ? theme.primary : theme.card,
                      color: fontPref === font ? theme.btnText : theme.subtext,
                      border: `1px solid ${fontPref === font ? theme.primary : theme.cardBorder}`,
                      fontFamily: font,
                    }}>
                    {font}
                  </button>
                ))}
              </div>
              <p style={{ color: theme.subtext, fontSize: 11, fontStyle: 'italic', marginTop: 8 }}>
                Applied to your reading environment
              </p>

              {/* Notifications placeholder */}
              <p style={{ ...sectionLabel, color: theme.subtext, marginTop: 20 }}>NOTIFICATIONS</p>
              <div style={{ ...settingRow, background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
                <div>
                  <p style={{ color: theme.text, fontSize: 13, margin: 0 }}>Reading reminders</p>
                  <p style={{ color: theme.subtext, fontSize: 11, margin: '2px 0 0', fontStyle: 'italic' }}>coming soon</p>
                </div>
                <div style={{ ...toggle, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={toggleThumb}/>
                </div>
              </div>

              {/* Danger zone */}
              <p style={{ ...sectionLabel, color: '#f87171', marginTop: 20 }}>ACCOUNT</p>
              <button onClick={handleLogout}
                style={logoutBtn} className="logout-btn">
                🚪 Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN NAVBAR COMPONENT
════════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user } = useAuth()
  const { mood } = useMood()
  const navigate  = useNavigate()
  const location  = useLocation()
  const theme = THEMES[mood] || THEMES.cozy

  // Don't show on auth/landing pages
  const hiddenRoutes = ['/', '/login', '/signup', '/mood-entry']
  if (hiddenRoutes.includes(location.pathname)) return null
  if (!user) return null

  const navItems = [
    { icon: '🏠', label: 'Home',   path: '/mood'    },
    { icon: '🔍', label: 'Reads',  path: '/describe' },
    { icon: '📚', label: 'Shelf',  path: '/shelf'   },
    { icon: '👤', label: 'Profile', action: () => setDrawerOpen(true) },
  ]

  return (
    <>
      <style>{navCss}</style>

      {/* Floating avatar — top right */}
      <button
        onClick={() => setDrawerOpen(true)}
        style={{
          ...avatarFloat,
          background: theme.btnBg,
          boxShadow: `0 4px 20px ${theme.glow}`,
          color: theme.btnText,
        }}
        className="avatar-float"
        title={user?.name}
      >
        {getInitials(user?.name)}
      </button>

      {/* Bottom navigation bar */}
      <div style={{
        ...bottomNav,
        background: 'rgba(8,6,20,0.88)',
        borderTop: `1px solid ${theme.primary}22`,
        backdropFilter: 'blur(20px)',
      }}>
        {navItems.map(({ icon, label, path, action }) => {
          const isActive = path && location.pathname === path
          return (
            <button
              key={label}
              onClick={action || (() => navigate(path))}
              style={{
                ...navItem,
                color: isActive ? theme.primary : 'rgba(255,255,255,0.35)',
              }}
              className="nav-item"
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{
                fontSize: 10, letterSpacing: '0.5px',
                color: isActive ? theme.primary : 'rgba(255,255,255,0.3)',
                fontWeight: isActive ? 700 : 400,
              }}>
                {label}
              </span>
              {isActive && (
                <div style={{ ...activeDot, background: theme.primary }}/>
              )}
            </button>
          )
        })}
      </div>

      {/* Profile drawer */}
      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        theme={theme}
      />
    </>
  )
}

/* ── Styles ──────────────────────────────────────────────────────── */
const backdrop = {
  position: 'fixed', inset: 0, zIndex: 200,
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)',
}
const drawer = {
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: 320, zIndex: 201,
  background: 'rgba(10,8,22,0.97)',
  backdropFilter: 'blur(24px)',
  display: 'flex', flexDirection: 'column',
  transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
  overflowY: 'auto',
  fontFamily: "'Georgia',serif",
}
const drawerHeader = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '20px 16px 16px',
  borderBottom: '1px solid', flexShrink: 0,
}
const avatar = {
  width: 48, height: 48, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 16, fontWeight: 800, flexShrink: 0,
  fontFamily: "'Georgia',serif",
}
const userName  = { fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: '0.3px' }
const userEmail = { fontSize: 11, margin: '2px 0 0', opacity: 0.6 }
const userSince = { fontSize: 10, margin: '2px 0 0', opacity: 0.4, letterSpacing: '0.5px', fontStyle: 'italic' }
const closeBtn  = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5, padding: '4px' }

const tabs   = { display: 'flex', borderBottom: '1px solid', flexShrink: 0 }
const tabBtn = {
  flex: 1, padding: '12px', background: 'transparent', border: 'none',
  cursor: 'pointer', fontSize: 12, letterSpacing: '0.5px',
  fontFamily: "'Georgia',serif", transition: 'all 0.2s ease',
}

const drawerBody    = { padding: '16px', overflowY: 'auto', flex: 1 }
const sectionLabel  = { fontSize: 9.5, letterSpacing: '2px', marginBottom: 10, display: 'block' }
const statsRow      = { display: 'flex', gap: 8, marginBottom: 4 }

const quickLink = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
  padding: '11px 14px', borderRadius: 12,
  marginBottom: 8, cursor: 'pointer', border: '1px solid',
  transition: 'all 0.2s ease', textAlign: 'left',
}
const spotifyCard = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12 }
const subCard     = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12 }
const proBadge    = { padding: '4px 10px', borderRadius: 50, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.5px' }
const logoutBtn   = {
  width: '100%', marginTop: 16, padding: '12px',
  background: 'rgba(239,68,68,0.08)',
  border: '1px solid rgba(239,68,68,0.2)',
  borderRadius: 50, color: '#f87171',
  fontSize: 13, cursor: 'pointer',
  fontFamily: "'Georgia',serif", letterSpacing: '0.5px',
  transition: 'all 0.22s ease',
}

const fieldLabel   = { display: 'block', fontSize: 10.5, letterSpacing: '1.5px', marginBottom: 6 }
const settingInput = {
  width: '100%', padding: '10px 12px',
  borderRadius: 10, fontSize: 13,
  outline: 'none', fontFamily: "'Georgia',serif",
  boxSizing: 'border-box', transition: 'all 0.2s',
}
const saveBtn = {
  width: '100%', padding: '11px', border: 'none',
  borderRadius: 50, fontSize: 13, fontWeight: 700,
  fontFamily: "'Georgia',serif", cursor: 'pointer',
  letterSpacing: '0.5px', transition: 'all 0.22s ease',
}
const fontBtn = {
  padding: '7px 14px', borderRadius: 50, fontSize: 12,
  cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid',
}
const settingRow = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 14px', borderRadius: 12,
}
const toggle      = { width: 36, height: 20, borderRadius: 50, padding: 2, display: 'flex', alignItems: 'center' }
const toggleThumb = { width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }

/* Bottom nav */
const bottomNav = {
  position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'space-around',
  padding: '8px 0 12px',
}
const navItem = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: '6px 16px', position: 'relative',
  transition: 'all 0.2s ease', minWidth: 60,
}
const activeDot = {
  position: 'absolute', bottom: -4, left: '50%',
  transform: 'translateX(-50%)',
  width: 4, height: 4, borderRadius: '50%',
}
const avatarFloat = {
  position: 'fixed', top: 16, right: 16, zIndex: 150,
  width: 40, height: 40, borderRadius: '50%',
  border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, fontWeight: 800,
  fontFamily: "'Georgia',serif",
  transition: 'all 0.25s ease',
}

const navCss = `
  .drawer-backdrop { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .avatar-float:hover { transform:scale(1.08); }
  .nav-item:hover { opacity:0.85; transform:translateY(-1px); }
  .quick-link:hover { opacity:0.85; transform:translateX(2px); }
  .logout-btn:hover { background:rgba(239,68,68,0.15) !important; }
  .save-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .setting-input:focus { outline:none; }
`

const drawerCss = `
  * { box-sizing:border-box; }
  .setting-input:focus { opacity:0.9; }
`