import React from 'react';
import type { DetectedRegion } from '@/types/database';

interface DetectionOverlayProps {
  imageUrl: string;
  regions: DetectedRegion[];
  className?: string;
  alt?: string;
}

/**
 * Renders the sample image with normalized (0-1) bounding boxes drawn over it.
 * Boxes scale with the image so positions remain correct at any width.
 */
export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  imageUrl,
  regions,
  className = '',
  alt = 'Blood smear sample',
}) => {
  const safeRegions = Array.isArray(regions) ? regions : [];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-black ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-auto block select-none"
        draggable={false}
      />
      <div className="absolute inset-0 pointer-events-none">
        {safeRegions.map((r, i) => {
          const left = `${Math.max(0, Math.min(1, r.x)) * 100}%`;
          const top = `${Math.max(0, Math.min(1, r.y)) * 100}%`;
          const width = `${Math.max(0, Math.min(1, r.width)) * 100}%`;
          const height = `${Math.max(0, Math.min(1, r.height)) * 100}%`;
          const conf = typeof r.confidence === 'number' ? Math.round(r.confidence) : null;
          return (
            <div
              key={i}
              className="absolute border-2 border-warning rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.4)] animate-fade-in"
              style={{ left, top, width, height, animationDelay: `${i * 60}ms` }}
            >
              <span className="absolute -top-6 left-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-warning-foreground bg-warning px-1.5 py-0.5 rounded whitespace-nowrap">
                {r.label || `Region ${i + 1}`}
                {conf !== null && <span className="opacity-80">· {conf}%</span>}
              </span>
            </div>
          );
        })}
        {safeRegions.length === 0 && (
          <div className="absolute bottom-2 right-2 text-[10px] font-medium text-white/70 bg-black/40 px-2 py-1 rounded">
            No candidate regions highlighted
          </div>
        )}
      </div>
    </div>
  );
};
