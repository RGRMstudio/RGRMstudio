// /pages/api/stripe-webhook.js

import Stripe from 'stripe';
import { buffer } from 'micro';

// This uses the Webhook Secret key you added in Vercel: STRIPE_WEBHOOK_SECRET
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; 

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Next.js setting to handle the raw request body
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
    // 1. Verify the message is truly from Stripe using the secret
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the successful payment event
  if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log(`✅ PaymentIntent successful: ${paymentIntent.id}`);

      // === CRITICAL NEXT STEP: TRIGGER PRINTFUL ===
      // This is the point of no return! The order is paid for.
      // In a future step, we will call the /api/create-printful-order.js function here.
      console.log('--- Order paid. Ready to fulfill via Printful! ---');
  }

  // 3. Always send a 200 response to Stripe to let them know the message was received
  res.json({ received: true });
}
