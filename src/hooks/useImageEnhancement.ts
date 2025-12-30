import { useCallback, useRef } from 'react';

interface EnhancementOptions {
  brightness: number;
  contrast: number;
  applyEdgeDetection: boolean;
}

export const useImageEnhancement = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const applyEdgeDetection = useCallback((imageData: ImageData): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data.length);

    // Sobel kernels for edge detection
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0;
        let pixelY = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            pixelX += gray * sobelX[kernelIdx];
            pixelY += gray * sobelY[kernelIdx];
          }
        }

        const magnitude = Math.min(255, Math.sqrt(pixelX * pixelX + pixelY * pixelY));
        const outputIdx = (y * width + x) * 4;
        
        // Create green-tinted edge detection for microscopy look
        output[outputIdx] = magnitude * 0.3;
        output[outputIdx + 1] = magnitude;
        output[outputIdx + 2] = magnitude * 0.3;
        output[outputIdx + 3] = 255;
      }
    }

    return new ImageData(output, width, height);
  }, []);

  const enhanceImage = useCallback((
    videoElement: HTMLVideoElement,
    options: EnhancementOptions
  ): string | null => {
    if (!videoElement || videoElement.videoWidth === 0) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Apply brightness and contrast via filter
    ctx.filter = `brightness(${options.brightness}%) contrast(${options.contrast}%)`;
    ctx.drawImage(videoElement, 0, 0);

    if (options.applyEdgeDetection) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const edgeData = applyEdgeDetection(imageData);
      
      // Blend original with edge detection
      const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const blendedData = new Uint8ClampedArray(originalData.data.length);
      
      for (let i = 0; i < originalData.data.length; i += 4) {
        // Mix 70% original + 30% edge detection
        blendedData[i] = originalData.data[i] * 0.7 + edgeData.data[i] * 0.3;
        blendedData[i + 1] = originalData.data[i + 1] * 0.7 + edgeData.data[i + 1] * 0.3;
        blendedData[i + 2] = originalData.data[i + 2] * 0.7 + edgeData.data[i + 2] * 0.3;
        blendedData[i + 3] = 255;
      }
      
      ctx.putImageData(new ImageData(blendedData, canvas.width, canvas.height), 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [applyEdgeDetection]);

  const captureEnhancedImage = useCallback((
    videoElement: HTMLVideoElement,
    options: EnhancementOptions
  ): Promise<{ dataUrl: string; file: File } | null> => {
    return new Promise((resolve) => {
      const dataUrl = enhanceImage(videoElement, options);
      if (!dataUrl) {
        resolve(null);
        return;
      }

      // Convert to blob/file
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve({ dataUrl, file });
        })
        .catch(() => resolve(null));
    });
  }, [enhanceImage]);

  return {
    enhanceImage,
    captureEnhancedImage,
  };
};
