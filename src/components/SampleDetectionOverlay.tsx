import React from 'react';
import { DetectionResult } from '@/hooks/useRealtimeDetection';
import { CheckCircle2, AlertCircle, Target, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleDetectionOverlayProps {
  detection: DetectionResult | null;
  isDetecting: boolean;
  visible: boolean;
}

export const SampleDetectionOverlay: React.FC<SampleDetectionOverlayProps> = ({
  detection,
  isDetecting,
  visible,
}) => {
  if (!visible) return null;

  const getQualityColor = (quality: DetectionResult['quality']) => {
    switch (quality) {
      case 'excellent':
        return 'border-green-500 bg-green-500/20';
      case 'good':
        return 'border-emerald-400 bg-emerald-400/20';
      case 'fair':
        return 'border-yellow-400 bg-yellow-400/20';
      case 'poor':
        return 'border-orange-500 bg-orange-500/20';
      default:
        return 'border-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (detection: DetectionResult | null) => {
    if (!detection) return 'bg-muted text-muted-foreground';
    if (detection.ready_for_capture) return 'bg-green-500 text-white';
    if (detection.detected) return 'bg-yellow-500 text-black';
    return 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (detection: DetectionResult | null) => {
    if (!detection) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (detection.ready_for_capture) return <CheckCircle2 className="h-4 w-4" />;
    if (detection.detected) return <AlertCircle className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <>
      {/* Detection Bounding Box */}
      {detection?.detected && detection.position && (
        <div
          className={cn(
            'absolute border-2 rounded-lg transition-all duration-300 pointer-events-none',
            getQualityColor(detection.quality),
            detection.ready_for_capture && 'animate-pulse'
          )}
          style={{
            left: `${detection.position.x}%`,
            top: `${detection.position.y}%`,
            width: `${detection.position.width}%`,
            height: `${detection.position.height}%`,
          }}
        >
          {/* Corner markers */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-current rounded-tl" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-current rounded-tr" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-current rounded-bl" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-current rounded-br" />
          
          {/* Sample type label */}
          <div className="absolute -top-6 left-0 text-xs font-medium px-2 py-0.5 rounded bg-black/70 text-white capitalize">
            {detection.sample_type.replace('_', ' ')}
          </div>
        </div>
      )}

      {/* Crosshair guide when no sample detected */}
      {(!detection?.detected) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-32 h-32">
            {/* Center target */}
            <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-lg" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
            {/* Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300',
            getStatusColor(detection)
          )}
        >
          {isDetecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            getStatusIcon(detection)
          )}
          <span className="text-sm font-medium">
            {isDetecting
              ? 'Scanning...'
              : detection?.feedback || 'Position sample in frame'}
          </span>
        </div>
      </div>

      {/* Quality indicator badge */}
      {detection?.detected && (
        <div className="absolute top-4 right-16 pointer-events-none">
          <div
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg',
              detection.quality === 'excellent' && 'bg-green-500/90 text-white',
              detection.quality === 'good' && 'bg-emerald-400/90 text-black',
              detection.quality === 'fair' && 'bg-yellow-400/90 text-black',
              detection.quality === 'poor' && 'bg-orange-500/90 text-white',
              detection.quality === 'none' && 'bg-gray-500/90 text-white'
            )}
          >
            {detection.quality.toUpperCase()} QUALITY
          </div>
        </div>
      )}

      {/* Ready to capture indicator */}
      {detection?.ready_for_capture && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-green-500 rounded-xl animate-pulse" />
        </div>
      )}
    </>
  );
};
