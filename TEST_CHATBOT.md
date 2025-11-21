# 🧪 Test Cases cho AI Chatbot

## Các câu hỏi để test chatbot

### 1️⃣ Greeting & Basic

```
✅ "Xin chào"
✅ "Hi"
✅ "Hello"
✅ "Chào bạn"
```

**Kỳ vọng**: Bot chào lại và giới thiệu chức năng

---

### 2️⃣ Tìm phòng đơn giản

```
✅ "Tôi muốn tìm phòng"
✅ "Có phòng nào không?"
✅ "Cho tôi xem phòng"
✅ "Phòng nào đang trống?"
```

**Kỳ vọng**: Bot liệt kê phòng có sẵn với giá, sức chứa

---

### 3️⃣ Tìm phòng với điều kiện (AI mới hiểu được)

```
✅ "Tôi cần phòng cho 2 người, giá dưới 1 triệu"
✅ "Phòng nào rộng và có view đẹp?"
✅ "Tìm phòng gần biển cho gia đình 4 người"
✅ "Phòng có bể bơi riêng không?"
✅ "Phòng VIP nhất là phòng nào?"
```

**Kỳ vọng**: Bot phân tích yêu cầu và gợi ý phòng phù hợp

---

### 4️⃣ Giá cả

```
✅ "Giá phòng bao nhiêu?"
✅ "Phòng rẻ nhất giá bao nhiêu?"
✅ "Cho tôi biết bảng giá"
✅ "So sánh giá các phòng"
```

**Kỳ vọng**: Bot cung cấp thông tin giá chi tiết

---

### 5️⃣ Ưu đãi & Khuyến mãi

```
✅ "Có ưu đãi gì không?"
✅ "Phòng nào đang giảm giá?"
✅ "Khuyến mãi tháng này là gì?"
✅ "Giảm giá bao nhiêu phần trăm?"
```

**Kỳ vọng**: Bot liệt kê phòng giảm giá với % và giá sau giảm

---

### 6️⃣ Đặt phòng

```
✅ "Làm sao để đặt phòng?"
✅ "Quy trình booking như thế nào?"
✅ "Tôi muốn đặt phòng"
✅ "Đặt phòng có khó không?"
```

**Kỳ vọng**: Bot hướng dẫn từng bước đặt phòng

---

### 7️⃣ Thanh toán

```
✅ "Thanh toán như thế nào?"
✅ "Có nhận tiền mặt không?"
✅ "Chấp nhận thẻ tín dụng không?"
✅ "Có thể trả sau không?"
```

**Kỳ vọng**: Bot liệt kê các phương thức thanh toán

---

### 8️⃣ Chính sách hủy

```
✅ "Hủy phòng như thế nào?"
✅ "Hủy có được hoàn tiền không?"
✅ "Nếu tôi hủy sau 12 giờ thì sao?"
✅ "Chính sách hủy phòng ra sao?"
```

**Kỳ vọng**: Bot giải thích chính sách hủy chi tiết

---

### 9️⃣ Tiện ích & Dịch vụ

```
✅ "Khách sạn có những tiện ích gì?"
✅ "Có bể bơi không?"
✅ "Có wifi miễn phí không?"
✅ "Dịch vụ đưa đón sân bay có không?"
```

**Kỳ vọng**: Bot liệt kê tiện ích của khách sạn

---

### 🔟 Liên hệ

```
✅ "Làm sao để liên hệ?"
✅ "Số hotline là gì?"
✅ "Email liên hệ?"
✅ "Địa chỉ khách sạn ở đâu?"
```

**Kỳ vọng**: Bot cung cấp thông tin liên hệ

---

### 1️⃣1️⃣ Hội thoại liên tục (Test Context Memory)

```
User: "Có phòng nào không?"
Bot: [Liệt kê 3 phòng: A, B, C]

User: "Phòng đầu tiên giá bao nhiêu?"  ← Bot phải nhớ phòng A
Bot: [Trả lời về phòng A]

User: "Còn phòng thứ 2 thì sao?"  ← Bot phải nhớ phòng B
Bot: [Trả lời về phòng B]

User: "So sánh 2 phòng này"  ← Bot phải nhớ A và B
Bot: [So sánh A vs B]
```

**Kỳ vọng**: Bot nhớ context và trả lời chính xác

---

### 1️⃣2️⃣ Câu hỏi phức tạp (Test AI Intelligence)

```
✅ "Tôi có 3 triệu, muốn ở 2 đêm, phòng cho 4 người, gần biển, có bể bơi. Gợi ý cho tôi"
✅ "So sánh ưu nhược điểm giữa phòng Standard và Deluxe"
✅ "Nếu tôi đặt 3 phòng thì có giảm giá không?"
✅ "Thời gian check-in check-out là mấy giờ? Nếu tôi đến sớm thì sao?"
```

**Kỳ vọng**: Bot phân tích và đưa ra câu trả lời thông minh

---

### 1️⃣3️⃣ Edge Cases

```
✅ "asdfghjkl" (Gibberish)
✅ "Bạn là ai?"
✅ "Bạn có thể làm gì?"
✅ "" (Empty message)
✅ "Tôi muốn đặt phòng trên sao Hỏa" (Impossible request)
```

**Kỳ vọng**: Bot xử lý gracefully, không crash

---

### 1️⃣4️⃣ Multi-turn Conversation

```
User: "Xin chào"
Bot: [Chào và giới thiệu]

User: "Tôi muốn đi du lịch Đà Nẵng"
Bot: [Gợi ý khách sạn ở Đà Nẵng]

User: "Có phòng nào view biển không?"
Bot: [Liệt kê phòng view biển]

User: "Phòng đó giá bao nhiêu?"
Bot: [Trả lời giá]

User: "Đặt như thế nào?"
Bot: [Hướng dẫn đặt]

User: "Cảm ơn"
Bot: [Kết thúc lịch sự]
```

**Kỳ vọng**: Hội thoại tự nhiên, mạch lạc

---

## 🎯 Checklist đánh giá

### Chức năng cơ bản
- [ ] Bot trả lời đúng câu hỏi
- [ ] Dữ liệu từ database chính xác
- [ ] Không có lỗi crash
- [ ] Response time < 5 giây

### AI Intelligence
- [ ] Hiểu ngôn ngữ tự nhiên
- [ ] Nhớ context hội thoại
- [ ] Gợi ý thông minh
- [ ] Xử lý câu hỏi phức tạp

### UX
- [ ] Typing indicator hoạt động
- [ ] Scroll tự động
- [ ] Quick actions hữu ích
- [ ] UI responsive

### Error Handling
- [ ] Xử lý API error
- [ ] Fallback khi AI fail
- [ ] Thông báo lỗi rõ ràng
- [ ] Không mất dữ liệu chat

---

## 📊 Metrics để track

1. **Response Time**: Thời gian bot trả lời
2. **Accuracy**: % câu trả lời đúng
3. **User Satisfaction**: Feedback từ người dùng
4. **Conversation Length**: Số tin nhắn trung bình
5. **Completion Rate**: % hội thoại hoàn thành mục tiêu

---

## 🐛 Common Issues

### Issue 1: Bot trả lời chậm
**Nguyên nhân**: 
- OpenAI API chậm
- Database query chậm
- Network issue

**Fix**:
- Optimize database query
- Add caching
- Reduce max_tokens

### Issue 2: Bot trả lời sai
**Nguyên nhân**:
- System prompt không rõ ràng
- Dữ liệu database sai
- Context không đủ

**Fix**:
- Cải thiện prompt
- Kiểm tra data
- Tăng conversation history

### Issue 3: Bot không nhớ context
**Nguyên nhân**:
- Frontend không gửi conversationHistory
- Backend không xử lý history

**Fix**:
- Kiểm tra API payload
- Debug conversation flow

---

## 💡 Tips để test hiệu quả

1. **Test từ đơn giản đến phức tạp**
2. **Test edge cases**
3. **Test với nhiều người dùng khác nhau**
4. **Record lại các câu hỏi thực tế**
5. **Cải thiện prompt dựa trên feedback**

---

**Happy Testing! 🚀**
