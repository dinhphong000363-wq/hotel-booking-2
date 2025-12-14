import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn về khách sạn và đặt phòng?' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = input.trim()
        const newMessages = [...messages, { type: 'user', text: userMessage }]
        setMessages(newMessages)
        setInput('')
        setIsTyping(true)

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/message`, {
                message: userMessage,
                conversationHistory: messages
            })

            setMessages(prev => [...prev, { type: 'bot', text: response.data.reply }])
        } catch (error) {
            console.error('Chatbot error:', error)
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline 1900-xxxx.'
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const quickActions = [
        { label: 'Tìm phòng', action: 'Tôi muốn tìm phòng' },
        { label: 'Giá phòng', action: 'Cho tôi biết về giá phòng' },
        { label: 'Ưu đãi', action: 'Có ưu đãi gì không?' },
        { label: 'Liên hệ', action: 'Làm sao để liên hệ?' }
    ]

    const handleQuickAction = (action) => {
        setInput(action)
    }

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Open chatbot"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">Trợ lý ảo</h3>
                                <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.type === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 bg-white border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((qa, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(qa.action)}
                                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    {qa.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full p-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Chatbot
