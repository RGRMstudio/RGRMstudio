// /pages/api/create-payment-intent.js

import Stripe from 'stripe';

// Initialize Stripe with the secret key from Vercel Environment Variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'usd' } = req.body;

    // 1. Validate the amount (must be an integer in cents)
    const paymentAmount = parseInt(amount, 10);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount.' });
    }

    // 2. Create the Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount, // amount in cents (e.g., $10.00 is 1000)
      currency: currency,
      // You could add the order contents here using 'metadata' for later retrieval
    });

    // 3. Send the client_secret back to the checkout page
    res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ statusCode: 500, message: error.message });
  }
}
