import React, { useRef, useEffect, useState } from 'react';
import { useCustomizationStore } from '@/lib/customization-store';

interface FramePreviewProps {
  productId: string;
  frameCoverUrl?: string;
  variantImageUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  frameSizeMeta?: unknown;
  variantIndex?: number;
}

export default function FramePreview({
  productId,
  frameCoverUrl,
  variantImageUrl,
  width = 500,
  height = 800,
  className = '',
  frameSizeMeta,
  variantIndex = 0
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
          // Draw frame cover as object-fit: cover (no squishing)
          const imgAspect = frameCoverImg.width / frameCoverImg.height;
          const canvasAspect = width / height;
          let drawW: number, drawH: number, dx: number, dy: number;
          if (imgAspect > canvasAspect) {
            // Image is wider than canvas: match height, crop width
            drawH = height;
            drawW = Math.round(drawH * imgAspect);
            dx = Math.floor((width - drawW) / 2);
            dy = 0;
          } else {
            // Image is taller than canvas: match width, crop height
            drawW = width;
            drawH = Math.round(drawW / imgAspect);
            dx = 0;
            dy = Math.floor((height - drawH) / 2);
          }
          ctx.drawImage(frameCoverImg, dx, dy, drawW, drawH);
        } catch (error) {
          console.warn('Failed to load frame cover background:', error);
        }
      }

      // Resolve fraction from metafield (supports arrays, comma-separated, JSON, single number)
      const resolveSizeFraction = (): number => {
        const clamp = (n: number) => Math.max(0.1, Math.min(0.95, n));
        const coerce = (v: unknown): number | undefined => {
          if (typeof v === 'number' && Number.isFinite(v)) return v;
          if (typeof v === 'string') {
            const n = Number(v.trim());
            if (!Number.isNaN(n)) return n;
          }
          return undefined;
        };
        let value: number | undefined;
        try {
          if (frameSizeMeta !== undefined && frameSizeMeta !== null) {
            let meta: any = frameSizeMeta as any;
            if (typeof meta === 'object' && meta && 'value' in meta) {
              meta = (meta as any).value;
            }
            if (Array.isArray(meta)) {
              const idx = Math.max(0, Math.min(variantIndex, meta.length - 1));
              value = coerce(meta[idx]);
            } else if (typeof meta === 'string') {
              const trimmed = meta.trim();
              if (trimmed.startsWith('[')) {
                const arr = JSON.parse(trimmed);
                if (Array.isArray(arr)) {
                  const idx = Math.max(0, Math.min(variantIndex, arr.length - 1));
                  value = coerce(arr[idx]);
                }
              } else if (trimmed.includes(',')) {
                const parts = trimmed.split(',');
                const idx = Math.max(0, Math.min(variantIndex, parts.length - 1));
                value = coerce(parts[idx]);
              } else {
                value = coerce(trimmed);
              }
            } else if (typeof meta === 'number') {
              value = meta;
            }
          }
          console.log("value:", value);
        } catch (e) {
          console.warn('Failed to parse frameSizeMeta:', e);
        }
        if (value === undefined || Number.isNaN(value)) return 0.5; 
        const fraction = value > 1 ? value / 100 : value;
        return clamp(fraction);
      };
      const fraction = resolveSizeFraction();
      console.log("fraction", fraction, "frameSizeMeta:", frameSizeMeta, "variantIndex:", variantIndex);
      const boxW = Math.floor(width * fraction);
      const boxH = Math.floor(height * fraction); 
      const boxX = Math.floor((width - boxW) / 4);
      const boxY = Math.floor((height - boxH) / 3);

      // Layer 2: User's Cropped Image (object-fit cover inside box, overflow hidden)
      if (hydratedCustomization?.croppedImageUrl) {
        try {
          const userImg = await loadImage(hydratedCustomization.croppedImageUrl);

          // Clip to the variant box
          ctx.save();
          ctx.beginPath();
          ctx.rect(boxX, boxY, boxW, boxH);
          ctx.clip();

          // Object-fit: cover for user image within the box
          const imgAspect = userImg.width / userImg.height;
          const boxAspect = boxW / boxH;
          let drawW: number, drawH: number;
          if (imgAspect > boxAspect) {
            drawH = boxH;
            drawW = Math.round(drawH * imgAspect);
          } else {
            drawW = boxW;
            drawH = Math.round(drawW / imgAspect);
          }
          const dx = boxX + Math.floor((boxW - drawW) / 2);
          const dy = boxY + Math.floor((boxH - drawH) / 2);
          ctx.drawImage(userImg, dx, dy, drawW, drawH);
          ctx.restore();
        } catch (error) {
          console.warn('Failed to load user customization image:', error);
        }
      }

      // Layer 3: Variant Frame (Transparent frame on top) drawn within the same box, cropped to remove transparent padding
      if (variantImageUrl) {
        try {
          const variantImg = await loadImage(variantImageUrl);

          // Compute opaque bounds (crop out transparent padding so all variants look same size)
          const off = document.createElement('canvas');
          off.width = variantImg.naturalWidth || variantImg.width;
          off.height = variantImg.naturalHeight || variantImg.height;
          const octx = off.getContext('2d');
          let sx = 0, sy = 0, sw = off.width, sh = off.height;
          if (octx && off.width > 0 && off.height > 0) {
            octx.drawImage(variantImg, 0, 0);
            const data = octx.getImageData(0, 0, off.width, off.height).data;
            let minX = off.width, minY = off.height, maxX = 0, maxY = 0;
            const threshold = 10; // alpha threshold to consider as visible
            const step = Math.max(1, Math.floor(Math.min(off.width, off.height) / 500));
            for (let y = 0; y < off.height; y += step) {
              for (let x = 0; x < off.width; x += step) {
                const idx = (y * off.width + x) * 4 + 3;
                const a = data[idx];
                if (a > threshold) {
                  if (x < minX) minX = x;
                  if (y < minY) minY = y;
                  if (x > maxX) maxX = x;
                  if (y > maxY) maxY = y;
                }
              }
            }
            if (maxX > minX && maxY > minY) {
              // Expand by a pixel to avoid clipping anti-aliased edges
              sx = Math.max(0, minX - 1);
              sy = Math.max(0, minY - 1);
              sw = Math.min(off.width - sx, (maxX - minX) + 2);
              sh = Math.min(off.height - sy, (maxY - minY) + 2);
            }
          }

          ctx.drawImage(variantImg, sx, sy, sw, sh, boxX, boxY, boxW, boxH);
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