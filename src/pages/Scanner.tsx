import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MicroscopeControls } from '@/components/MicroscopeControls';
import { GridOverlay } from '@/components/GridOverlay';
import { SampleDetectionOverlay } from '@/components/SampleDetectionOverlay';
import { useImageEnhancement } from '@/hooks/useImageEnhancement';
import { useRealtimeDetection } from '@/hooks/useRealtimeDetection';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2,
  Microscope,
  AlertCircle,
  Sparkles,
  Wifi,
  WifiOff,
  Eye
} from 'lucide-react';
import type { TestType } from '@/types/database';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { captureEnhancedImage } = useImageEnhancement();
  
  const [testType, setTestType] = useState<TestType | ''>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Advanced microscope controls
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showEdgeDetection, setShowEdgeDetection] = useState(false);
  const [isAutoFocusing, setIsAutoFocusing] = useState(false);
  const [showAIDetection, setShowAIDetection] = useState(true);
  const [cameraCapabilities, setCameraCapabilities] = useState<{
    hasTorch: boolean;
    hasFocus: boolean;
    hasZoom: boolean;
  }>({ hasTorch: false, hasFocus: false, hasZoom: false });

  // Real-time AI sample detection
  const { detection, isDetecting: isAIDetecting } = useRealtimeDetection(videoRef, {
    enabled: isCameraActive && showAIDetection && !!testType,
    testType: testType as 'malaria' | 'pregnancy' | '',
    intervalMs: 2500,
  });

  // Check camera capabilities
  const checkCameraCapabilities = useCallback(async (mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    if (track) {
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & {
        torch?: boolean;
        focusMode?: string[];
        zoom?: { min: number; max: number };
      };
      setCameraCapabilities({
        hasTorch: Boolean(capabilities?.torch),
        hasFocus: Boolean(capabilities?.focusMode?.includes('continuous')),
        hasZoom: Boolean(capabilities?.zoom),
      });
    }
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          advanced: [{ focusMode: 'continuous' }] as any,
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
        await checkCameraCapabilities(mediaStream);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleAutoFocus = async () => {
    if (!stream) return;
    
    setIsAutoFocusing(true);
    const track = stream.getVideoTracks()[0];
    
    try {
      // Try to trigger auto-focus
      await track.applyConstraints({
        advanced: [{ focusMode: 'auto' }] as any,
      });
      
      // Brief delay then switch back to continuous
      setTimeout(async () => {
        try {
          await track.applyConstraints({
            advanced: [{ focusMode: 'continuous' }] as any,
          });
        } catch {
          // Ignore if not supported
        }
        setIsAutoFocusing(false);
      }, 1500);
    } catch {
      setIsAutoFocusing(false);
    }
  };

  const resetControls = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setShowGrid(false);
    setShowEdgeDetection(false);
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    
    const result = await captureEnhancedImage(videoRef.current, {
      brightness,
      contrast,
      applyEdgeDetection: showEdgeDetection,
    });
    
    if (result) {
      setCapturedImage(result.dataUrl);
      setImageFile(result.file);
    }
    
    stopCamera();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 10MB.',
        variant: 'destructive',
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setCapturedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!testType) {
      toast({
        title: 'Test Type Required',
        description: 'Please select a test type before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    if (!capturedImage) {
      toast({
        title: 'Image Required',
        description: 'Please capture or upload an image.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to analyze samples.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create test record
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          user_id: user.id,
          test_type: testType,
          status: 'processing',
        })
        .select()
        .single();

      if (testError) {
        console.error('Test creation error:', testError);
        throw new Error('Failed to create test record');
      }

      // Call AI analysis edge function
      const { error: analysisError } = await supabase.functions.invoke('analyze-sample', {
        body: {
          testId: test.id,
          testType,
          imageData: capturedImage,
        },
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        // Update test status to failed
        await supabase
          .from('tests')
          .update({ status: 'failed' })
          .eq('id', test.id);
        
        throw new Error(analysisError.message || 'Analysis failed');
      }

      toast({
        title: 'Analysis Complete',
        description: 'Your test results are ready.',
      });

      navigate(`/results/${test.id}`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unable to analyze the sample. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Microscope className="h-8 w-8 text-primary" />
              AI Microscopy Scanner
            </h1>
            <p className="text-muted-foreground mt-1">
              Advanced sample analysis with real-time image enhancement
            </p>
          </div>
          {isCameraActive && (
            <div className="flex items-center gap-2 text-sm">
              {cameraCapabilities.hasFocus ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">
                {cameraCapabilities.hasFocus ? 'Auto-focus active' : 'Basic mode'}
              </span>
            </div>
          )}
        </div>

        {/* Test Type Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Select Test Type
            </CardTitle>
            <CardDescription>
              Choose the type of diagnostic test you want to perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={testType} onValueChange={(value) => setTestType(value as TestType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="malaria">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    Malaria Test (Blood Smear Analysis)
                  </div>
                </SelectItem>
                <SelectItem value="pregnancy">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Pregnancy Test (HCG Detection)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Image Capture */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Sample Image
            </CardTitle>
            <CardDescription>
              Use the advanced microscopy camera or upload an existing image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera View */}
            {isCameraActive && (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%)${showEdgeDetection ? ' saturate(1.2)' : ''}`,
                  }}
                />
                
                {/* Grid Overlay */}
                <GridOverlay visible={showGrid} />
                
                {/* Edge Detection Indicator */}
                {showEdgeDetection && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-success/80 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Edge Detection Active
                  </div>
                )}
                
                {/* AI Sample Detection Overlay */}
                <SampleDetectionOverlay
                  detection={detection}
                  isDetecting={isAIDetecting}
                  visible={showAIDetection && !!testType}
                />
                
                {/* Auto-focusing indicator */}
                {isAutoFocusing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 border-4 border-primary rounded-lg animate-pulse flex items-center justify-center">
                      <span className="text-primary text-sm font-medium">Focusing...</span>
                    </div>
                  </div>
                )}
                
                {/* Controls overlay - top right */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant={showAIDetection ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setShowAIDetection(!showAIDetection)}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    AI
                  </Button>
                  <Button variant="secondary" size="sm" onClick={stopCamera}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <Button
                    size="lg"
                    className="rounded-full w-20 h-20 shadow-2xl bg-primary hover:bg-primary/90 border-4 border-white"
                    onClick={captureFromCamera}
                    disabled={isAutoFocusing}
                  >
                    <Camera className="h-8 w-8" />
                  </Button>
                </div>

                {/* Advanced Controls */}
                <MicroscopeControls
                  zoom={zoom}
                  setZoom={setZoom}
                  brightness={brightness}
                  setBrightness={setBrightness}
                  contrast={contrast}
                  setContrast={setContrast}
                  showGrid={showGrid}
                  setShowGrid={setShowGrid}
                  showEdgeDetection={showEdgeDetection}
                  setShowEdgeDetection={setShowEdgeDetection}
                  onAutoFocus={handleAutoFocus}
                  onReset={resetControls}
                  isAutoFocusing={isAutoFocusing}
                />
              </div>
            )}

            {/* Captured Image Preview */}
            {capturedImage && !isCameraActive && (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img 
                  src={capturedImage} 
                  alt="Captured sample" 
                  className="w-full aspect-video object-contain bg-muted"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-success/80 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Image Ready for Analysis
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload/Camera Buttons */}
            {!isCameraActive && !capturedImage && (
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Microscope className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Use Microscopy Camera</p>
                    <p className="text-sm text-muted-foreground">Advanced controls & enhancement</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-secondary/30 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-7 w-7 text-secondary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Upload Image</p>
                    <p className="text-sm text-muted-foreground">Select from device</p>
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {/* Tips */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Tips for best results:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                  <li>Use the grid overlay to center your sample</li>
                  <li>Enable edge detection for better cell boundary visibility</li>
                  <li>Adjust brightness and contrast for optimal clarity</li>
                  <li>Use auto-focus before capturing for sharp images</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg shadow-lg"
          onClick={handleSubmit}
          disabled={!testType || !capturedImage || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Sample with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze Sample
            </>
          )}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
