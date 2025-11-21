import express from 'express'
import { handleChatMessage } from '../controllers/chatbotControllersGemini.js'

const chatbotRouter = express.Router()

chatbotRouter.post('/message', handleChatMessage)

export default chatbotRouter
