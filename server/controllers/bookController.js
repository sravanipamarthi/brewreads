import Groq from 'groq-sdk'
import axios from 'axios'
import Reading from '../models/Reading.js'
 
// Initialize lazily so missing key doesn't crash on startup
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY })
 
/* ══════════════════════════════════════════════════════════════════
   HELPER — Search Google Books API
   ══════════════════════════════════════════════════════════════════ */
const searchGoogleBooks = async (query, maxResults = 5) => {
  try {
    const res = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults,
        printType: 'books',
        orderBy: 'relevance',
        langRestrict: 'en',
      },
    })
 
    const items = res.data.items || []
    return items.map(item => {
      const info = item.volumeInfo
      return {
        googleId:    item.id,
        title:       info.title || 'Unknown Title',
        authors:     info.authors || ['Unknown Author'],
        description: info.description?.slice(0, 300) || '',
        thumbnail:   info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
        previewLink: info.previewLink || null,
        infoLink:    info.infoLink || null,
        pageCount:   info.pageCount || null,
        categories:  info.categories || [],
        rating:      info.averageRating || null,
        type:        'book',
      }
    })
  } catch (err) {
    console.error('Google Books API error:', err.message)
    return []
  }
}
 
/* ══════════════════════════════════════════════════════════════════
   POST /api/books/recommend
   Body: { mood, description }
   Returns: { aiNote, books: [...] }
   ══════════════════════════════════════════════════════════════════ */
export const recommendBooks = async (req, res) => {
  try {
    const { mood, description } = req.body
 
    if (!mood || !description) {
      return res.status(400).json({ message: 'Mood and description are required' })
    }
 
    /* ── Step 1: Ask Groq to generate search queries + mood reasons ── */
    const groqPrompt = `
You are BrewReads, a deeply empathetic AI librarian who matches books and articles to people's exact emotional state.
 
The user's current mood: "${mood}"
What they're looking for: "${description}"
 
Your task:
1. Understand the emotional need behind their description
2. Generate 4-5 SPECIFIC book/article recommendations
3. For each, write a short personal "mood reason" — WHY this book matches their exact mood and description right now. Be poetic and personal, not generic. Max 1-2 sentences.
4. Also generate a short personal note FROM YOU to the user (2-3 sentences) about their reading session today.
 
Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
{
  "aiNote": "your personal note to the user here",
  "recommendations": [
    {
      "searchQuery": "specific book title author name",
      "title": "Book Title",
      "author": "Author Name",
      "moodReason": "personal poetic reason why this matches their mood",
      "type": "book"
    }
  ]
}
 
Rules:
- searchQuery must be specific enough for Google Books to find it
- moodReason must feel personal, poetic, NOT generic ("this is a great book" is NOT acceptable)
- Mix books and articles (type: "book" or "article")
- Choose real, existing books that actually match the mood
- aiNote should feel warm, like a friend who truly understood what they needed
`
 
    const groqRes = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: groqPrompt }],
      temperature: 0.8,
      max_tokens: 1000,
    })
 
    const raw = groqRes.choices[0]?.message?.content?.trim()
 
    /* ── Step 2: Parse Groq response ── */
    let parsed
    try {
      // Strip any accidental markdown fences
      const clean = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return res.status(500).json({ message: 'AI response parsing failed. Please try again.' })
    }
 
    const { aiNote, recommendations } = parsed
 
    /* ── Step 3: Fetch real book data from Google Books ── */
    const bookPromises = recommendations.map(async (rec) => {
      const results = await searchGoogleBooks(rec.searchQuery, 1)
      if (results.length > 0) {
        return {
          ...results[0],
          moodReason: rec.moodReason,
          type: rec.type || 'book',
          // Use Groq's title/author as fallback
          title:   results[0].title   || rec.title,
          authors: results[0].authors || [rec.author],
        }
      }
      // Fallback if Google Books doesn't find it
      return {
        title:       rec.title,
        authors:     [rec.author],
        description: '',
        thumbnail:   null,
        previewLink: null,
        infoLink:    `https://www.google.com/search?q=${encodeURIComponent(rec.title + ' ' + rec.author)}`,
        moodReason:  rec.moodReason,
        type:        rec.type || 'book',
      }
    })
 
    const books = await Promise.all(bookPromises)
 
    /* ── Step 4: Return everything ── */
    return res.json({
      aiNote,
      books,
      mood,
      description,
    })
 
  } catch (err) {
    console.error('Recommend error:', err)
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}
 
/* ══════════════════════════════════════════════════════════════════
   POST /api/books/save
   Body: { mood, title, authors, thumbnail, description,
           previewLink, infoLink, type, moodReason }
   ══════════════════════════════════════════════════════════════════ */
export const saveBook = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      mood, title, authors, thumbnail,
      description, previewLink, infoLink,
      type, moodReason,
    } = req.body
 
    // Check if already saved
    const existing = await Reading.findOne({ user: userId, title, mood })
    if (existing) {
      return res.status(400).json({ message: 'Already saved to your shelf!' })
    }
 
    const reading = await Reading.create({
      user:        userId,
      mood,
      title,
      authors:     Array.isArray(authors) ? authors : [authors],
      thumbnail,
      description,
      previewLink,
      infoLink,
      type:        type || 'book',
      moodReason,
      progress:    0,
      savedAt:     new Date(),
    })
 
    res.status(201).json({ message: 'Saved to your shelf!', reading })
  } catch (err) {
    console.error('Save book error:', err)
    res.status(500).json({ message: 'Could not save book.' })
  }
}
 
/* ══════════════════════════════════════════════════════════════════
   GET /api/books/shelf
   Returns all saved books for the logged-in user
   ══════════════════════════════════════════════════════════════════ */
export const getShelf = async (req, res) => {
  try {
    const userId = req.user.id
    const readings = await Reading.find({ user: userId })
      .sort({ savedAt: -1 })
 
    // Group by mood
    const grouped = {}
    readings.forEach(r => {
      if (!grouped[r.mood]) grouped[r.mood] = []
      grouped[r.mood].push(r)
    })
 
    res.json({ readings, grouped })
  } catch (err) {
    console.error('Get shelf error:', err)
    res.status(500).json({ message: 'Could not load shelf.' })
  }
}
 
/* ══════════════════════════════════════════════════════════════════
   PATCH /api/books/progress/:id
   Body: { progress } (0-100)
   ══════════════════════════════════════════════════════════════════ */
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params
    const { progress } = req.body
    const userId = req.user.id
 
    const reading = await Reading.findOneAndUpdate(
      { _id: id, user: userId },
      { progress: Math.min(100, Math.max(0, progress)) },
      { new: true }
    )
 
    if (!reading) return res.status(404).json({ message: 'Book not found on shelf' })
    res.json({ message: 'Progress updated', reading })
  } catch (err) {
    res.status(500).json({ message: 'Could not update progress.' })
  }
}
 
/* ══════════════════════════════════════════════════════════════════
   DELETE /api/books/shelf/:id
   ══════════════════════════════════════════════════════════════════ */
export const removeFromShelf = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
 
    await Reading.findOneAndDelete({ _id: id, user: userId })
    res.json({ message: 'Removed from shelf' })
  } catch (err) {
    res.status(500).json({ message: 'Could not remove book.' })
  }
}