import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingTest {
  id: string;
  imageData: string;
  timestamp: number;
  retryCount: number;
}

interface OfflineSyncState {
  isOnline: boolean;
  pendingTests: PendingTest[];
  isSyncing: boolean;
}

const STORAGE_KEY = 'microtest_pending_tests';
const MAX_RETRIES = 3;

export function useOfflineSync() {
  const { toast } = useToast();
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingTests: [],
    isSyncing: false,
  });

  // Load pending tests from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const pendingTests = JSON.parse(stored) as PendingTest[];
        setState(prev => ({ ...prev, pendingTests }));
      }
    } catch (e) {
      console.warn('Failed to load pending tests from storage:', e);
    }
  }, []);

  // Save pending tests to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.pendingTests));
    } catch (e) {
      console.warn('Failed to save pending tests to storage:', e);
    }
  }, [state.pendingTests]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast({
        title: 'Back Online',
        description: 'Syncing pending screenings...',
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: 'Offline Mode',
        description: 'Screenings will be saved locally and synced when online.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Add a test to the offline queue
  const queueTest = useCallback((imageData: string): string => {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pendingTest: PendingTest = {
      id,
      imageData,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setState(prev => ({
      ...prev,
      pendingTests: [...prev.pendingTests, pendingTest],
    }));

    return id;
  }, []);

  // Remove a test from the queue
  const removeFromQueue = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      pendingTests: prev.pendingTests.filter(t => t.id !== id),
    }));
  }, []);

  // Sync a single pending test
  const syncTest = useCallback(async (pendingTest: PendingTest, _userId: string): Promise<boolean> => {
    try {
      const { error: analysisError } = await supabase.functions.invoke('analyze-sample', {
        body: {
          testType: 'malaria',
          imageData: pendingTest.imageData,
        },
      });

      if (analysisError) {
        throw analysisError;
      }

      return true;
    } catch (error) {
      console.error('Failed to sync test:', error);
      return false;
    }
  }, []);

  // Sync all pending tests
  const syncAll = useCallback(async (userId: string) => {
    if (!state.isOnline || state.isSyncing || state.pendingTests.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true }));

    const toRemove: string[] = [];
    const toRetry: PendingTest[] = [];

    for (const pendingTest of state.pendingTests) {
      const success = await syncTest(pendingTest, userId);
      
      if (success) {
        toRemove.push(pendingTest.id);
      } else if (pendingTest.retryCount < MAX_RETRIES) {
        toRetry.push({ ...pendingTest, retryCount: pendingTest.retryCount + 1 });
      } else {
        // Max retries exceeded, remove from queue
        toRemove.push(pendingTest.id);
        toast({
          title: 'Sync Failed',
          description: `Failed to sync screening from ${new Date(pendingTest.timestamp).toLocaleString()}. Please try again.`,
          variant: 'destructive',
        });
      }
    }

    setState(prev => ({
      ...prev,
      isSyncing: false,
      pendingTests: prev.pendingTests
        .filter(t => !toRemove.includes(t.id))
        .map(t => toRetry.find(r => r.id === t.id) || t),
    }));

    if (toRemove.length > 0) {
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${toRemove.length} pending screening(s).`,
      });
    }
  }, [state.isOnline, state.isSyncing, state.pendingTests, syncTest, toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (state.isOnline && state.pendingTests.length > 0 && !state.isSyncing) {
      // Get current user
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          syncAll(user.id);
        }
      });
    }
  }, [state.isOnline, state.pendingTests.length, state.isSyncing, syncAll]);

  return {
    isOnline: state.isOnline,
    pendingCount: state.pendingTests.length,
    isSyncing: state.isSyncing,
    queueTest,
    removeFromQueue,
    syncAll,
  };
}
