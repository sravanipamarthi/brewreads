import { createContext, useContext, useState } from 'react'
 
const MoodContext = createContext()
 
export const MoodProvider = ({ children }) => {
  const [mood, setMood]               = useState(null)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [spotifyToken, setSpotifyToken] = useState(
    localStorage.getItem('spotify_token') || null
  )
 
  const clearMood = () => {
    setMood(null)
    setMusicEnabled(false)
  }
 
  const saveSpotifyToken = (token) => {
    setSpotifyToken(token)
    localStorage.setItem('spotify_token', token)
  }
 
  const clearSpotify = () => {
    setSpotifyToken(null)
    localStorage.removeItem('spotify_token')
  }
 
  return (
    <MoodContext.Provider value={{
      mood, setMood,
      musicEnabled, setMusicEnabled,
      spotifyToken, saveSpotifyToken, clearSpotify,
      clearMood,
    }}>
      {children}
    </MoodContext.Provider>
  )
}
 
export const useMood = () => {
  const ctx = useContext(MoodContext)
  if (!ctx) throw new Error('useMood must be used within MoodProvider')
  return ctx
}