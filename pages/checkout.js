// /pages/checkout.js

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

// IMPORTANT: Get the publishable key from Vercel. This key is safe to be public.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// --- 1. The Component that handles payment submission ---
const CheckoutForm = ({ orderTotalInCents }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    // A. Call your Next.js API to create the PaymentIntent
    // NOTE: In a real store, you would pass the list of items to ensure the price is correct
    const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: orderTotalInCents, // e.g., 5000 for $50.00
        }),
    });

    const data = await response.json();
    const clientSecret = data.clientSecret;

    if (!clientSecret) {
        setErrorMessage('Failed to initiate payment.');
        setIsLoading(false);
        return;
    }

    // B. Confirm the payment with Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        // After successful payment, redirect the customer here
        return_url: `${window.location.origin}/order-success`, 
      },
    });

    if (error) {
      // This will be displayed to the customer
      setErrorMessage(error.message);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc'}}>
      <h2>Secure Checkout</h2>

      {/* This is the Stripe payment widget */}
      <PaymentElement />

      <button disabled={isLoading || !stripe || !elements} className="pay-button" style={{marginTop: '20px'}}>
        {isLoading ? 'Processing...' : `Pay $${(orderTotalInCents / 100).toFixed(2)}`}
      </button>

      {/* Display error messages */}
      {errorMessage && <div style={{color: 'red', marginTop: '10px'}}>{errorMessage}</div>}
    </form>
  );
};


// --- 2. The Main Page Component ---
export default function CheckoutPage() {
    // !!! IMPORTANT: Replace this with the actual calculated total price of the customer's cart
    const orderTotalInCents = 4599; // Example: $45.99

    return (
        <div>
            <h1>Your Order Summary</h1>
            <p>Total: **${(orderTotalInCents / 100).toFixed(2)}**</p>

            {/* Stripe Elements Provider */}
            {stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret: 'pi_dummy_secret' }}>
                    <CheckoutForm orderTotalInCents={orderTotalInCents} />
                </Elements>
            )}
        </div>
    );
}
