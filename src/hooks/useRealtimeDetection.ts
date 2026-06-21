import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DetectionResult {
  detected: boolean;
  sample_type: 'blood' | 'unknown' | 'none';
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  feedback: string;
  ready_for_capture: boolean;
}

interface UseRealtimeDetectionOptions {
  enabled: boolean;
  testType: 'malaria' | '';
  intervalMs?: number;
}

export function useRealtimeDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseRealtimeDetectionOptions
) {
  const { enabled, testType, intervalMs = 2000 } = options;
  
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    const canvas = canvasRef.current;
    // Use smaller resolution for faster detection
    const width = 640;
    const height = 480;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.6);
  }, [videoRef]);

  const detectSample = useCallback(async () => {
    if (!enabled || !testType || isDetecting) return;

    const frameData = captureFrame();
    if (!frameData) return;

    setIsDetecting(true);

    try {
      const { data, error } = await supabase.functions.invoke('detect-sample', {
        body: { imageData: frameData, testType: 'malaria' },
      });

      if (error) {
        console.warn('Detection error:', error);
        return;
      }

      setDetection(data as DetectionResult);
    } catch (err) {
      console.warn('Detection failed:', err);
    } finally {
      setIsDetecting(false);
    }
  }, [enabled, testType, isDetecting, captureFrame]);

  useEffect(() => {
    if (enabled && testType) {
      // Initial detection after a short delay
      const initialTimeout = setTimeout(detectSample, 500);
      
      // Set up interval for continuous detection
      intervalRef.current = setInterval(detectSample, intervalMs);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      setDetection(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [enabled, testType, intervalMs, detectSample]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    detection,
    isDetecting,
    detectNow: detectSample,
  };
}
