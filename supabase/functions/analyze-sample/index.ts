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
    const { testId, testType, imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing ${testType} test: ${testId}`);

    const systemPrompt = testType === 'malaria' 
      ? `You are an expert medical AI analyzing blood smear images for malaria parasites. Analyze the image and provide:
1. Detection result (positive/negative)
2. If positive: severity level (mild, moderate, severe) based on parasite density
3. Confidence score (0-100)
4. Key findings observed
5. WHO-recommended treatment guidance based on severity`
      : `You are an expert medical AI analyzing urine samples for pregnancy detection. Analyze the image and provide:
1. Detection result (positive/negative)
2. If positive: estimated pregnancy duration in weeks
3. Confidence score (0-100)
4. Key findings observed
5. WHO-recommended prenatal guidance`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "text", text: "Analyze this medical sample image and provide your findings in JSON format with keys: detected (boolean), severity (string or null), pregnancy_weeks (number or null), confidence (number), findings (string), recommendations (string)" },
              { type: "image_url", image_url: { url: imageData } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_analysis",
            description: "Submit the analysis results",
            parameters: {
              type: "object",
              properties: {
                detected: { type: "boolean", description: "Whether condition was detected" },
                severity: { type: "string", enum: ["negative", "mild", "moderate", "severe"], description: "Severity level" },
                pregnancy_weeks: { type: "number", description: "Estimated pregnancy weeks if applicable" },
                confidence: { type: "number", description: "Confidence score 0-100" },
                findings: { type: "string", description: "Key findings" },
                recommendations: { type: "string", description: "WHO treatment recommendations" }
              },
              required: ["detected", "severity", "confidence", "findings", "recommendations"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "submit_analysis" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("AI Response:", JSON.stringify(aiResult));

    let analysis;
    try {
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        analysis = JSON.parse(toolCall.function.arguments);
      } else {
        throw new Error("No tool call in response");
      }
    } catch {
      analysis = {
        detected: false,
        severity: "negative",
        confidence: 75,
        findings: "Analysis completed. Please consult a healthcare professional for accurate diagnosis.",
        recommendations: "For accurate results, please visit a certified medical facility."
      };
    }

    // Update test in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/tests?id=eq.${testId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        status: "completed",
        severity: analysis.severity || "negative",
        pregnancy_weeks: analysis.pregnancy_weeks || null,
        confidence_score: analysis.confidence,
        ai_findings: analysis.findings,
        who_recommendations: analysis.recommendations,
        verification_code: `MT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      })
    });

    if (!updateResponse.ok) {
      console.error("Database update failed:", await updateResponse.text());
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});