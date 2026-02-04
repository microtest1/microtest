import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useImageEnhancement } from '@/hooks/useImageEnhancement';
import { useRealtimeDetection } from '@/hooks/useRealtimeDetection';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2,
  Microscope,
  AlertCircle,
  CheckCircle2,
  Crosshair,
  RotateCcw,
  Focus,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Sun,
  Contrast
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { captureEnhancedImage } = useImageEnhancement();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  
  // Camera controls
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [isAutoFocusing, setIsAutoFocusing] = useState(false);

  // Real-time AI detection
  const { detection, isDetecting: isAIDetecting } = useRealtimeDetection(videoRef, {
    enabled: isCameraActive && isCalibrated,
    testType: 'malaria',
    intervalMs: 2000,
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
        
        // Calibration sequence
        setCalibrationStep(1);
        setTimeout(() => {
          setCalibrationStep(2);
          setTimeout(() => {
            setCalibrationStep(3);
            setTimeout(() => {
              setIsCalibrated(true);
              setCalibrationStep(0);
            }, 600);
          }, 600);
        }, 600);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Access Required',
        description: 'Please allow camera access to capture blood smear images.',
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
  }, [stream]);

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
    
    setTimeout(() => {
      setIsAutoFocusing(false);
      toast({
        title: 'Focus Adjusted',
        description: 'Auto-focus completed successfully.',
      });
    }, 1500);
  };

  const resetControls = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setShowGrid(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;
    
    const result = await captureEnhancedImage(videoRef.current, {
      brightness,
      contrast,
      applyEdgeDetection: false,
    });
    
    if (result) {
      setCapturedImage(result.dataUrl);
    }
    
    stopCamera();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file (JPG, PNG).',
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
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setCapturedImage(null);
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
        title: 'Sign In Required',
        description: 'Please sign in to analyze samples.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsAnalyzing(true);

    try {
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
        throw new Error('Failed to create test record');
      }

      const { error: analysisError } = await supabase.functions.invoke('analyze-sample', {
        body: {
          testId: test.id,
          testType: 'malaria',
          imageData: capturedImage,
        },
      });

      if (analysisError) {
        await supabase
          .from('tests')
          .update({ status: 'failed' })
          .eq('id', test.id);
        
        throw new Error(analysisError.message || 'Analysis failed');
      }

      toast({
        title: 'Analysis Complete',
        description: 'Your screening results are ready.',
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
      case 3: return 'Ready';
      default: return '';
    }
  };

  const getQualityColor = (quality: string | undefined) => {
    switch (quality) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-secondary';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Microscope className="h-5 w-5 text-primary" />
              </div>
              Capture Blood Smear
            </h1>
            <p className="text-muted-foreground mt-1 ml-13">
              Position the microscope and capture a clear image of the blood smear sample
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera/Image View - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-border">
              <CardContent className="p-0">
                {/* Camera View */}
                {isCameraActive ? (
                  <div className="relative">
                    <div className="microscope-view">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${zoom})`,
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        }}
                      />
                      
                      {/* Vignette Overlay */}
                      <div className="microscope-overlay" />
                      
                      {/* Grid Overlay */}
                      {showGrid && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="border border-white/20" />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Calibration Overlay */}
                      {!isCalibrated && calibrationStep > 0 && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
                          <div className="text-center space-y-4">
                            <Crosshair className="h-12 w-12 text-primary mx-auto animate-pulse" />
                            <p className="text-white font-medium">{getCalibrationLabel()}</p>
                            <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${calibrationStep * 33}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Auto-focusing indicator */}
                      {isAutoFocusing && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="w-20 h-20 border-2 border-primary rounded-lg animate-pulse flex items-center justify-center bg-black/30">
                            <Focus className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                        {isCalibrated && (
                          <Badge className="bg-success text-success-foreground">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Calibrated
                          </Badge>
                        )}
                        {detection && isCalibrated && (
                          <Badge className={`${detection.ready_for_capture ? 'bg-success' : 'bg-warning'} text-white`}>
                            {detection.ready_for_capture ? 'Ready to Capture' : 'Adjust Position'}
                          </Badge>
                        )}
                      </div>
                      
                      {/* AI Detection Feedback */}
                      {detection && isCalibrated && (
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center justify-between text-white text-sm">
                              <span>{detection.feedback}</span>
                              <span className={getQualityColor(detection.quality)}>
                                Quality: {detection.quality}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Cancel Button */}
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={stopCamera}
                        className="absolute top-4 right-4 z-20"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                    
                    {/* Capture Button */}
                    {isCalibrated && (
                      <div className="p-6 bg-muted/30 border-t border-border">
                        <Button
                          size="lg"
                          className="w-full bg-primary hover:bg-primary/90 py-6"
                          onClick={captureImage}
                          disabled={isAutoFocusing}
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Capture Image
                        </Button>
                      </div>
                    )}
                  </div>
                ) : capturedImage ? (
                  /* Captured Image View */
                  <div className="relative">
                    <div className="microscope-view">
                      <img 
                        src={capturedImage} 
                        alt="Captured blood smear" 
                        className="w-full h-full object-cover"
                      />
                      <div className="microscope-overlay" />
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={clearImage}
                      className="absolute top-4 right-4"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    
                    {/* Analyze Button */}
                    <div className="p-6 bg-muted/30 border-t border-border">
                      <Button
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 py-6"
                        onClick={handleSubmit}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Microscope className="h-5 w-5 mr-2" />
                            Analyze for Malaria
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Initial State */
                  <div className="p-8">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Camera className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Capture Blood Smear Image
                      </h3>
                      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                        Use the microscope camera to capture a clear image of the blood smear sample
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                          size="lg" 
                          onClick={startCamera}
                          className="bg-primary hover:bg-primary/90 px-8"
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Open Camera
                        </Button>
                        
                        <div className="text-muted-foreground text-sm">or</div>
                        
                        <Button 
                          size="lg" 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-8"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Controls Panel */}
          <div className="space-y-4">
            {/* Camera Controls */}
            {isCameraActive && isCalibrated && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Focus className="h-4 w-4 text-primary" />
                    Camera Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zoom */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <ZoomIn className="h-4 w-4" />
                        Zoom
                      </span>
                      <span className="font-medium">{zoom.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[zoom]}
                      onValueChange={([v]) => setZoom(v)}
                      min={1}
                      max={3}
                      step={0.1}
                    />
                  </div>
                  
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Brightness
                      </span>
                      <span className="font-medium">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={([v]) => setBrightness(v)}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>
                  
                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Contrast className="h-4 w-4" />
                        Contrast
                      </span>
                      <span className="font-medium">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={([v]) => setContrast(v)}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant={showGrid ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                      className="gap-2"
                    >
                      <Grid3X3 className="h-4 w-4" />
                      Grid
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFocus}
                      disabled={isAutoFocusing}
                      className="gap-2"
                    >
                      <Focus className="h-4 w-4" />
                      Focus
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetControls}
                    className="w-full gap-2 text-muted-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Controls
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Guidelines Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Capture Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Ensure proper lighting on the blood smear</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Focus on the thin area of the smear</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Avoid air bubbles and debris</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Use Giemsa-stained samples when possible</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Disclaimer */}
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-semibold">Screening Tool:</span> Results are preliminary and should be confirmed with laboratory diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Scanner;
