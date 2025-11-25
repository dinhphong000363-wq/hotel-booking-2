import axios from 'axios';

/**
 * Script để test webhook locally
 * Chạy: node server/scripts/test-webhook.js
 */

const testWebhook = async () => {
    try {
        // Thay YOUR_BOOKING_ID bằng một booking ID thực tế từ database
        const bookingId = 'YOUR_BOOKING_ID';

        console.log('🧪 Testing webhook with bookingId:', bookingId);

        // Simulate Stripe checkout session completed event
        const mockEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_123',
                    metadata: {
                        bookingId: bookingId
                    },
                    payment_status: 'paid',
                    amount_total: 10000
                }
            }
        };

        console.log('📤 Sending mock webhook event...');
        console.log(JSON.stringify(mockEvent, null, 2));

        // Gửi request đến webhook endpoint
        const response = await axios.post('http://localhost:3000/api/stripe', mockEvent, {
            headers: {
                'Content-Type': 'application/json',
                // Note: Trong thực tế, Stripe sẽ gửi stripe-signature header
                // Để test local, bạn cần tắt signature verification tạm thời
            }
        });

        console.log('✅ Response:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

testWebhook();
