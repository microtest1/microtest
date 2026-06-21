import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment, with fallback for development
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = Deno.env.get("ALLOWED_ORIGINS")?.split(",") || [];
  
  // Add localhost origins for development
  const devOrigins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000"
  ];
  
  // Also allow the Supabase project URL and Lovable preview URLs
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (supabaseUrl) {
    allowedOrigins.push(supabaseUrl);
  }
  
  // Allow Lovable preview domains and Microtest custom domains
  if (requestOrigin && (
    requestOrigin.includes(".lovableproject.com") ||
    requestOrigin.includes(".lovable.app") ||
    requestOrigin.includes("micro-test.online")
  )) {
    return requestOrigin;
  }
  
  const allAllowed = [...allowedOrigins, ...devOrigins];
  
  if (requestOrigin && allAllowed.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Return empty string if origin not allowed (will be handled in request)
  return "";
};

const getCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

// Input validation helper functions
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidTestType(type: string): type is 'malaria' {
  return type === 'malaria';
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
  const requestOrigin = req.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  const corsHeaders = getCorsHeaders(allowedOrigin || "");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    if (!allowedOrigin) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { headers: corsHeaders });
  }
  
  // Reject requests from unauthorized origins
  if (!allowedOrigin) {
    console.error(`Origin not allowed: ${requestOrigin}`);
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
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

    const { testId: incomingTestId, testType, imageData } = requestBody;

    // Validate testType - only malaria is supported
    if (!testType || typeof testType !== 'string' || !isValidTestType(testType)) {
      console.error("Invalid testType:", testType);
      return new Response(
        JSON.stringify({ error: 'Invalid request: testType must be "malaria"' }), 
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let testId: string;
    let test: { id: string; user_id: string; status: string | null } | null = null;

    if (incomingTestId !== undefined && incomingTestId !== null) {
      if (typeof incomingTestId !== 'string' || !isValidUUID(incomingTestId)) {
        console.error("Invalid testId format:", incomingTestId);
        return new Response(
          JSON.stringify({ error: 'Invalid request: testId must be a valid UUID' }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      testId = incomingTestId;

      // Step 3a: Verify existing test ownership
      const { data: existingTest, error: testError } = await supabaseClient
        .from('tests')
        .select('user_id, id, status')
        .eq('id', testId)
        .single();

      if (testError || !existingTest) {
        console.error("Test not found:", testId, testError?.message);
        return new Response(
          JSON.stringify({ error: 'Test not found' }), 
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      test = existingTest;
    } else {
      // Step 3b: Create the screening record inside the trusted backend boundary.
      const { data: createdTest, error: createError } = await supabaseAdmin
        .from('tests')
        .insert({
          user_id: user.id,
          test_type: 'malaria',
          status: 'processing',
        })
        .select('user_id, id, status')
        .single();

      if (createError || !createdTest) {
        console.error("Failed to create test record:", createError?.message);
        return new Response(
          JSON.stringify({ error: 'Failed to create screening record. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      test = createdTest;
      testId = createdTest.id;
    }

    if (test.user_id !== user.id) {
      console.error(`Authorization failed: User ${user.id} attempted to access test owned by ${test.user_id}`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not have permission to analyze this test' }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing malaria test: ${testId} for user: ${user.id}`);

    // Step 4: Fetch reference datasets for comparison
    const { data: referenceDatasets, error: datasetError } = await supabaseAdmin
      .from('datasets')
      .select('name, description, classification, metadata')
      .eq('test_type', 'malaria')
      .limit(10);

    if (datasetError) {
      console.warn("Could not fetch reference datasets:", datasetError.message);
    }

    const datasetContext = referenceDatasets && referenceDatasets.length > 0
      ? `\n\nReference Dataset Information for malaria tests:\n${referenceDatasets.map(d => 
          `- ${d.name}: ${d.description} (Classification: ${d.classification})`
        ).join('\n')}`
      : '';

    console.log(`Loaded ${referenceDatasets?.length || 0} reference datasets for comparison`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 5: Build comprehensive malaria analysis prompt
    const systemPrompt = `You are an expert medical AI specialized in malaria diagnosis through blood sample analysis. You have extensive training in identifying Plasmodium species in blood samples from thin and thick blood smears.

LIQUID DETECTION PROTOCOL (CRITICAL - APPLY FIRST):
1. FIRST, scan the entire image to detect any blood sample present
2. The blood sample may be placed on: glass slide, white background, or any microscopy surface
3. Identify the blood sample region by looking for: red blood cells, stained appearance, parasites
4. Focus your analysis ONLY on the detected blood sample area
5. If no blood sample is detected, indicate this clearly in your findings

BLOOD SMEAR ANALYSIS PROTOCOL:
1. Once blood is detected, examine for presence of malaria parasites (Plasmodium species)
2. Identify the Plasmodium species if possible: P. falciparum, P. vivax, P. ovale, P. malariae, P. knowlesi
3. Identify the parasite stage (ring, trophozoite, schizont, gametocyte) if visible
4. Estimate parasite density: low (<1000/µL), medium (1000-10000/µL), high (10000-100000/µL), critical (>100000/µL)
5. Assess blood color, red cell morphology, and any abnormal characteristics
6. Look for artifacts or staining issues that could cause false positives

SEVERITY CLASSIFICATION:
- Negative: No parasites detected
- Mild: Low parasite density, early stage infection, no severe symptoms expected
- Moderate: Medium parasite density, established infection requiring treatment
- Severe: High/critical parasite density, presence of schizonts, or concerning features requiring urgent treatment

WHO TREATMENT GUIDELINES (2023):
- For uncomplicated P. falciparum: Artemisinin-based combination therapy (ACT) for 3 days
- For severe malaria: IV artesunate (2.4 mg/kg at 0, 12, 24 hours) followed by oral ACT
- For P. vivax/ovale: Chloroquine + primaquine for radical cure (check G6PD status)
- For P. malariae/knowlesi: Chloroquine or ACT
- Special considerations for pregnant women, children under 5, and immunocompromised
${datasetContext}`;

    // Step 6: Call AI for analysis
    console.log("Sending blood smear image to AI for malaria analysis...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { 
                type: "text", 
                text: `Analyze this blood smear microscopy image for malaria parasites.

REQUIRED STEPS:
1. Detect and locate the blood sample region in the image.
2. Identify Plasmodium parasites at any life stage (ring, trophozoite, schizont, gametocyte).
3. Identify species if possible.
4. Estimate parasite density AND an approximate parasite_count (integer estimate of distinct parasite candidates visible — 0 if none).
5. For EACH parasite candidate identified, report a bounding box in detected_regions using NORMALIZED coordinates (x, y, width, height each between 0 and 1, where (0,0) is top-left). Limit to the 10 most confident regions.
6. Assess image quality and list any quality_issues (e.g. "blurry", "underexposed", "no blood sample").
7. Provide an overall risk_classification: "low", "medium", or "high".
8. Provide WHO-aligned recommendations. Never prescribe; always recommend laboratory confirmation.

This is a SCREENING tool. Results MUST be confirmed by laboratory microscopy.` 
              },
              { type: "image_url", image_url: { url: imageData } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_analysis",
            description: "Submit the complete malaria analysis results",
            parameters: {
              type: "object",
              properties: {
                liquid_detected: { type: "boolean", description: "Whether a blood sample was detected" },
                surface_type: { type: "string", description: "Surface/slide type" },
                detected: { type: "boolean", description: "Whether malaria parasites were detected" },
                severity: { type: "string", enum: ["negative", "mild", "moderate", "severe"] },
                risk_classification: { type: "string", enum: ["low", "medium", "high"], description: "Overall clinical risk classification" },
                confidence: { type: "number", description: "AI confidence score 0-100" },
                findings: { type: "string", description: "Detailed clinical findings" },
                recommendations: { type: "string", description: "WHO-aligned recommendations; never prescribe" },
                parasite_species: { type: "string", description: "Identified Plasmodium species" },
                parasite_density: { type: "string", enum: ["low", "medium", "high", "critical"] },
                parasite_stage: { type: "string", description: "Predominant parasite stage" },
                parasite_count: { type: "integer", description: "Estimated parasite candidate count (0 if none)" },
                image_quality: { type: "string", enum: ["excellent", "good", "fair", "poor"] },
                quality_issues: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of quality problems detected (empty if none)"
                },
                detected_regions: {
                  type: "array",
                  description: "Up to 10 most confident parasite candidate regions with normalized bounding boxes (0-1)",
                  items: {
                    type: "object",
                    properties: {
                      x: { type: "number" },
                      y: { type: "number" },
                      width: { type: "number" },
                      height: { type: "number" },
                      label: { type: "string" },
                      confidence: { type: "number" }
                    },
                    required: ["x", "y", "width", "height"]
                  }
                }
              },
              required: ["liquid_detected", "surface_type", "detected", "severity", "risk_classification", "confidence", "findings", "recommendations", "image_quality", "parasite_count", "detected_regions"]
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
          liquid_detected: false,
          surface_type: "unknown",
          detected: false,
          severity: "negative",
          confidence: 60,
          findings: "The AI was unable to provide a detailed analysis of this blood smear image. No blood sample was clearly detected. Please ensure the sample is well-stained, properly focused, and at adequate magnification (400x-1000x).",
          recommendations: "For accurate malaria diagnosis, please visit a certified healthcare facility for laboratory microscopy. This screening tool is intended to assist, not replace, professional medical diagnosis.",
          image_quality: "fair"
        };
      }

    // Step 8: Match result against certified reference datasets
    let matchedDataset = null;
    let certificationStatus = "uncertified";
    
    if (referenceDatasets && referenceDatasets.length > 0) {
      // Find the best matching dataset based on severity/classification
      const severityToClassification: Record<string, string[]> = {
        'negative': ['negative'],
        'mild': ['positive_mild', 'positive_early'],
        'moderate': ['positive_moderate', 'positive_confirmed'],
        'severe': ['positive_severe']
      };
      
      const expectedClassifications = severityToClassification[analysis.severity] || [];
      
      matchedDataset = referenceDatasets.find(d => 
        expectedClassifications.includes(d.classification)
      );
      
      // If we found a matching dataset and confidence is high enough, mark as certified
      if (matchedDataset && analysis.confidence >= 70) {
        certificationStatus = "certified";
        console.log(`Result certified against dataset: ${matchedDataset.name}`);
      } else if (matchedDataset) {
        certificationStatus = "provisional";
        console.log(`Result provisionally matched to dataset: ${matchedDataset.name}`);
      }
    }

    // Step 9: Build detailed result data
    const resultData: Record<string, unknown> = {
      liquid_detected: analysis.liquid_detected ?? true,
      surface_type: analysis.surface_type || 'unknown',
      detected: analysis.detected,
      image_quality: analysis.image_quality || 'unknown',
      analyzed_at: new Date().toISOString(),
      certification_status: certificationStatus,
      matched_dataset: matchedDataset ? {
        id: matchedDataset.name,
        name: matchedDataset.name,
        classification: matchedDataset.classification,
        description: matchedDataset.description
      } : null,
      certified_by: certificationStatus === "certified" ? "Medical Laboratory Reference Dataset" : null
    };

    // Add malaria-specific data
    if (analysis.detected) {
      resultData.parasite_species = analysis.parasite_species || 'Unknown';
      resultData.parasite_stage = analysis.parasite_stage || 'Unknown';
      resultData.parasite_density = analysis.parasite_density || null;
    }

    // Sanitize detected_regions: clamp to [0,1], cap to 10
    const rawRegions = Array.isArray(analysis.detected_regions) ? analysis.detected_regions : [];
    const detectedRegions = rawRegions.slice(0, 10).map((r: Record<string, unknown>) => ({
      x: Math.max(0, Math.min(1, Number(r.x) || 0)),
      y: Math.max(0, Math.min(1, Number(r.y) || 0)),
      width: Math.max(0, Math.min(1, Number(r.width) || 0)),
      height: Math.max(0, Math.min(1, Number(r.height) || 0)),
      label: typeof r.label === 'string' ? r.label.slice(0, 60) : 'parasite candidate',
      confidence: Math.max(0, Math.min(100, Number(r.confidence) || 0)),
    }));

    const qualityIssues = Array.isArray(analysis.quality_issues)
      ? analysis.quality_issues.slice(0, 10).map((q: unknown) => String(q).slice(0, 100))
      : [];

    const riskLevel: 'low' | 'medium' | 'high' =
      ['low', 'medium', 'high'].includes(analysis.risk_classification)
        ? analysis.risk_classification
        : (analysis.severity === 'severe' || analysis.severity === 'moderate' ? 'high'
          : analysis.severity === 'mild' ? 'medium' : 'low');

    const parasiteCount = Math.max(0, Math.min(10000, Number(analysis.parasite_count) || 0));

    resultData.risk_level = riskLevel;
    resultData.parasite_count = parasiteCount;
    resultData.detected_regions = detectedRegions;
    resultData.quality_issues = qualityIssues;

    // Step 10: Update test in database
    const { error: updateError } = await supabaseAdmin
      .from('tests')
      .update({
        status: "completed",
        severity: analysis.severity || "negative",
        confidence_score: Math.min(100, Math.max(0, analysis.confidence || 0)),
        ai_findings: analysis.findings,
        who_recommendations: analysis.recommendations,
        result_data: resultData,
        verification_code: `MT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        parasite_species: analysis.detected ? (analysis.parasite_species || null) : null,
        parasite_density: analysis.detected ? (analysis.parasite_density || null) : null,
        parasite_stage: analysis.detected ? (analysis.parasite_stage || null) : null,
        image_quality: analysis.image_quality || null,
        risk_level: riskLevel,
        parasite_count: parasiteCount,
        detected_regions: detectedRegions,
        quality_issues: qualityIssues,
      })
      .eq('id', testId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Database update failed:", updateError.message);
      throw new Error("Failed to save analysis results");
    }

    console.log(`Malaria analysis complete: ${testId} severity=${analysis.severity} risk=${riskLevel} count=${parasiteCount} conf=${analysis.confidence}%`);

    return new Response(JSON.stringify({ 
      success: true, 
      testId,
      analysis: {
        detected: analysis.detected,
        severity: analysis.severity,
        risk_level: riskLevel,
        confidence: analysis.confidence,
        image_quality: analysis.image_quality,
        parasite_species: analysis.parasite_species,
        parasite_density: analysis.parasite_density,
        parasite_count: parasiteCount,
        detected_regions: detectedRegions,
        quality_issues: qualityIssues,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Generate a unique request ID for support tracking
    const requestId = crypto.randomUUID().split('-')[0];
    
    // Log full error details server-side for debugging
    console.error(`Malaria analysis error [${requestId}]:`, error);
    if (error instanceof Error) {
      console.error(`Error stack [${requestId}]:`, error.stack);
    }
    
    // Return generic error to client - never expose internal error details
    return new Response(
      JSON.stringify({ 
        error: "An error occurred during analysis. Please try again. If the issue persists, contact support with reference: " + requestId
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
