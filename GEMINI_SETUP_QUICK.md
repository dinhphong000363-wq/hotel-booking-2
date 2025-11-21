# 🚀 Setup Gemini AI Chatbot (5 phút)

## ✅ Đã cài đặt xong

Chatbot đã được cấu hình sử dụng **Google Gemini AI** (hoàn toàn miễn phí!)

## 📝 Chỉ cần 3 bước

### Bước 1: Lấy Gemini API Key (2 phút)

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Click nút **"Create API Key"**
4. Copy API key (dạng: `AIzaSy...`)

### Bước 2: Thêm vào .env (1 phút)

Mở file `server/.env` và thay thế:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Thành:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Bước 3: Restart server (1 phút)

```bash
cd server
npm start
```

## 🎉 Xong rồi!

Mở ứng dụng và test chatbot:

**Thử các câu hỏi:**
- "Xin chào"
- "Tôi muốn tìm phòng cho 2 người"
- "Có ưu đãi gì không?"
- "Phòng nào đang giảm giá nhiều nhất?"

## 💰 Chi phí

**HOÀN TOÀN MIỄN PHÍ!**
- Không cần thẻ tín dụng
- 60 requests/phút
- Không giới hạn số lượng request

## 🔄 Muốn đổi sang OpenAI?

Mở `server/routes/chatbotRoutes.js` và đổi:

```javascript
// Từ
import { handleChatMessage } from '../controllers/chatbotControllersGemini.js'

// Thành
import { handleChatMessage } from '../controllers/chatbotControllers.js'
```

Sau đó thêm OpenAI key vào .env và restart.

## 📊 So sánh

| Tính năng | Gemini | OpenAI |
|-----------|--------|--------|
| Chi phí | **Miễn phí** | $0.50/1M tokens |
| Setup | Không cần thẻ | Cần thẻ tín dụng |
| Chất lượng | Tốt | Rất tốt |
| Rate limit | 60/phút | Tùy plan |

## 🐛 Troubleshooting

**Lỗi: "API key not valid"**
- Kiểm tra key đã copy đúng chưa
- Đảm bảo không có khoảng trắng thừa
- Restart server

**Bot không trả lời**
- Kiểm tra console có lỗi không
- Kiểm tra database có dữ liệu không
- Kiểm tra VITE_BACKEND_URL trong client/.env

**Bot trả lời chậm**
- Bình thường, Gemini có thể mất 2-3 giây
- Nếu quá chậm, kiểm tra internet

## 💡 Tips

1. Gemini hoạt động tốt nhất với tiếng Việt
2. Rate limit 60 req/phút đủ cho hầu hết use case
3. Nếu cần nhiều hơn, có thể tạo nhiều API key
4. Gemini Pro miễn phí, Gemini Ultra có phí

---

**Chúc bạn thành công! 🎊**
