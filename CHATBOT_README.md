# 🤖 AI Chatbot với Google Gemini

Chatbot thông minh sử dụng Google Gemini AI để hỗ trợ khách hàng đặt phòng khách sạn.

## ✨ Tính năng

- 🧠 **AI thông minh**: Hiểu ngôn ngữ tự nhiên, không cần từ khóa cố định
- 💬 **Nhớ ngữ cảnh**: Bot nhớ lịch sử hội thoại để trả lời chính xác
- 📊 **Dữ liệu real-time**: Lấy thông tin phòng, giá, ưu đãi từ database
- 🆓 **Hoàn toàn miễn phí**: Sử dụng Google Gemini API
- 🇻🇳 **Tiếng Việt tốt**: Hỗ trợ tiếng Việt xuất sắc

## 🚀 Setup (5 phút)

### Bước 1: Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập Google
3. Click "Create API Key"
4. Copy API key

### Bước 2: Cấu hình

API key đã được thêm vào `server/.env`:

```env
GEMINI_API_KEY=AIzaSyDl1CAbxZcVmeFN-G4iUAUqG14O2JzMc4U
```

### Bước 3: Chạy ứng dụng

```bash
# Terminal 1: Server
cd server
npm start

# Terminal 2: Client
cd client
npm run dev
```

## 💬 Cách sử dụng

1. Mở ứng dụng trong trình duyệt
2. Click vào icon chat ở góc dưới bên phải
3. Bắt đầu trò chuyện!

### Ví dụ câu hỏi

**Đơn giản:**
- "Xin chào"
- "Có phòng nào không?"
- "Giá phòng bao nhiêu?"

**Phức tạp (AI mới hiểu được):**
- "Tôi cần phòng cho 2 người, giá dưới 1 triệu, gần biển"
- "So sánh phòng Standard và Deluxe"
- "Phòng nào đang giảm giá nhiều nhất?"

**Hội thoại liên tục:**
```
User: Có phòng nào không?
Bot: [Liệt kê 3 phòng]
User: Phòng đầu tiên giá bao nhiêu?  ← Bot nhớ context
Bot: [Trả lời về phòng đó]
```

## 📁 Cấu trúc code

```
server/
├── controllers/
│   └── chatbotControllersGemini.js  # Logic AI chatbot
├── routes/
│   └── chatbotRoutes.js             # API routes
└── .env                              # Gemini API key

client/
└── src/
    └── components/
        └── Chatbot.jsx               # UI chatbot
```

## 🔧 Tùy chỉnh

### Thay đổi system prompt

Mở `server/controllers/chatbotControllersGemini.js` và sửa phần prompt:

```javascript
const prompt = `Bạn là trợ lý ảo... [tùy chỉnh ở đây]`
```

### Thay đổi số tin nhắn nhớ

```javascript
conversationHistory.slice(-6)  // Nhớ 6 tin nhắn, có thể tăng lên
```

### Thay đổi giao diện

Mở `client/src/components/Chatbot.jsx`:
- Màu sắc: Đổi `bg-blue-600` thành màu khác
- Kích thước: Đổi `w-96 h-[600px]`
- Vị trí: Đổi `bottom-6 right-6`

## 💰 Chi phí

**Hoàn toàn miễn phí!**
- Không cần thẻ tín dụng
- 60 requests/phút
- Không giới hạn tổng số request

## 🐛 Troubleshooting

### Bot không trả lời

**Kiểm tra:**
1. Server đang chạy?
2. GEMINI_API_KEY đã đúng?
3. Console có lỗi không?
4. Database có dữ liệu không?

**Fix:**
```bash
# Restart server
cd server
npm start
```

### Lỗi "API key not valid"

**Nguyên nhân:** API key sai hoặc chưa được kích hoạt

**Fix:**
1. Kiểm tra key trong .env
2. Tạo key mới tại https://makersuite.google.com/app/apikey
3. Restart server

### Bot trả lời chậm

**Bình thường:** Gemini có thể mất 2-3 giây

**Nếu quá chậm:**
- Kiểm tra internet
- Kiểm tra database query

## 📊 Monitoring

### Xem logs

```bash
# Server logs
cd server
npm start

# Xem API calls trong console
```

### Metrics quan trọng

- Response time: 2-3 giây
- Success rate: >95%
- User satisfaction: Thu thập feedback

## 🎯 Roadmap

- [ ] Voice chat
- [ ] Multi-language
- [ ] Image understanding
- [ ] Booking trực tiếp qua chat
- [ ] Analytics dashboard

## 📚 Tài liệu

- [Google Gemini API](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

## 💡 Tips

1. **Test kỹ**: Test với nhiều câu hỏi khác nhau
2. **Thu thập feedback**: Thêm nút "Hữu ích/Không hữu ích"
3. **Cải thiện prompt**: Dựa trên feedback để optimize
4. **Monitor usage**: Theo dõi số lượng request
5. **Cache responses**: Cache câu hỏi phổ biến

---

**Chatbot đã sẵn sàng! Chúc bạn thành công! 🎉**
