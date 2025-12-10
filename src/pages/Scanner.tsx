import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Image as ImageIcon,
  Microscope,
  AlertCircle
} from 'lucide-react';
import type { TestType } from '@/types/database';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [testType, setTestType] = useState<TestType | ''>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.filter = `brightness(${brightness}%)`;
      ctx.drawImage(videoRef.current, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          setImageFile(file);
        }
      }, 'image/jpeg', 0.9);
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
    if (!testType || !capturedImage || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please select a test type and capture an image.',
        variant: 'destructive',
      });
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

      if (testError) throw testError;

      // Call AI analysis edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-sample', {
        body: {
          testId: test.id,
          testType,
          imageData: capturedImage,
        },
      });

      if (analysisError) {
        // Update test status to failed
        await supabase
          .from('tests')
          .update({ status: 'failed' })
          .eq('id', test.id);
        
        throw analysisError;
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
        description: 'Unable to analyze the sample. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Microscopy Scanner</h1>
          <p className="text-muted-foreground mt-1">
            Capture or upload a sample image for AI-powered analysis
          </p>
        </div>

        {/* Test Type Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-primary" />
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
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Malaria Test (Blood Smear)
                  </div>
                </SelectItem>
                <SelectItem value="pregnancy">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    Pregnancy Test (Urine Sample)
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
              Capture with camera or upload an existing image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera View */}
            {isCameraActive && (
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                  style={{
                    transform: `scale(${zoom})`,
                    filter: `brightness(${brightness}%)`,
                  }}
                />
                
                {/* Camera Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-full px-6 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(Math.max(1, zoom - 0.25))}
                    className="text-foreground"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                  <span className="text-sm font-medium">{zoom.toFixed(1)}x</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    className="text-foreground"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                  <div className="w-px h-6 bg-border" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setBrightness(Math.max(50, brightness - 10))}
                    className="text-foreground"
                  >
                    <Sun className="h-5 w-5 opacity-50" />
                  </Button>
                  <span className="text-sm font-medium">{brightness}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setBrightness(Math.min(150, brightness + 10))}
                    className="text-foreground"
                  >
                    <Sun className="h-5 w-5" />
                  </Button>
                </div>

                {/* Capture/Cancel Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={stopCamera}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>

                <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 shadow-xl"
                    onClick={captureFromCamera}
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}

            {/* Captured Image Preview */}
            {capturedImage && !isCameraActive && (
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={capturedImage} 
                  alt="Captured sample" 
                  className="w-full aspect-video object-contain bg-muted"
                />
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
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-primary/30 bg-primary-50 hover:bg-primary-100 hover:border-primary/50 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Camera className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Use Camera</p>
                    <p className="text-sm text-muted-foreground">Capture live sample</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-secondary/30 bg-secondary-50 hover:bg-secondary-100 hover:border-secondary/50 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
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
                  <li>Ensure good lighting on the sample</li>
                  <li>Keep the camera steady while capturing</li>
                  <li>Focus on the center of the sample</li>
                  <li>Avoid shadows or reflections</li>
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
              Analyzing Sample...
            </>
          ) : (
            <>
              <Microscope className="h-5 w-5 mr-2" />
              Analyze Sample
            </>
          )}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Scanner;