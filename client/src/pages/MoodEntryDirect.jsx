import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMood } from '../context/MoodContext'
import MoodEntry from './MoodEntry'

/* ════════════════════════════════════════════════════════════════
   MoodEntryDirect
   
   Shown after login when user already picked a mood on Landing.
   Reads the pending mood from sessionStorage and shows MoodEntry.
   If no pending mood → redirects to MoodSelect.
════════════════════════════════════════════════════════════════ */
export default function MoodEntryDirect() {
  const navigate = useNavigate()
  const { setMood } = useMood()
  const [mood, setLocalMood] = useState(null)

  useEffect(() => {
    const pending = sessionStorage.getItem('brewreads_pending_mood')
    if (pending) {
      setLocalMood(pending)
    } else {
      // No pending mood — go to MoodSelect
      navigate('/mood')
    }
  }, [])

  const handleComplete = () => {
    sessionStorage.removeItem('brewreads_pending_mood')
    navigate('/describe')
  }

  if (!mood) return null

  return <MoodEntry mood={mood} onComplete={handleComplete} />
}