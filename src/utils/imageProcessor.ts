export interface ProcessingOptions {
  width: number;
  height: number;
  quality: number;
  lossless: boolean;
}

export const processImage = async (
  file: File,
  options: ProcessingOptions
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        // Clean up URL immediately
        URL.revokeObjectURL(url);
        
        // Create canvas with target dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = options.width;
        canvas.height = options.height;
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, options.width, options.height);
        
        // Calculate scaling to maintain aspect ratio (fit: contain)
        const scale = Math.min(
          options.width / img.naturalWidth,
          options.height / img.naturalHeight
        );
        
        const scaledWidth = img.naturalWidth * scale;
        const scaledHeight = img.naturalHeight * scale;
        
        // Center the image
        const x = (options.width - scaledWidth) / 2;
        const y = (options.height - scaledHeight) / 2;
        
        // Draw the resized image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert to WebP blob
        const qualityValue = options.lossless ? 1.0 : options.quality / 100;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/webp',
          qualityValue
        );
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    // Load the image
    img.src = url;
  });
};