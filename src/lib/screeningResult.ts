import { supabase } from '@/integrations/supabase/client';
import type { Test } from '@/types/database';

export async function getScreeningResult(testId: string): Promise<Test> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (sessionError || !accessToken) {
    throw new Error('Please sign in again to view this result.');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/screening-result`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ testId }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.test) {
    throw new Error(result?.error || 'Could not load screening result.');
  }

  return result.test as Test;
}