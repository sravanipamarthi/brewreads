import express from 'express'
import { signup, login, changePassword } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.patch('/change-password', protect, changePassword)

export default router