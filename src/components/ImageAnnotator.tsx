import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Line, PencilBrush, FabricText } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  MousePointer2,
  Pencil,
  Circle as CircleIcon,
  Square,
  Minus,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Palette,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AnnotationTool = 'select' | 'draw' | 'rectangle' | 'circle' | 'line' | 'text' | 'eraser';

interface ImageAnnotatorProps {
  imageUrl: string;
  onClose?: () => void;
  onSave?: (dataUrl: string) => void;
  title?: string;
  testId?: string;
  imageType?: 'test' | 'reference';
  referenceDatasetId?: string;
  initialAnnotationData?: object;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ffffff', // white
  '#000000', // black
];

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageUrl,
  onClose,
  onSave,
  title = 'Annotate Image',
  testId,
  imageType,
  referenceDatasetId,
  initialAnnotationData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
  const [activeColor, setActiveColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#1a1a2e',
      selection: true,
    });

    // Load background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate scale to fit image in canvas
      const scale = Math.min(width / img.width, height / img.height) * 0.9;
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Create a temporary canvas to draw the image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.fillStyle = '#1a1a2e';
        tempCtx.fillRect(0, 0, width, height);
        tempCtx.drawImage(
          img,
          (width - scaledWidth) / 2,
          (height - scaledHeight) / 2,
          scaledWidth,
          scaledHeight
        );
        
        // In Fabric.js v6, set background using backgroundImage property
        const bgImg = new Image();
        bgImg.onload = () => {
          import('fabric').then(({ FabricImage }) => {
            FabricImage.fromURL(tempCanvas.toDataURL()).then((fabricImg) => {
              canvas.backgroundImage = fabricImg;
              canvas.renderAll();
              setIsReady(true);
              saveState(canvas);
            });
          });
        };
        bgImg.src = tempCanvas.toDataURL();
      }
    };
    img.src = imageUrl;

    // Initialize brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  // Save state for undo/redo
  const saveState = useCallback((canvas: FabricCanvas) => {
    const json = JSON.stringify(canvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      return newHistory.slice(-20); // Keep last 20 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
    setHasUnsavedChanges(true);
  }, [historyIndex]);

  // Load initial annotation data if provided
  useEffect(() => {
    if (fabricCanvas && initialAnnotationData && isReady) {
      fabricCanvas.loadFromJSON(initialAnnotationData, () => {
        fabricCanvas.renderAll();
        setHasUnsavedChanges(false);
      });
    }
  }, [fabricCanvas, initialAnnotationData, isReady]);

  // Save annotation to database
  const saveToDatabase = async () => {
    if (!fabricCanvas || !testId || !imageType) {
      toast.error('Cannot save: missing required information');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save annotations');
        return;
      }

      const annotationData = fabricCanvas.toJSON();
      const annotatedImageUrl = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });

      // Check if annotation already exists
      const { data: existing } = await supabase
        .from('annotations')
        .select('id')
        .eq('test_id', testId)
        .eq('image_type', imageType)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing annotation
        const { error } = await supabase
          .from('annotations')
          .update({
            annotation_data: annotationData,
            annotated_image_url: annotatedImageUrl,
            reference_dataset_id: referenceDatasetId || null,
          })
          .eq('id', existing.id);

        if (error) throw error;
        toast.success('Annotation updated successfully');
      } else {
        // Create new annotation
        const { error } = await supabase
          .from('annotations')
          .insert({
            test_id: testId,
            user_id: user.id,
            image_type: imageType,
            annotation_data: annotationData,
            annotated_image_url: annotatedImageUrl,
            reference_dataset_id: referenceDatasetId || null,
          });

        if (error) throw error;
        toast.success('Annotation saved successfully');
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving annotation:', error);
      toast.error('Failed to save annotation');
    } finally {
      setIsSaving(false);
    }
  };

  // Update tool settings
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw' || activeTool === 'eraser';
    
    if (fabricCanvas.freeDrawingBrush) {
      if (activeTool === 'eraser') {
        fabricCanvas.freeDrawingBrush.color = '#1a1a2e';
        fabricCanvas.freeDrawingBrush.width = brushSize * 3;
      } else {
        fabricCanvas.freeDrawingBrush.color = activeColor;
        fabricCanvas.freeDrawingBrush.width = brushSize;
      }
    }

    // Update selection mode
    fabricCanvas.selection = activeTool === 'select';
    fabricCanvas.forEachObject((obj) => {
      obj.selectable = activeTool === 'select';
      obj.evented = activeTool === 'select';
    });
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  // Handle canvas clicks for shapes
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (e: any) => {
      if (activeTool === 'select' || activeTool === 'draw' || activeTool === 'eraser') return;
      
      const pointer = fabricCanvas.getScenePoint(e.e);
      let shape;

      switch (activeTool) {
        case 'rectangle':
          shape = new Rect({
            left: pointer.x - 40,
            top: pointer.y - 30,
            width: 80,
            height: 60,
            fill: 'transparent',
            stroke: activeColor,
            strokeWidth: brushSize,
            strokeUniform: true,
          });
          break;
        case 'circle':
          shape = new Circle({
            left: pointer.x - 30,
            top: pointer.y - 30,
            radius: 30,
            fill: 'transparent',
            stroke: activeColor,
            strokeWidth: brushSize,
            strokeUniform: true,
          });
          break;
        case 'line':
          shape = new Line([pointer.x - 40, pointer.y, pointer.x + 40, pointer.y], {
            stroke: activeColor,
            strokeWidth: brushSize,
            strokeUniform: true,
          });
          break;
        case 'text':
          shape = new FabricText('Label', {
            left: pointer.x,
            top: pointer.y,
            fill: activeColor,
            fontSize: 16 + brushSize * 2,
            fontFamily: 'sans-serif',
            editable: true,
          });
          break;
      }

      if (shape) {
        fabricCanvas.add(shape);
        fabricCanvas.setActiveObject(shape);
        fabricCanvas.renderAll();
        saveState(fabricCanvas);
        setActiveTool('select');
      }
    };

    const handlePathCreated = () => {
      saveState(fabricCanvas);
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('path:created', handlePathCreated);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('path:created', handlePathCreated);
    };
  }, [fabricCanvas, activeTool, activeColor, brushSize, saveState]);

  const handleUndo = () => {
    if (!fabricCanvas || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    fabricCanvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleRedo = () => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    fabricCanvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    
    // Remove all objects but keep background
    fabricCanvas.getObjects().forEach(obj => {
      fabricCanvas.remove(obj);
    });
    fabricCanvas.renderAll();
    saveState(fabricCanvas);
  };

  const handleSave = () => {
    if (!fabricCanvas || !onSave) return;
    
    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    onSave(dataUrl);
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    
    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.download = 'annotated-image.png';
    link.href = dataUrl;
    link.click();
  };

  const tools: { id: AnnotationTool; icon: React.ElementType; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'draw', icon: Pencil, label: 'Draw' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: CircleIcon, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: activeColor }}
              />
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                    activeColor === color ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Brush Size */}
        <div className="flex items-center gap-2 px-3">
          <span className="text-xs text-muted-foreground">Size:</span>
          <Slider
            value={[brushSize]}
            onValueChange={([v]) => setBrushSize(v)}
            min={1}
            max={10}
            step={1}
            className="w-20"
          />
          <span className="text-xs font-medium w-4">{brushSize}</span>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleClear}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear All</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        {/* Save/Download */}
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {testId && imageType && (
          <Button 
            size="sm" 
            onClick={saveToDatabase}
            disabled={isSaving || !hasUnsavedChanges}
            variant={hasUnsavedChanges ? 'default' : 'outline'}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save to Test' : 'Saved'}
          </Button>
        )}
        {onSave && (
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        )}
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef} 
        className="flex-1 relative min-h-[300px] bg-[#1a1a2e]"
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        <canvas ref={canvasRef} className={cn(!isReady && 'opacity-0')} />
      </div>

      {/* Help Text */}
      <div className="p-2 text-xs text-muted-foreground text-center bg-muted/20 border-t border-border">
        {activeTool === 'select' && 'Click and drag to select and move annotations'}
        {activeTool === 'draw' && 'Draw freehand on the image'}
        {activeTool === 'rectangle' && 'Click to place a rectangle'}
        {activeTool === 'circle' && 'Click to place a circle'}
        {activeTool === 'line' && 'Click to place a line'}
        {activeTool === 'text' && 'Click to add text label'}
        {activeTool === 'eraser' && 'Draw to erase annotations'}
      </div>
    </div>
  );
};
