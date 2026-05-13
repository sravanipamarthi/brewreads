import mongoose from 'mongoose'
 
const ReadingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy','melancholy','cozy','curious','adventurous','calm','romantic','focused','stressed'],
  },
  title:       { type: String, required: true },
  authors:     [{ type: String }],
  thumbnail:   { type: String, default: null },
  description: { type: String, default: '' },
  previewLink: { type: String, default: null },
  infoLink:    { type: String, default: null },
  googleId:    { type: String, default: null },
  type:        { type: String, enum: ['book', 'article'], default: 'book' },
  moodReason:  { type: String, default: '' },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  savedAt:     { type: Date, default: Date.now },
}, { timestamps: true })
 
// Prevent duplicate saves (same user + title + mood)
ReadingSchema.index({ user: 1, title: 1, mood: 1 }, { unique: true })
 
export default mongoose.model('Reading', ReadingSchema)