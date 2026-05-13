import express from 'express'
import {
  recommendBooks,
  saveBook,
  getShelf,
  updateProgress,
  removeFromShelf,
} from '../controllers/bookController.js'
import { protect } from '../middleware/authMiddleware.js'
 
const router = express.Router()
 
// All routes require authentication
router.post('/recommend',        protect, recommendBooks)
router.post('/save',             protect, saveBook)
router.get('/shelf',             protect, getShelf)
router.patch('/progress/:id',    protect, updateProgress)
router.delete('/shelf/:id',      protect, removeFromShelf)
 
export default router