import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { getUserData, storeRecentSearchedCities } from '../controllers/userControllers.js'

const userRouter = express.Router()
userRouter.get('/', protect, getUserData)
userRouter.get('/store-recent-search', protect, storeRecentSearchedCities)
// Sync route removed - no longer needed with JWT auth

export default userRouter;