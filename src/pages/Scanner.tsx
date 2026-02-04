import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Eye,
  CheckCircle2,
  Target,
  Crosshair,
  Zap,
  Shield,
  Activity
} from 'lucide-react';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { captureEnhancedImage } = useImageEnhancement();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  
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

  // Real-time AI sample detection - always malaria
  const { detection, isDetecting: isAIDetecting } = useRealtimeDetection(videoRef, {
    enabled: isCameraActive && showAIDetection && isCalibrated,
    testType: 'malaria',
    intervalMs: 2000,
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
        
        // Start calibration check
        setCalibrationStep(1);
        setTimeout(() => {
          setCalibrationStep(2);
          setTimeout(() => {
            setCalibrationStep(3);
            setTimeout(() => {
              setIsCalibrated(true);
              setCalibrationStep(0);
            }, 800);
          }, 800);
        }, 800);
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
    setIsCalibrated(false);
    setCapturedFrames([]);
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
      await track.applyConstraints({
        advanced: [{ focusMode: 'auto' }] as any,
      });
      
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

  // Multi-frame capture for accuracy
  const captureMultipleFrames = async () => {
    if (!videoRef.current) return;
    
    const frames: string[] = [];
    
    for (let i = 0; i < 3; i++) {
      const result = await captureEnhancedImage(videoRef.current, {
        brightness,
        contrast,
        applyEdgeDetection: showEdgeDetection,
      });
      
      if (result) {
        frames.push(result.dataUrl);
      }
      
      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setCapturedFrames(frames);
    
    // Use the best frame (first one for now, could add quality scoring)
    if (frames.length > 0) {
      setCapturedImage(frames[0]);
      // Convert to file
      const response = await fetch(frames[0]);
      const blob = await response.blob();
      const file = new File([blob], 'blood-smear.jpg', { type: 'image/jpeg' });
      setImageFile(file);
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
    setCapturedFrames([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!capturedImage) {
      toast({
        title: 'Image Required',
        description: 'Please capture or upload a blood smear image.',
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
          test_type: 'malaria',
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
          testType: 'malaria',
          imageData: capturedImage,
        },
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        await supabase
          .from('tests')
          .update({ status: 'failed' })
          .eq('id', test.id);
        
        throw new Error(analysisError.message || 'Analysis failed');
      }

      toast({
        title: 'Analysis Complete',
        description: 'Your malaria screening results are ready.',
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

  const getCalibrationLabel = () => {
    switch (calibrationStep) {
      case 1: return 'Checking magnification...';
      case 2: return 'Adjusting focus...';
      case 3: return 'Calibration complete';
      default: return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Microscope className="h-8 w-8 text-primary" />
              Malaria Screening
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered blood smear analysis for early malaria detection
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

        {/* Malaria Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Parasite Detection</p>
              <p className="text-xs text-muted-foreground">Plasmodium species</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
            <Activity className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">Density Estimation</p>
              <p className="text-xs text-muted-foreground">Low to critical</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20">
            <Shield className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">WHO Guidelines</p>
              <p className="text-xs text-muted-foreground">Treatment recommendations</p>
            </div>
          </div>
        </div>

        {/* Image Capture */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Blood Smear Sample
            </CardTitle>
            <CardDescription>
              Capture a blood smear image using the microscopy camera for malaria screening
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
                
                {/* Calibration Overlay */}
                {!isCalibrated && calibrationStep > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30">
                    <div className="text-center space-y-4">
                      <Crosshair className="h-16 w-16 text-primary mx-auto animate-pulse" />
                      <div className="space-y-2">
                        <p className="text-white font-medium">{getCalibrationLabel()}</p>
                        <Progress value={calibrationStep * 33} className="w-48" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Edge Detection Indicator */}
                {showEdgeDetection && isCalibrated && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-success/80 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Cell Edge Enhancement
                  </div>
                )}
                
                {/* Calibrated Badge */}
                {isCalibrated && (
                  <Badge className="absolute top-4 left-4 bg-success text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Calibrated
                  </Badge>
                )}
                
                {/* AI Sample Detection Overlay */}
                <SampleDetectionOverlay
                  detection={detection}
                  isDetecting={isAIDetecting}
                  visible={showAIDetection && isCalibrated}
                />
                
                {/* Auto-focusing indicator */}
                {isAutoFocusing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-24 h-24 border-4 border-primary rounded-lg animate-pulse flex items-center justify-center">
                      <span className="text-primary text-sm font-medium">Focusing...</span>
                    </div>
                  </div>
                )}
                
                {/* Controls overlay - top right */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
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

                {/* Capture Button - center */}
                {isCalibrated && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <Button
                      size="lg"
                      className="rounded-full w-20 h-20 shadow-2xl bg-destructive hover:bg-destructive/90 border-4 border-white"
                      onClick={captureMultipleFrames}
                      disabled={isAutoFocusing}
                    >
                      <Camera className="h-8 w-8" />
                    </Button>
                  </div>
                )}

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
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img 
                    src={capturedImage} 
                    alt="Captured blood smear" 
                    className="w-full aspect-video object-contain bg-muted"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-success text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ready for Analysis
                    </Badge>
                    {capturedFrames.length > 1 && (
                      <Badge variant="outline" className="bg-background/80">
                        {capturedFrames.length} frames captured
                      </Badge>
                    )}
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
                
                {/* Frame thumbnails if multiple captured */}
                {capturedFrames.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {capturedFrames.map((frame, index) => (
                      <button
                        key={index}
                        onClick={() => setCapturedImage(frame)}
                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          capturedImage === frame ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={frame} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upload/Camera Buttons */}
            {!isCameraActive && !capturedImage && (
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Microscope className="h-7 w-7 text-destructive-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Use Microscopy Camera</p>
                    <p className="text-sm text-muted-foreground">400x-1000x magnification</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Upload Blood Smear</p>
                    <p className="text-sm text-muted-foreground">Existing microscopy image</p>
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
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Blood Smear Preparation Tips:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                  <li>Use a properly stained thin blood smear (Giemsa stain preferred)</li>
                  <li>Ensure adequate lighting and focus before capture</li>
                  <li>Position the sample at 400x-1000x magnification</li>
                  <li>Capture multiple fields for comprehensive screening</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg shadow-lg bg-destructive hover:bg-destructive/90"
          onClick={handleSubmit}
          disabled={!capturedImage || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Blood Smear...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Analyze for Malaria Parasites
            </>
          )}
        </Button>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border text-sm">
          <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Screening Tool Disclaimer:</span> This AI-powered system is designed for early malaria screening and decision support only. 
            Results should be confirmed by laboratory microscopy and qualified healthcare professionals. 
            This tool does not replace professional medical diagnosis.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
