#!/bin/bash

# Deploy Supabase Edge Functions for supersweetss

echo "Deploying supersweetss Edge Functions..."

# Deploy create-razorpay-order function
echo "Deploying create-razorpay-order function..."
supabase functions deploy create-razorpay-order --project-ref wewssgudowibymqbfrgy

# Deploy verify-razorpay-payment function
echo "Deploying verify-razorpay-payment function..."
supabase functions deploy verify-razorpay-payment --project-ref wewssgudowibymqbfrgy

# Set environment variables for Edge Functions
echo "Setting environment variables..."
supabase secrets set RAZORPAY_KEY_ID=rzp_live_ADZ8Tty5OXnX11 --project-ref wewssgudowibymqbfrgy
supabase secrets set RAZORPAY_KEY_SECRET=5GdHhNroWNwKfbq8B9oXEH4m --project-ref wewssgudowibymqbfrgy

echo "Edge Functions deployed successfully!"
echo ""
echo "Functions available at:"
echo "- https://wewssgudowibymqbfrgy.supabase.co/functions/v1/create-razorpay-order"
echo "- https://wewssgudowibymqbfrgy.supabase.co/functions/v1/verify-razorpay-payment"