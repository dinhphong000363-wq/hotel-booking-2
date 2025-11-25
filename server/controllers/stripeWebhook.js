import stripe from 'stripe'
import Booking from '../models/Booking.js';

// API to handle Stripe Webhooks
export const stripeWebhooks = async (request, response) => {
  console.log('🔔 Stripe webhook received');
  console.log('📋 Headers:', request.headers);
  console.log('🔑 Webhook Secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);

  // Stripe Gateway Initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers['stripe-signature'];

  if (!sig) {
    console.error('❌ No stripe-signature header found');
    return response.status(400).send('No stripe-signature header');
  }

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook signature verified, event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    // For Stripe Checkout Sessions, use checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('📦 Session data:', JSON.stringify(session.metadata, null, 2));
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.error('❌ No bookingId found in session metadata');
        console.error('📦 Full metadata:', session.metadata);
        return response.json({ received: true, error: 'No bookingId in metadata' });
      }

      console.log(`🔄 Updating booking ${bookingId}...`);

      // Mark payment as paid
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          isPaid: true,
          paymentMethod: "Stripe",
          status: "confirmed" // Also update status to confirmed
        },
        { new: true }
      );

      if (!booking) {
        console.error(`❌ Booking ${bookingId} not found in database`);
        return response.json({ received: true, error: 'Booking not found' });
      }

      console.log(`✅ Payment confirmed for booking ${bookingId}`);
      console.log(`✅ Updated booking:`, {
        id: booking._id,
        isPaid: booking.isPaid,
        status: booking.status,
        paymentMethod: booking.paymentMethod
      });
      return response.json({ received: true, bookingId });
    }

    // Also handle payment_intent.succeeded as fallback
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Try to get session from payment intent
      try {
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1
        });

        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          const bookingId = session.metadata?.bookingId;

          if (bookingId) {
            await Booking.findByIdAndUpdate(
              bookingId,
              {
                isPaid: true,
                paymentMethod: "Stripe",
                status: "confirmed"
              }
            );
            console.log(`✅ Payment confirmed for booking ${bookingId} (via payment_intent)`);
          }
        }
      } catch (error) {
        console.error('❌ Error processing payment_intent:', error.message);
      }

      return response.json({ received: true });
    }

    console.log(`ℹ️ Unhandled event type: ${event.type}`);
    return response.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error.message);
    return response.status(500).json({ error: error.message });
  }
};
