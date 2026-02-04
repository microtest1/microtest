import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ImageAnnotator } from '@/components/ImageAnnotator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeftRight,
  Microscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  PenTool,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dataset {
  id: string;
  name: string;
  description: string | null;
  test_type: 'malaria';
  classification: string | null;
  image_url: string | null;
  metadata?: Record<string, unknown>;
}

interface ComparisonViewProps {
  testId: string;
  testType: 'malaria';
  testImageUrl?: string | null;
  testSeverity?: string | null;
  testFindings?: string | null;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  testId,
  testType,
  testImageUrl,
  testSeverity,
  testFindings,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [annotatingImage, setAnnotatingImage] = useState<'test' | 'reference' | null>(null);
  const [testAnnotationData, setTestAnnotationData] = useState<object | null>(null);
  const [referenceAnnotationData, setReferenceAnnotationData] = useState<object | null>(null);

  // Fetch saved annotations
  const { data: annotations } = useQuery({
    queryKey: ['annotations', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('test_id', testId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });

  // Load annotation data when annotations are fetched
  React.useEffect(() => {
    if (annotations) {
      const testAnnotation = annotations.find(a => a.image_type === 'test');
      const refAnnotation = annotations.find(a => 
        a.image_type === 'reference' && a.reference_dataset_id === selectedDataset?.id
      );
      
      setTestAnnotationData(testAnnotation?.annotation_data as object || null);
      setReferenceAnnotationData(refAnnotation?.annotation_data as object || null);
    }
  }, [annotations, selectedDataset]);

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['comparison-datasets', testType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('test_type', testType)
        .order('classification', { ascending: true });
      
      if (error) throw error;
      return data as Dataset[];
    },
  });

  const getClassificationColor = (classification: string | null) => {
    if (!classification) return 'bg-muted';
    const lower = classification.toLowerCase();
    if (lower.includes('negative')) return 'bg-success';
    if (lower.includes('severe')) return 'bg-destructive';
    if (lower.includes('moderate')) return 'bg-warning';
    if (lower.includes('mild') || lower.includes('positive')) return 'bg-accent';
    return 'bg-primary';
  };

  const getClassificationIcon = (classification: string | null) => {
    if (!classification) return Info;
    const lower = classification.toLowerCase();
    if (lower.includes('negative')) return CheckCircle;
    if (lower.includes('severe')) return XCircle;
    return AlertCircle;
  };

  const handlePrevDataset = () => {
    if (!datasets || !selectedDataset) return;
    const currentIndex = datasets.findIndex(d => d.id === selectedDataset.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : datasets.length - 1;
    setSelectedDataset(datasets[prevIndex]);
  };

  const handleNextDataset = () => {
    if (!datasets || !selectedDataset) return;
    const currentIndex = datasets.findIndex(d => d.id === selectedDataset.id);
    const nextIndex = currentIndex < datasets.length - 1 ? currentIndex + 1 : 0;
    setSelectedDataset(datasets[nextIndex]);
  };

  const resetZoom = () => setZoom(1);

  // Auto-select first dataset matching severity
  React.useEffect(() => {
    if (datasets && datasets.length > 0 && !selectedDataset) {
      // Try to find a dataset that matches the test severity
      const matchingSeverity = datasets.find(d => 
        d.classification?.toLowerCase().includes(testSeverity?.toLowerCase() || '')
      );
      setSelectedDataset(matchingSeverity || datasets[0]);
    }
  }, [datasets, selectedDataset, testSeverity]);

  return (
    <>
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span>Compare with Reference</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    Side-by-side comparison with {testType} reference samples
                  </p>
                </div>
              </div>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>
              </DialogTrigger>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
            {/* Your Test Result */}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Your Test Result
                </h3>
                {testSeverity && (
                  <Badge className={cn(
                    getClassificationColor(testSeverity),
                    'text-white'
                  )}>
                    {testSeverity}
                  </Badge>
                )}
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50 group">
                {testImageUrl ? (
                  <>
                    <img
                      src={testImageUrl}
                      alt="Your test result"
                      className="w-full h-full object-contain transition-transform duration-300"
                      style={{ transform: `scale(${zoom})` }}
                    />
                    {/* Annotate Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => setAnnotatingImage('test')}
                    >
                      <PenTool className="h-4 w-4 mr-1" />
                      Annotate
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Microscope className="h-12 w-12 mb-2 opacity-40" />
                    <span className="text-sm">No image available</span>
                  </div>
                )}
              </div>

              {testFindings && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium text-foreground mb-1">AI Findings:</p>
                  <p className="line-clamp-3">{testFindings}</p>
                </div>
              )}
            </div>

            {/* Reference Dataset */}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Reference Sample
                </h3>
                {selectedDataset?.classification && (
                  <Badge className={cn(
                    getClassificationColor(selectedDataset.classification),
                    'text-white'
                  )}>
                    {selectedDataset.classification}
                  </Badge>
                )}
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50 group">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : selectedDataset?.image_url ? (
                  <>
                    <img
                      src={selectedDataset.image_url}
                      alt={selectedDataset.name}
                      className="w-full h-full object-contain transition-transform duration-300"
                      style={{ transform: `scale(${zoom})` }}
                    />
                    {/* Navigation arrows */}
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        onClick={handlePrevDataset}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                        onClick={handleNextDataset}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                    {/* Annotate Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => setAnnotatingImage('reference')}
                    >
                      <PenTool className="h-4 w-4 mr-1" />
                      Annotate
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-sm">Select a reference sample</span>
                  </div>
                )}
              </div>

              {selectedDataset && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium text-foreground mb-1">{selectedDataset.name}</p>
                  <p className="line-clamp-3">{selectedDataset.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-2 p-3 border-t border-border/50 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Reference Dataset Selector */}
          <div className="border-t border-border/50">
            <div className="p-3 flex items-center justify-between bg-muted/20">
              <span className="text-sm font-medium">Select Reference Sample:</span>
              <span className="text-xs text-muted-foreground">
                {datasets?.length || 0} samples available
              </span>
            </div>
            <ScrollArea className="h-24">
              <div className="flex gap-2 p-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-20 h-16 shrink-0 rounded-lg" />
                  ))
                ) : datasets?.map((dataset) => {
                  const Icon = getClassificationIcon(dataset.classification);
                  const isSelected = selectedDataset?.id === dataset.id;
                  
                  return (
                    <button
                      key={dataset.id}
                      onClick={() => setSelectedDataset(dataset)}
                      className={cn(
                        "relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                        isSelected 
                          ? "border-primary ring-2 ring-primary/30" 
                          : "border-transparent hover:border-primary/50"
                      )}
                    >
                      {dataset.image_url ? (
                        <img
                          src={dataset.image_url}
                          alt={dataset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Microscope className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className={cn(
                        "absolute bottom-0 left-0 right-0 py-0.5 text-[10px] text-white text-center truncate px-1",
                        getClassificationColor(dataset.classification)
                      )}>
                        {dataset.classification || 'Unknown'}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Full Comparison View
          </DialogTitle>
          <DialogDescription>
            Compare your test result with reference samples in detail
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Your Result - Fullscreen */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Your Test Result
              </h3>
              {testSeverity && (
                <Badge className={cn(getClassificationColor(testSeverity), 'text-white')}>
                  {testSeverity}
                </Badge>
              )}
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
              {testImageUrl ? (
                <img
                  src={testImageUrl}
                  alt="Your test"
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${zoom})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Reference - Fullscreen */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                {selectedDataset?.name || 'Reference Sample'}
              </h3>
              {selectedDataset?.classification && (
                <Badge className={cn(getClassificationColor(selectedDataset.classification), 'text-white')}>
                  {selectedDataset.classification}
                </Badge>
              )}
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border/50 relative group">
              {selectedDataset?.image_url ? (
                <>
                  <img
                    src={selectedDataset.image_url}
                    alt={selectedDataset.name}
                    className="w-full h-full object-contain"
                    style={{ transform: `scale(${zoom})` }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={handlePrevDataset}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={handleNextDataset}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Select a reference
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen Reference Selector */}
        <ScrollArea className="h-28 mt-4">
          <div className="flex gap-3">
            {datasets?.map((dataset) => {
              const isSelected = selectedDataset?.id === dataset.id;
              return (
                <button
                  key={dataset.id}
                  onClick={() => setSelectedDataset(dataset)}
                  className={cn(
                    "relative shrink-0 w-28 h-20 rounded-lg overflow-hidden border-2 transition-all",
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                  )}
                >
                  {dataset.image_url ? (
                    <img src={dataset.image_url} alt={dataset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Microscope className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className={cn(
                    "absolute bottom-0 inset-x-0 py-0.5 text-xs text-white text-center truncate px-1",
                    getClassificationColor(dataset.classification)
                  )}>
                    {dataset.classification}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    {/* Annotation Dialog */}
    <Dialog open={!!annotatingImage} onOpenChange={() => setAnnotatingImage(null)}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
        {annotatingImage === 'test' && testImageUrl && (
          <ImageAnnotator
            imageUrl={testImageUrl}
            title="Annotate Your Test Result"
            onClose={() => setAnnotatingImage(null)}
            testId={testId}
            imageType="test"
            initialAnnotationData={testAnnotationData || undefined}
          />
        )}
        {annotatingImage === 'reference' && selectedDataset?.image_url && (
          <ImageAnnotator
            imageUrl={selectedDataset.image_url}
            title={`Annotate: ${selectedDataset.name}`}
            onClose={() => setAnnotatingImage(null)}
            testId={testId}
            imageType="reference"
            referenceDatasetId={selectedDataset.id}
            initialAnnotationData={referenceAnnotationData || undefined}
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
