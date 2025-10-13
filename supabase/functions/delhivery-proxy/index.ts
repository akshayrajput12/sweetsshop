import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

serve(async (req) => {
  console.log("Delhivery proxy function called with method:", req.method);
  console.log("Request headers:", [...req.headers.entries()]);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight - accept all methods
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  // Accept ALL HTTP methods for debugging purposes
  console.log("Accepting request method:", req.method);
  
  try {
    // For all methods, try to read the request body
    let requestBody: any = {};
    let rawBody = "";
    
    try {
      rawBody = await req.text();
      console.log("Raw request body:", rawBody);
      
      if (rawBody) {
        requestBody = JSON.parse(rawBody);
      }
    } catch (parseError) {
      console.log("Request body is not JSON, treating as raw text");
      requestBody = { rawBody: rawBody };
    }
    
    console.log("Parsed request body:", requestBody);
    
    // Check if this is our expected format
    const path = requestBody.path;
    const body = requestBody.body;
    const method = requestBody.method;
    
    // If we have a path, this is our expected format
    if (path) {
      console.log("Processing Delhivery API request");
      
      // Try to get the API key from environment variables
      // Supabase Edge Functions use direct environment variable access without VITE_ prefix
      const apiKey = (Deno as any).env.get("DELHIVERY_API_KEY") || (Deno as any).env.get("VITE_DELHIVERY_API_KEY");
      if (!apiKey) {
        console.error("Delhivery API key not set in environment variables");
        console.log("Available environment variables:", Object.keys((Deno as any).env.toObject()));
        return new Response(JSON.stringify({
          error: "Internal Server Error",
          message: "DELHIVERY_API_KEY not configured in Supabase environment variables",
          detail: "Please set DELHIVERY_API_KEY in your Supabase project settings"
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }

      const url = `https://track.delhivery.com${path}`;
      console.log("Making request to Delhivery API:", { url, method: method || req.method, hasBody: !!body });
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`,
        "Accept": "application/json"
      };

      // Use the provided method or default to the request method
      const requestMethod = (method?.toUpperCase() || req.method || "POST");

      const response = await fetch(url, {
        method: requestMethod,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      console.log("Delhivery API response status:", response.status);
      
      const textData = await response.text();
      console.log("Delhivery API response body:", textData.substring(0, 500) + (textData.length > 500 ? "..." : ""));
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(textData);
      } catch {
        parsedResponse = {
          message: textData
        };
      }

      return new Response(JSON.stringify(parsedResponse), {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } else {
      // If no path, return a debug response
      console.log("Returning debug response");
      return new Response(JSON.stringify({
        message: "Delhivery proxy function is working",
        method: req.method,
        url: req.url,
        headers: [...req.headers.entries()],
        body: requestBody,
        envVars: Object.keys((Deno as any).env.toObject()).filter(key => key.includes('DELHIVERY') || key.includes('VITE'))
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
  } catch (err) {
    console.error("Delhivery proxy error:", err);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: err.message,
      stack: err.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});