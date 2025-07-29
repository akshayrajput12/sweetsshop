import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { paymentId, orderId, signature } = await req.json();
    
    if (!paymentId || !orderId || !signature) {
      throw new Error('Payment verification data is incomplete');
    }

    console.log('Verifying Razorpay payment for user:', user.id);
    console.log('Payment ID:', paymentId, 'Order ID:', orderId);

    // Get Razorpay secret key
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret key not configured');
    }

    // Verify payment signature
    const body = orderId + '|' + paymentId;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(razorpayKeySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const sigArray = Array.from(new Uint8Array(sigBuffer));
    const expectedSignature = sigArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const isValidSignature = expectedSignature === signature;
    
    console.log('Payment signature verification:', isValidSignature ? 'SUCCESS' : 'FAILED');

    if (!isValidSignature) {
      throw new Error('Invalid payment signature');
    }

    // If verification successful, return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified successfully',
      paymentId,
      orderId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error.message);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});