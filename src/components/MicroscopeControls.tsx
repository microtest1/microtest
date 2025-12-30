import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ZoomIn,
  ZoomOut,
  Sun,
  Focus,
  Grid3X3,
  Scan,
  RotateCw,
  Contrast,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MicroscopeControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  contrast: number;
  setContrast: (contrast: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showEdgeDetection: boolean;
  setShowEdgeDetection: (show: boolean) => void;
  onAutoFocus: () => void;
  onReset: () => void;
  isAutoFocusing?: boolean;
}

export const MicroscopeControls: React.FC<MicroscopeControlsProps> = ({
  zoom,
  setZoom,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  showGrid,
  setShowGrid,
  showEdgeDetection,
  setShowEdgeDetection,
  onAutoFocus,
  onReset,
  isAutoFocusing = false,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl">
      <div className="bg-background/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl p-4 space-y-3">
        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? "default" : "ghost"}
                size="icon"
                onClick={() => setShowGrid(!showGrid)}
                className="h-10 w-10"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Grid Overlay</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showEdgeDetection ? "default" : "ghost"}
                size="icon"
                onClick={() => setShowEdgeDetection(!showEdgeDetection)}
                className="h-10 w-10"
              >
                <Scan className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edge Detection</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAutoFocus}
                disabled={isAutoFocusing}
                className="h-10 w-10"
              >
                <Focus className={`h-5 w-5 ${isAutoFocusing ? 'animate-pulse' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto Focus</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                className="h-10 w-10"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Settings</TooltipContent>
          </Tooltip>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-3 gap-4">
          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Zoom</span>
              </div>
              <span className="font-medium">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={1}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Brightness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Brightness</span>
              </div>
              <span className="font-medium">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              onValueChange={([v]) => setBrightness(v)}
              min={50}
              max={150}
              step={5}
              className="w-full"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Contrast className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Contrast</span>
              </div>
              <span className="font-medium">{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              onValueChange={([v]) => setContrast(v)}
              min={50}
              max={150}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
