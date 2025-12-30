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

    // Step 4: Fetch reference datasets for comparison
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: referenceDatasets, error: datasetError } = await supabaseAdmin
      .from('datasets')
      .select('name, description, classification, metadata')
      .eq('test_type', testType)
      .limit(10);

    if (datasetError) {
      console.warn("Could not fetch reference datasets:", datasetError.message);
    }

    const datasetContext = referenceDatasets && referenceDatasets.length > 0
      ? `\n\nReference Dataset Information for ${testType} tests:\n${referenceDatasets.map(d => 
          `- ${d.name}: ${d.description} (Classification: ${d.classification})`
        ).join('\n')}`
      : '';

    console.log(`Loaded ${referenceDatasets?.length || 0} reference datasets for comparison`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 5: Build comprehensive analysis prompt
    const systemPrompt = testType === 'malaria' 
      ? `You are an expert medical AI specialized in malaria diagnosis through microscopy analysis. You have extensive training in identifying Plasmodium species in blood smears.

ANALYSIS PROTOCOL:
1. Examine the blood smear for presence of malaria parasites
2. Identify the parasite stage (ring, trophozoite, schizont, gametocyte)
3. Estimate parasite density per µL of blood
4. Assess red blood cell morphology for species identification
5. Look for artifacts that could cause false positives

SEVERITY CLASSIFICATION:
- Negative: No parasites detected
- Mild: <1000 parasites/µL, early stage infection
- Moderate: 1000-10000 parasites/µL, established infection
- Severe: >10000 parasites/µL or presence of schizonts, requires urgent treatment

WHO TREATMENT GUIDELINES:
- For uncomplicated P. falciparum: Artemisinin-based combination therapy (ACT)
- For severe malaria: IV artesunate followed by oral ACT
- For P. vivax/ovale: Chloroquine + primaquine for radical cure
${datasetContext}`
      : `You are an expert medical AI specialized in pregnancy test analysis and early pregnancy assessment.

ANALYSIS PROTOCOL:
1. Identify the test strip control line (must be visible for valid test)
2. Check for presence and intensity of test line
3. Assess line color intensity for HCG level estimation
4. Identify any invalid test conditions (missing control line, smearing)

RESULT CLASSIFICATION:
- Negative: Only control line visible, no test line
- Positive (Early): Faint test line, HCG ~25-100 mIU/mL, estimated 3-4 weeks
- Positive (Confirmed): Clear test line, HCG >100 mIU/mL, estimated 4-6 weeks
- Positive (Strong): Dark test line equal to or darker than control, >1000 mIU/mL, 5+ weeks
- Invalid: No control line visible, test must be repeated

WHO PRENATAL RECOMMENDATIONS:
- Confirm pregnancy with healthcare provider
- Begin prenatal vitamins with folic acid
- Schedule first prenatal visit within 12 weeks
- Avoid alcohol, tobacco, and certain medications
${datasetContext}`;

    // Step 6: Call AI for analysis
    console.log("Sending image to AI for analysis...");
    
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
              { 
                type: "text", 
                text: `Analyze this ${testType === 'malaria' ? 'blood smear microscopy image' : 'pregnancy test strip image'} and provide your detailed clinical findings. 
                
Be thorough in your analysis and provide actionable medical guidance based on WHO protocols.` 
              },
              { type: "image_url", image_url: { url: imageData } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_analysis",
            description: "Submit the complete analysis results with all clinical findings",
            parameters: {
              type: "object",
              properties: {
                detected: { 
                  type: "boolean", 
                  description: "Whether the condition (malaria/pregnancy) was detected" 
                },
                severity: { 
                  type: "string", 
                  enum: ["negative", "mild", "moderate", "severe"], 
                  description: "Severity level of the finding" 
                },
                pregnancy_weeks: { 
                  type: "number", 
                  description: "Estimated pregnancy weeks if applicable (pregnancy tests only)" 
                },
                confidence: { 
                  type: "number", 
                  description: "AI confidence score from 0-100 based on image quality and certainty" 
                },
                findings: { 
                  type: "string", 
                  description: "Detailed clinical findings including observations about the sample, identified features, and any notable characteristics" 
                },
                recommendations: { 
                  type: "string", 
                  description: "WHO-based treatment or care recommendations tailored to the specific findings" 
                },
                parasite_species: {
                  type: "string",
                  description: "For malaria: Identified Plasmodium species if detected (P. falciparum, P. vivax, P. ovale, P. malariae, P. knowlesi, or mixed)"
                },
                parasite_stage: {
                  type: "string",
                  description: "For malaria: Predominant parasite stage observed (ring, trophozoite, schizont, gametocyte)"
                },
                image_quality: {
                  type: "string",
                  enum: ["excellent", "good", "fair", "poor"],
                  description: "Assessment of the submitted image quality for diagnostic purposes"
                }
              },
              required: ["detected", "severity", "confidence", "findings", "recommendations", "image_quality"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "submit_analysis" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("AI Response received successfully");

    // Step 7: Parse AI response
    let analysis;
    try {
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        analysis = JSON.parse(toolCall.function.arguments);
        console.log("Parsed analysis:", JSON.stringify(analysis, null, 2));
      } else {
        throw new Error("No tool call in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback analysis
      analysis = {
        detected: false,
        severity: "negative",
        confidence: 60,
        findings: "The AI was unable to provide a detailed analysis of this image. The image quality may be insufficient for accurate diagnosis. Please ensure the sample is well-lit, in focus, and properly positioned.",
        recommendations: "For accurate diagnosis, please visit a certified healthcare facility. This screening tool is intended to assist, not replace, professional medical diagnosis.",
        image_quality: "fair"
      };
    }

    // Step 8: Build detailed result data
    const resultData: Record<string, unknown> = {
      detected: analysis.detected,
      image_quality: analysis.image_quality || 'unknown',
      analyzed_at: new Date().toISOString(),
    };

    if (testType === 'malaria' && analysis.detected) {
      resultData.parasite_species = analysis.parasite_species || 'Unknown';
      resultData.parasite_stage = analysis.parasite_stage || 'Unknown';
    }

    // Step 9: Update test in database
    const { error: updateError } = await supabaseAdmin
      .from('tests')
      .update({
        status: "completed",
        severity: analysis.severity || "negative",
        pregnancy_weeks: analysis.pregnancy_weeks || null,
        confidence_score: Math.min(100, Math.max(0, analysis.confidence || 0)),
        ai_findings: analysis.findings,
        who_recommendations: analysis.recommendations,
        result_data: resultData,
        verification_code: `MT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      })
      .eq('id', testId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Database update failed:", updateError.message);
      throw new Error("Failed to save analysis results");
    }

    console.log(`Analysis complete for test ${testId} - Severity: ${analysis.severity}, Confidence: ${analysis.confidence}%`);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: {
        detected: analysis.detected,
        severity: analysis.severity,
        confidence: analysis.confidence,
        image_quality: analysis.image_quality
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An error occurred during analysis. Please try again." 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
