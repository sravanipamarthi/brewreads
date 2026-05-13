import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
 
dotenv.config()
 
const app = express()
app.use(cors())
app.use(express.json())
 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected! 🗄️'))
  .catch((err) => console.log('MongoDB connection error:', err))
 
app.get('/', (req, res) => {
  res.json({ message: 'BrewReads API is running! ☕📚' })
})
 
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
 
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`)
})