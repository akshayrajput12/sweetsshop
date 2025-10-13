// Supabase function to proxy Delhivery API requests
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body and headers
    const { method, path, body } = await req.json();
    
    // Validate the path
    if (!path) {
      return new Response(
        JSON.stringify({ error: 'API path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Construct the full Delhivery API URL
    const delhiveryBaseUrl = 'https://track.delhivery.com';
    const url = `${delhiveryBaseUrl}${path}`;
    
    // Get the API key from environment variables
    const apiKey = Deno.env.get('DELHIVERY_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'DELHIVERY_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare headers for the Delhivery API request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    };
    
    // Make the request to Delhivery API
    const response = await fetch(url, {
      method: method || 'GET',
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    // Get the response data
    const responseData = await response.text();
    
    // Try to parse JSON response, fallback to text if it fails
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch (e) {
      parsedResponse = { message: responseData };
    }
    
    // Return the response with appropriate headers
    return new Response(JSON.stringify(parsedResponse), {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Delhivery proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});