import Room from '../models/Room.js'
import Hotel from '../models/Hotel.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// Get relevant hotel data for context
const getHotelContext = async () => {
    try {
        // Lấy tất cả phòng, không filter isAvailable để có nhiều data hơn
        const [rooms, hotels, discountedRooms] = await Promise.all([
            Room.find().limit(10).populate('hotel').lean(),
            Hotel.find().limit(5).lean(),
            Room.find({ discount: { $gt: 0 } }).limit(5).populate('hotel').lean()
        ])

        console.log(`📊 Chatbot Data: ${rooms.length} rooms, ${hotels.length} hotels, ${discountedRooms.length} discounted`)

        let context = '=== DỮ LIỆU KHÁCH SẠN (THỰC TẾ - CẬP NHẬT REAL-TIME) ===\n\n'

        // Hotels info
        if (hotels.length > 0) {
            context += '📍 CÁC KHÁCH SẠN:\n'
            hotels.forEach(hotel => {
                context += `- ${hotel.name}\n`
                context += `  Địa chỉ: ${hotel.address || 'Chưa cập nhật'}, ${hotel.city || 'Chưa rõ'}\n`
                context += `  Trạng thái: ${hotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}\n`
                if (hotel.amenities?.length > 0) {
                    context += `  Tiện ích: ${hotel.amenities.join(', ')}\n`
                }
            })
            context += '\n'
        } else {
            context += '⚠️ Chưa có khách sạn nào trong hệ thống\n\n'
        }

        // Available rooms
        if (rooms.length > 0) {
            context += '🏨 CÁC PHÒNG (GIÁ CẬP NHẬT MỚI NHẤT):\n'
            rooms.forEach(room => {
                const roomPrice = room.pricePerNight || room.price || 0;
                const roomType = room.roomType || room.name || 'Phòng';

                context += `- ${roomType} (${room.hotel?.name || 'Khách sạn'})\n`
                context += `  💰 Giá gốc: $${roomPrice.toLocaleString('en-US')}/đêm\n`

                if (room.discount > 0) {
                    const discountedPrice = roomPrice * (1 - room.discount / 100)
                    context += `  🎉 GIẢM GIÁ ${room.discount}%: $${Math.round(discountedPrice).toLocaleString('en-US')}/đêm\n`
                    context += `  💵 Tiết kiệm: $${Math.round(roomPrice - discountedPrice).toLocaleString('en-US')}\n`
                }

                context += `  📍 Trạng thái: ${room.isAvailable ? '✅ Còn phòng' : '❌ Hết phòng'}\n`

                if (room.amenities?.length > 0) {
                    context += `  ✨ Tiện ích: ${room.amenities.join(', ')}\n`
                }
            })
            context += '\n'
        } else {
            context += '⚠️ Chưa có phòng nào trong hệ thống\n\n'
        }

        // Discounted rooms summary
        if (discountedRooms.length > 0) {
            context += `🎉 CÓ ${discountedRooms.length} PHÒNG ĐANG GIẢM GIÁ!\n\n`
        }

        context += '=== CHÍNH SÁCH ===\n'
        context += '• Hủy trước 24h: Hoàn 100%\n'
        context += '• Hủy trong 24h: Hoàn 50%\n'
        context += '• Thanh toán: Thẻ, chuyển khoản, tiền mặt\n'
        context += '• Check-in: 14:00 | Check-out: 12:00\n'
        context += '• Hotline: 1900-xxxx | Email: support@hotel.com\n'

        return context
    } catch (error) {
        console.error('❌ Error getting hotel context:', error)
        return '⚠️ Lỗi kết nối database. Không thể lấy thông tin khách sạn.'
    }
}

// Gemini AI chatbot response
const getChatbotResponse = async (message, conversationHistory = []) => {
    try {
        // Get real-time hotel data
        const hotelContext = await getHotelContext()

        // Build conversation history text
        let conversationText = ''
        conversationHistory.forEach(msg => {
            const role = msg.type === 'user' ? 'Người dùng' : 'Trợ lý'
            conversationText += `${role}: ${msg.text}\n`
        })

        // Build prompt for Gemini
        const prompt = `Bạn là trợ lý ảo thông minh của hệ thống đặt phòng khách sạn.

NHIỆM VỤ:
- Trả lời câu hỏi về khách sạn, phòng, giá cả DỰA TRÊN DỮ LIỆU BÊN DƯỚI
- Gợi ý phòng phù hợp với nhu cầu
- Hướng dẫn đặt phòng, thanh toán, hủy phòng
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn

${hotelContext}

QUY TẮC QUAN TRỌNG:
1. BẮT BUỘC sử dụng dữ liệu thực tế ở trên để trả lời
2. KHÔNG BAO GIỜ nói "không có dữ liệu" nếu có phòng/khách sạn ở trên
3. Nếu có phòng, HÃY GIỚI THIỆU CỤ THỂ với tên, giá CHÍNH XÁC, tiện ích
4. Khi nói về giá, PHẢI dùng số liệu CHÍNH XÁC từ dữ liệu trên
5. Trả lời ngắn gọn, dễ hiểu, có emoji
6. Kết thúc bằng câu hỏi để tiếp tục hội thoại

${conversationText ? `LỊCH SỬ:\n${conversationText}\n` : ''}KHÁCH: ${message}

TRỢ LÝ:`

        // Call Gemini API
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        // KHÔNG log toàn bộ error object để tránh leak API key
        console.error('Gemini API Error:', error.message || 'Unknown error')

        // Fallback to basic response if Gemini fails
        if (error.message?.includes('API key')) {
            return 'Xin lỗi, hệ thống AI chưa được cấu hình. Vui lòng liên hệ hotline 1900-xxxx để được hỗ trợ trực tiếp.'
        }

        return 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ qua hotline 1900-xxxx.'
    }
}

export const handleChatMessage = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' })
        }

        const reply = await getChatbotResponse(message, conversationHistory || [])

        res.json({ reply })
    } catch (error) {
        // KHÔNG log toàn bộ error để tránh leak thông tin nhạy cảm
        console.error('Chatbot error:', error.message || 'Unknown error')
        res.status(500).json({
            error: 'Internal server error',
            reply: 'Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ.'
        })
    }
}
