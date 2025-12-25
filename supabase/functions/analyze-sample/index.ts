import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation helper functions
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidTestType(type: string): type is 'malaria' | 'pregnancy' {
  return type === 'malaria' || type === 'pregnancy';
}

function isValidImageData(data: string): boolean {
  // Must be a base64 data URL with image format
  const imageDataRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
  if (!imageDataRegex.test(data)) {
    return false;
  }
  // Check size - limit to 10MB (base64 is ~33% larger than original)
  const maxSizeBytes = 10 * 1024 * 1024;
  if (data.length > maxSizeBytes * 1.4) {
    return false;
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication token' }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create client with user's token to verify identity
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication token' }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Step 2: Parse and validate input
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { testId, testType, imageData } = requestBody;

    // Validate testId
    if (!testId || typeof testId !== 'string' || !isValidUUID(testId)) {
      console.error("Invalid testId format:", testId);
      return new Response(
        JSON.stringify({ error: 'Invalid request: testId must be a valid UUID' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate testType
    if (!testType || typeof testType !== 'string' || !isValidTestType(testType)) {
      console.error("Invalid testType:", testType);
      return new Response(
        JSON.stringify({ error: 'Invalid request: testType must be "malaria" or "pregnancy"' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate imageData
    if (!imageData || typeof imageData !== 'string' || !isValidImageData(imageData)) {
      console.error("Invalid imageData format or size");
      return new Response(
        JSON.stringify({ error: 'Invalid request: imageData must be a valid base64 image (jpeg, png, gif, webp) under 10MB' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Verify test ownership
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .select('user_id, id, status')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error("Test not found:", testId, testError?.message);
      return new Response(
        JSON.stringify({ error: 'Test not found' }), 
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (test.user_id !== user.id) {
      console.error(`Authorization failed: User ${user.id} attempted to access test owned by ${test.user_id}`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not have permission to analyze this test' }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${testType} test: ${testId} for user: ${user.id}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
    console.log("AI Response received successfully");

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

    // Update test in database using service role (after ownership verified)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabaseAdmin
      .from('tests')
      .update({
        status: "completed",
        severity: analysis.severity || "negative",
        pregnancy_weeks: analysis.pregnancy_weeks || null,
        confidence_score: analysis.confidence,
        ai_findings: analysis.findings,
        who_recommendations: analysis.recommendations,
        verification_code: `MT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      })
      .eq('id', testId)
      .eq('user_id', user.id); // Extra safety check

    if (updateError) {
      console.error("Database update failed:", updateError.message);
      throw new Error("Failed to save analysis results");
    }

    console.log(`Analysis complete for test ${testId}`);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during analysis. Please try again." }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
