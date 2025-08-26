import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Upload } from "lucide-react";

const NewTest = () => {
  const { toast } = useToast();
  const [testType, setTestType] = React.useState<string>("");
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>("");

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testType || !file) {
      toast({
        title: "Missing information",
        description: "Please select a test type and upload an image.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Test submitted",
      description: "Your test is being processed. We'll notify you when results are ready.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">New Test</h1>
            <p className="text-gray-500 mt-1">Submit a new test for analysis</p>
          </div>
        </div>

        <Card className="p-4 md:p-8 border-primary-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Test Type
              </label>
              <Select onValueChange={setTestType}>
                <SelectTrigger className="w-full md:w-[300px] border-primary-100 focus:ring-primary-200">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malaria">Malaria Test</SelectItem>
                  <SelectItem value="pregnancy">Pregnancy Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-6 md:p-8 text-center cursor-pointer hover:border-primary transition-colors bg-primary-50/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileSelect(file);
                };
                input.click();
              }}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-500">
                    Click or drag to replace the image
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-gray-500">
                    <p className="font-medium">
                      Drag and drop your image here, or click to select
                    </p>
                    <p className="text-sm mt-1">
                      Supports: JPG, PNG (max. 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto bg-primary hover:bg-primary-600 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!testType || !file}
            >
              <FileUp className="mr-2 h-5 w-5" />
              Submit Test
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewTest;