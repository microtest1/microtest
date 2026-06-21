import { supabase } from '@/integrations/supabase/client';

interface AnalyzeSampleRequest {
  testType: 'malaria';
  imageData: string;
}

interface AnalyzeSampleResponse {
  success: boolean;
  testId: string;
  analysis?: Record<string, unknown>;
}

export async function analyzeSample(payload: AnalyzeSampleRequest): Promise<AnalyzeSampleResponse> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (sessionError || !accessToken) {
    throw new Error('Please sign in again before analyzing a sample.');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-sample`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 402) {
      throw new Error('AI credits are exhausted. Please add credits and retry the screening.');
    }

    if (response.status === 429) {
      throw new Error('The AI service is busy. Please retry in a moment.');
    }

    throw new Error(result?.error || 'Analysis failed. Please retry the screening.');
  }

  if (!result?.testId) {
    throw new Error('Analysis completed but no result record was returned. Please try again.');
  }

  return result as AnalyzeSampleResponse;
}