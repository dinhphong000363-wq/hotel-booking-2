import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { getUserData, storeRecentSearchedCities } from '../controllers/userControllers.js'
import { syncCurrentUser } from '../controllers/syncUserController.js'

const userRouter = express.Router()
userRouter.get('/', protect, getUserData)
userRouter.get('/store-recent-search', protect, storeRecentSearchedCities)
userRouter.post('/sync', syncCurrentUser) // ✅ Manual sync endpoint (no protect middleware)

export default userRouter;