import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MoodSelect from './pages/MoodSelect'
import MoodEntryDirect from './pages/MoodEntryDirect'
import Describe from './pages/Describe'
import Books from './pages/Books'
import Shelf from './pages/Shelf'
import Reading from './pages/Reading'

function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#06040e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(200,170,110,0.6)',
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      letterSpacing: '3px',
    }}>
      ☕ &nbsp; opening your world...
    </div>
  )

  return (
    <>
      <Navbar />
      <Routes>
      {/* Landing — only for logged OUT users. Logged in → go to mood */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to="/mood" />} />

      {/* Auth routes */}
      <Route path="/login"   element={!user ? <Login />  : <Navigate to="/mood" />} />
      <Route path="/signup"  element={!user ? <Signup /> : <Navigate to="/mood" />} />

      {/* Protected routes */}
      <Route path="/mood"       element={user ? <MoodSelect />      : <Navigate to="/login" />} />
      <Route path="/mood-entry" element={user ? <MoodEntryDirect /> : <Navigate to="/login" />} />
      <Route path="/describe"   element={user ? <Describe />        : <Navigate to="/login" />} />
      <Route path="/books"      element={user ? <Books />           : <Navigate to="/login" />} />
      <Route path="/reading"    element={user ? <Reading />         : <Navigate to="/login" />} />
      <Route path="/shelf"      element={user ? <Shelf />           : <Navigate to="/login" />} />
    </Routes>
    </>
  )
}

export default App