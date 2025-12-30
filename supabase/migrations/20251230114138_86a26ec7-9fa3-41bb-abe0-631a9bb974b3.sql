-- Create annotations table to store user annotations on test images
CREATE TABLE public.annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('test', 'reference')),
  reference_dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
  annotation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  annotated_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- Users can view their own annotations
CREATE POLICY "Users can view own annotations" 
ON public.annotations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own annotations
CREATE POLICY "Users can create own annotations" 
ON public.annotations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own annotations
CREATE POLICY "Users can update own annotations" 
ON public.annotations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own annotations
CREATE POLICY "Users can delete own annotations" 
ON public.annotations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Healthworkers and admins can view all annotations
CREATE POLICY "Healthworkers can view all annotations" 
ON public.annotations 
FOR SELECT 
USING (has_role(auth.uid(), 'healthworker') OR has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_annotations_updated_at
BEFORE UPDATE ON public.annotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_annotations_test_id ON public.annotations(test_id);
CREATE INDEX idx_annotations_user_id ON public.annotations(user_id);