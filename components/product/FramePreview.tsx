import React, { useRef, useEffect, useState } from 'react';
import { useCustomizationStore } from '@/lib/customization-store';

interface FramePreviewProps {
  productId: string;
  frameCoverUrl?: string;
  variantImageUrl?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function FramePreview({
  productId,
  frameCoverUrl,
  variantImageUrl,
  width = 400,
  height = 600,
  className = ''
}: FramePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydratedCustomization, setHydratedCustomization] = useState<any>(null);
  const { getCustomization, _hasHydrated } = useCustomizationStore();

  // Update customization data after hydration
  useEffect(() => {
    if (_hasHydrated) {
      setHydratedCustomization(getCustomization(productId));
    }
  }, [_hasHydrated, productId, getCustomization]);

  useEffect(() => {
    drawPreview();
  }, [frameCoverUrl, variantImageUrl, hydratedCustomization, width, height]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  const drawPreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);
    setError(null);

    try {
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Layer 1: Frame Cover (Background) - This should be the main background
      if (frameCoverUrl) {
        try {
          const frameCoverImg = await loadImage(frameCoverUrl);
          // Draw frame cover as full background
          ctx.drawImage(frameCoverImg, 0, 0, width, height);
        } catch (error) {
          console.warn('Failed to load frame cover background:', error);
        }
      }

      // Layer 2: User's Cropped Image (if available)
      if (hydratedCustomization?.croppedImageUrl) {
        try {
          const userImg = await loadImage(hydratedCustomization.croppedImageUrl);
          
          // Apply the same transformations as saved in customization
          ctx.save();
          
          // Scale the transformations to match current canvas size
          const scaleX = width / (hydratedCustomization.canvasDimensions?.width || width);
          const scaleY = height / (hydratedCustomization.canvasDimensions?.height || height);
          
          const scaledX = (hydratedCustomization.imageState?.x || width / 2) * scaleX;
          const scaledY = (hydratedCustomization.imageState?.y || height / 2) * scaleY;
          const scale = hydratedCustomization.imageState?.scale || 1;
          const rotation = hydratedCustomization.imageState?.rotation || 0;
          
          // Apply transformations
          ctx.translate(scaledX, scaledY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(scale, scale);
          
          // Calculate image dimensions to maintain aspect ratio
          const imgAspect = userImg.width / userImg.height;
          const canvasAspect = width / height;
          
          let drawWidth, drawHeight;
          if (imgAspect > canvasAspect) {
            drawWidth = width * 0.8 * scaleX;
            drawHeight = drawWidth / imgAspect;
          } else {
            drawHeight = height * 0.8 * scaleY;
            drawWidth = drawHeight * imgAspect;
          }
          
          // Draw user image
          ctx.drawImage(
            userImg,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
          );
          
          ctx.restore();
        } catch (error) {
          console.warn('Failed to load user customization image:', error);
        }
      }

      // Layer 3: Variant Frame (Transparent frame on top)
      if (variantImageUrl) {
        try {
          const variantImg = await loadImage(variantImageUrl);
          ctx.drawImage(variantImg, 0, 0, width, height);
        } catch (error) {
          console.warn('Failed to load variant frame:', error);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error drawing frame preview:', error);
      setError('Failed to generate preview');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <p className="text-sm">Preview Error</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg shadow-sm border border-gray-200"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {hydratedCustomization && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          Customized
        </div>
      )}
    </div>
  );
}