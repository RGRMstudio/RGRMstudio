// /pages/api/stripe-webhook.js

import Stripe from 'stripe';
import { buffer } from 'micro';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Next.js setting: we need the raw request body to verify the Stripe signature
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // 1. Verifies the message signature using the webhook secret
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handles the main success event
  if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log(`✅ PaymentIntent successful: ${paymentIntent.id}`);
      
      // === CRITICAL NEXT STEP: TRIGGER PRINTFUL ===
      // Here is where the code to call /api/create-printful-order.js will go
      // once we have the customer and item details saved.
      console.log('--- Order paid. Ready to fulfill via Printful! ---');
  }

  // Acknowledges receipt of the event to Stripe
  res.json({ received: true });
}
