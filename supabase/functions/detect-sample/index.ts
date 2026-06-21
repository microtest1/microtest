import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Origin validation for CORS security
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = Deno.env.get("ALLOWED_ORIGINS")?.split(",") || [];
  
  const devOrigins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:5173"
  ];
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (supabaseUrl) {
    allowedOrigins.push(supabaseUrl);
  }
  
  // Allow Lovable preview and published URLs
  if (requestOrigin && (
    requestOrigin.includes(".lovableproject.com") ||
    requestOrigin.includes(".lovable.app") ||
    requestOrigin.includes("-preview--") ||
    requestOrigin.includes("micro-test.online")
  )) {
    return requestOrigin;
  }
  
  const allAllowed = [...allowedOrigins, ...devOrigins];
  
  if (requestOrigin && allAllowed.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  return "";
};

const getCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

// Input validation helpers
function isValidTestType(type: unknown): type is 'malaria' {
  return type === 'malaria';
}

function isValidImageData(data: unknown): boolean {
  if (typeof data !== 'string') return false;
  
  const imageDataRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
  if (!imageDataRegex.test(data)) {
    return false;
  }
  
  // Limit to 5MB for detection (smaller than full analysis)
  const maxSizeBytes = 5 * 1024 * 1024;
  if (data.length > maxSizeBytes * 1.4) {
    return false;
  }
  
  return true;
}

serve(async (req) => {
  const requestOrigin = req.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  const corsHeaders = getCorsHeaders(allowedOrigin);

  if (req.method === "OPTIONS") {
    if (!allowedOrigin) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { headers: corsHeaders });
  }

  // Reject unauthorized origins for non-OPTIONS requests
  if (!allowedOrigin && requestOrigin) {
    console.error(`Rejected request from unauthorized origin: ${requestOrigin}`);
    return new Response(
      JSON.stringify({ 
        detected: false,
        sample_type: "none",
        quality: "none",
        feedback: "Origin not allowed",
        ready_for_capture: false
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Step 1: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ 
          detected: false,
          sample_type: "none",
          quality: "none",
          feedback: "Authentication required",
          ready_for_capture: false
        }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Authentication failed:", claimsError?.message || "Invalid token");
      return new Response(
        JSON.stringify({ 
          detected: false,
          sample_type: "none",
          quality: "none",
          feedback: "Invalid authentication",
          ready_for_capture: false
        }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Blood sample detection request from authenticated user: ${userId}`);

    // Step 2: Parse and validate input
    const { imageData, testType } = await req.json();

    // Validate testType - only malaria is supported
    if (!testType || !isValidTestType(testType)) {
      console.error(`Invalid testType provided: ${testType}`);
      return new Response(
        JSON.stringify({ 
          detected: false,
          sample_type: "none",
          quality: "none",
          feedback: "Invalid test type - only malaria screening supported",
          ready_for_capture: false
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate imageData
    if (!imageData || !isValidImageData(imageData)) {
      console.error("Invalid or missing imageData");
      return new Response(
        JSON.stringify({ 
          detected: false,
          sample_type: "none",
          quality: "none",
          feedback: "Invalid image data",
          ready_for_capture: false
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Process detection with AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a blood sample detection AI for malaria screening. Your ONLY job is to quickly detect if there is a blood sample (thin or thick blood smear) visible in the microscopy image and estimate its position. Be fast and concise. Look for:
- Red blood cells visible
- Stained blood smear appearance (Giemsa, Wright, or Field stain)
- Proper magnification (400x-1000x)
- Sample clarity and focus`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Quickly scan this microscopy image for a blood sample suitable for malaria parasite detection. Report if blood cells are detected and if the sample is well-positioned and focused for analysis.`
              },
              { type: "image_url", image_url: { url: imageData } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_detection",
            description: "Report the blood sample detection results",
            parameters: {
              type: "object",
              properties: {
                detected: {
                  type: "boolean",
                  description: "Whether a blood sample was detected"
                },
                sample_type: {
                  type: "string",
                  enum: ["blood", "unknown", "none"],
                  description: "Type of sample detected"
                },
                position: {
                  type: "object",
                  properties: {
                    x: { type: "number", description: "Horizontal position as percentage (0-100) from left" },
                    y: { type: "number", description: "Vertical position as percentage (0-100) from top" },
                    width: { type: "number", description: "Width as percentage of image (0-100)" },
                    height: { type: "number", description: "Height as percentage of image (0-100)" }
                  },
                  required: ["x", "y", "width", "height"],
                  description: "Bounding box of the detected sample region"
                },
                quality: {
                  type: "string",
                  enum: ["excellent", "good", "fair", "poor", "none"],
                  description: "Quality of sample visibility for malaria analysis"
                },
                feedback: {
                  type: "string",
                  description: "Brief feedback for the user (max 10 words)"
                },
                ready_for_capture: {
                  type: "boolean",
                  description: "Whether the sample is well-positioned enough to capture"
                }
              },
              required: ["detected", "sample_type", "quality", "feedback", "ready_for_capture"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "report_detection" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            detected: false, 
            quality: "none",
            feedback: "Rate limited, please wait",
            ready_for_capture: false 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const detection = JSON.parse(toolCall.function.arguments);
      console.log(`Detection complete for user ${userId}: detected=${detection.detected}, quality=${detection.quality}`);
      return new Response(
        JSON.stringify(detection),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        detected: false, 
        sample_type: "none",
        quality: "none",
        feedback: "Unable to analyze frame",
        ready_for_capture: false 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Detection error:", error);
    return new Response(
      JSON.stringify({ 
        detected: false, 
        sample_type: "none",
        quality: "none",
        feedback: "Detection temporarily unavailable",
        ready_for_capture: false 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
