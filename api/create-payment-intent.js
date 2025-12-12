// /pages/api/create-payment-intent.js

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Uses the Secret Key from Vercel

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentAmount = parseInt(amount, 10);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount.' });
    }

    // Creates the Payment Intent using Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount, // Amount must be in cents (e.g., $10.00 = 1000)
      currency: currency,
    });

    // Sends the Client Secret back to your checkout page
    res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
}
