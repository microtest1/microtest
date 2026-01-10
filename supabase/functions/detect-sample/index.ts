import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, testType } = await req.json();

    if (!imageData || typeof imageData !== "string") {
      return new Response(
        JSON.stringify({ error: "imageData is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sampleType = testType === "pregnancy" ? "urine" : "blood";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a sample detection AI. Your ONLY job is to quickly detect if there is a ${sampleType} sample visible in the image and estimate its position. Be fast and concise.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Quickly scan this image for a ${sampleType} sample. Report if detected and its approximate position in the frame. Is the sample well-positioned and visible for analysis?`
              },
              { type: "image_url", image_url: { url: imageData } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_detection",
            description: "Report the sample detection results",
            parameters: {
              type: "object",
              properties: {
                detected: {
                  type: "boolean",
                  description: "Whether a liquid sample was detected"
                },
                sample_type: {
                  type: "string",
                  enum: ["blood", "urine", "test_strip", "unknown", "none"],
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
                  description: "Quality of sample visibility for analysis"
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
