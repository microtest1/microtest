import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileUp, Upload, X, Loader2, Microscope, Camera } from "lucide-react";
import type { TestType } from "@/types/database";

const NewTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [testType, setTestType] = useState<TestType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testType) {
      toast({
        title: "Test type required",
        description: "Please select a test type.",
        variant: "destructive",
      });
      return;
    }

    if (!preview) {
      toast({
        title: "Image required",
        description: "Please upload an image for analysis.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit tests.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create test record
      const { data: test, error: testError } = await supabase
        .from("tests")
        .insert({
          user_id: user.id,
          test_type: testType,
          status: "processing",
        })
        .select()
        .single();

      if (testError) {
        console.error("Test creation error:", testError);
        throw new Error("Failed to create test record");
      }

      // Call AI analysis edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke("analyze-sample", {
        body: {
          testId: test.id,
          testType,
          imageData: preview,
        },
      });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        // Update test status to failed
        await supabase
          .from("tests")
          .update({ status: "failed" })
          .eq("id", test.id);

        throw new Error(analysisError.message || "Analysis failed");
      }

      toast({
        title: "Analysis complete!",
        description: "Your test results are ready to view.",
      });

      navigate(`/results/${test.id}`);
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Unable to process your test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Microscope className="h-8 w-8 text-primary" />
              New Test
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit a sample image for AI-powered analysis
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/scanner")}>
            <Camera className="h-4 w-4 mr-2" />
            Use Camera
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
            <CardDescription>
              Select the test type and upload your sample image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Test Type
                </label>
                <Select 
                  value={testType} 
                  onValueChange={(value) => setTestType(value as TestType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="malaria">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        Malaria Test (Blood Smear)
                      </div>
                    </SelectItem>
                    <SelectItem value="pregnancy">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Pregnancy Test (HCG Strip)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Sample Image
                </label>
                
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-80 object-contain bg-muted"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-success/80 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                      Image Ready
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-7 w-7 text-primary" />
                      </div>
                      <div className="text-muted-foreground">
                        <p className="font-medium text-foreground">
                          Drag and drop your image here
                        </p>
                        <p className="text-sm mt-1">
                          or click to select • Supports: JPG, PNG (max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={!testType || !preview || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-5 w-5" />
                    Submit for Analysis
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewTest;
