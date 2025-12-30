import React from 'react';

interface GridOverlayProps {
  visible: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Horizontal lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="w-full h-px bg-primary/30"
          />
        ))}
      </div>
      
      {/* Vertical lines */}
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="h-full w-px bg-primary/30"
          />
        ))}
      </div>

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/50 transform -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/50 transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/50 rounded-full" />
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/40" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/40" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/40" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/40" />
    </div>
  );
};
