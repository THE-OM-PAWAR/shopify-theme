'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ShopifyProduct } from '@/lib/types';
import { useCustomizationStore } from '@/lib/customization-store';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Upload, RotateCcw, Save, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ImageCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ShopifyProduct;
  frameImageUrl: string;
}

interface ImageState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface CanvasDimensions {
  width: number;
  height: number;
}

export default function ImageCustomizationModal({
  isOpen,
  onClose,
  product,
  frameImageUrl
}: ImageCustomizationModalProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const croppedCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 300,
    height: 400
  });
  const [imageState, setImageState] = useState<ImageState>({
    x: 150,
    y: 200,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<null | 'nw' | 'ne' | 'se' | 'sw'>(null);
  const [resizeStart, setResizeStart] = useState<{ mouseX: number; mouseY: number; baseWidth: number; baseHeight: number; startScale: number; dirX: number; dirY: number; initialAlong: number }>({ mouseX: 0, mouseY: 0, baseWidth: 0, baseHeight: 0, startScale: 1, dirX: 0, dirY: 0, initialAlong: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [frameImageLoadError, setFrameImageLoadError] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStart, setRotateStart] = useState<{ startAngle: number; startRotation: number }>({ startAngle: 0, startRotation: 0 });
  
  const { saveCustomization } = useCustomizationStore();

  // Load frame image and calculate canvas dimensions
  useEffect(() => {
    setFrameImageLoadError(false);
    
    if (frameImageUrl && frameImageUrl.trim() !== '' && (frameImageUrl.startsWith('http://') || frameImageUrl.startsWith('https://'))) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setFrameImage(img);
        setFrameImageLoadError(false);
        
        // Smaller canvas dimensions for compact modal
        const frameAspectRatio = img.width / img.height;
        const maxWidth = 300;
        const maxHeight = 400;
        
        let canvasWidth: number, canvasHeight: number;
        
        if (frameAspectRatio > 1) {
          canvasWidth = Math.min(maxWidth, img.width);
          canvasHeight = canvasWidth / frameAspectRatio;
        } else {
          canvasHeight = Math.min(maxHeight, img.height);
          canvasWidth = canvasHeight * frameAspectRatio;
        }
        
        canvasWidth = Math.max(250, canvasWidth);
        canvasHeight = Math.max(300, canvasHeight);
        
        setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
        setImageState(prev => ({
          ...prev,
          x: canvasWidth / 2,
          y: canvasHeight / 2
        }));
      };
      img.onerror = (error) => {
        console.error('Failed to load frame image:', frameImageUrl, error);
        setFrameImageLoadError(true);
        toast.error('Failed to load frame image');
        
        const placeholderImg = new Image();
        placeholderImg.onload = () => {
          setFrameImage(placeholderImg);
          setCanvasDimensions({ width: 300, height: 400 });
          setImageState(prev => ({ ...prev, x: 150, y: 200 }));
        };
        placeholderImg.src = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="400" fill="rgba(248,250,252,0.9)" stroke="#e2e8f0" stroke-width="2"/>
            <rect x="40" y="80" width="220" height="240" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="5,5"/>
            <text x="150" y="200" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14">Your Image Here</text>
          </svg>
        `);
      };
      img.src = frameImageUrl;
    } else {
      setFrameImageLoadError(false);
      const placeholderImg = new Image();
      placeholderImg.onload = () => {
        setFrameImage(placeholderImg);
        setCanvasDimensions({ width: 300, height: 400 });
        setImageState(prev => ({ ...prev, x: 150, y: 200 }));
      };
      placeholderImg.src = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="400" fill="rgba(248,250,252,0.8)" stroke="#e2e8f0" stroke-width="2"/>
          <rect x="40" y="80" width="220" height="240" fill="transparent" stroke="#cbd5e1" stroke-width="2"/>
          <text x="150" y="210" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14">Your Image Here</text>
        </svg>
      `);
    }
  }, [frameImageUrl]);

  // Draw canvas
  useEffect(() => {
    drawCanvas();
    drawCroppedCanvas();
  }, [uploadedImage, frameImage, imageState, canvasDimensions]);

  const getCurrentDrawSize = () => {
    if (!uploadedImage) return { width: 0, height: 0 };
    const imgAspect = uploadedImage.width / uploadedImage.height;
    const canvasAspect = canvasDimensions.width / canvasDimensions.height;
    let baseWidth: number;
    let baseHeight: number;
    
    // Cover behavior: fill the entire canvas while maintaining aspect ratio
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas - scale to height and crop width
      baseHeight = canvasDimensions.height;
      baseWidth = baseHeight * imgAspect;
    } else {
      // Image is taller than canvas - scale to width and crop height
      baseWidth = canvasDimensions.width;
      baseHeight = baseWidth / imgAspect;
    }
    
    return { width: baseWidth * imageState.scale, height: baseHeight * imageState.scale };
  };

  const drawHandles = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number) => {
    const handleSize = 10;
    const halfW = width / 2;
    const halfH = height / 2;
    const angle = (imageState.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const offsets = [
      { name: 'nw', ox: -halfW, oy: -halfH },
      { name: 'ne', ox:  halfW, oy: -halfH },
      { name: 'se', ox:  halfW, oy:  halfH },
      { name: 'sw', ox: -halfW, oy:  halfH },
    ] as const;
    ctx.fillStyle = '#2563eb';
    offsets.forEach(({ ox, oy }) => {
      const rx = centerX + (ox * cos - oy * sin);
      const ry = centerY + (ox * sin + oy * cos);
      ctx.fillRect(rx - handleSize / 2, ry - handleSize / 2, handleSize, handleSize);
    });

    // Rotation handle (non-rotating) at top center above the bounding box
    const handleOffset = 24;
    const topCenterX = centerX + (0 * cos - (-halfH) * sin);
    const topCenterY = centerY + (0 * sin + (-halfH) * cos);
    const rotateY = topCenterY - handleOffset;
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(topCenterX, topCenterY);
    ctx.lineTo(topCenterX, rotateY);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = '#f59e0b';
    ctx.arc(topCenterX, rotateY, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable high-DPI rendering for crisp canvas
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = canvasDimensions.width * devicePixelRatio;
    canvas.height = canvasDimensions.height * devicePixelRatio;
    canvas.style.width = canvasDimensions.width + 'px';
    canvas.style.height = canvasDimensions.height + 'px';
    
    // Scale context for high-DPI
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    if (uploadedImage) {
      ctx.save();
      ctx.translate(imageState.x, imageState.y);
      ctx.rotate((imageState.rotation * Math.PI) / 180);
      ctx.scale(imageState.scale, imageState.scale);
      
      const imgAspect = uploadedImage.width / uploadedImage.height;
      const canvasAspect = canvasDimensions.width / canvasDimensions.height;
      let drawWidth: number;
      let drawHeight: number;
      
      // Cover behavior: fill the entire canvas while maintaining aspect ratio
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas - scale to height and crop width
        drawHeight = canvasDimensions.height;
        drawWidth = drawHeight * imgAspect;
      } else {
        // Image is taller than canvas - scale to width and crop height
        drawWidth = canvasDimensions.width;
        drawHeight = drawWidth / imgAspect;
      }
      
      ctx.drawImage(
        uploadedImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      
      ctx.restore();
    }

    if (frameImage) {
      ctx.drawImage(frameImage, 0, 0, canvasDimensions.width, canvasDimensions.height);
    }

    // Draw handles last so they stay above the frame
    if (uploadedImage) {
      const { width: currentW, height: currentH } = getCurrentDrawSize();
      drawHandles(ctx, imageState.x, imageState.y, currentW, currentH);
    }
  };

  const drawCroppedCanvas = () => {
    const croppedCanvas = croppedCanvasRef.current;
    if (!croppedCanvas || !uploadedImage) return;

    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;

    // Enable high-DPI rendering for crisp cropped canvas
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    croppedCanvas.width = canvasDimensions.width * devicePixelRatio;
    croppedCanvas.height = canvasDimensions.height * devicePixelRatio;
    croppedCanvas.style.width = canvasDimensions.width + 'px';
    croppedCanvas.style.height = canvasDimensions.height + 'px';
    
    // Scale context for high-DPI
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    ctx.save();
    ctx.translate(imageState.x, imageState.y);
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    ctx.scale(imageState.scale, imageState.scale);
    
    const imgAspect = uploadedImage.width / uploadedImage.height;
    const canvasAspect = canvasDimensions.width / canvasDimensions.height;
    
    let drawWidth, drawHeight;
    
    // Cover behavior: fill the entire canvas while maintaining aspect ratio
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas - scale to height and crop width
      drawHeight = canvasDimensions.height;
      drawWidth = drawHeight * imgAspect;
    } else {
      // Image is taller than canvas - scale to width and crop height
      drawWidth = canvasDimensions.width;
      drawHeight = drawWidth / imgAspect;
    }
    
    ctx.drawImage(
      uploadedImage,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
  };

  const compressImage = (file: File, maxSizeMB: number = 20): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(file);
        return;
      }

      img.onload = () => {
        const maxSize = maxSizeMB * 1024 * 1024;
        let { width, height } = img;

        // More aggressive dimension reduction
        const maxDimension = 3000; // Reduced from 6K to 3K for better compression
        if (width > maxDimension || height > maxDimension) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxDimension;
            height = maxDimension / aspectRatio;
          } else {
            height = maxDimension;
            width = maxDimension * aspectRatio;
          }
        }

        // Set canvas dimensions (no device pixel ratio for initial compression)
        canvas.width = width;
        canvas.height = height;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        const compressBlob = (quality: number) => {
          canvas.toBlob((blob) => {
            if (blob) {
              console.log(`Compression attempt: Quality=${quality}, Size=${(blob.size / 1024 / 1024).toFixed(2)}MB, Target=${(maxSize / 1024 / 1024).toFixed(2)}MB`);
              
              if (blob.size <= maxSize || quality <= 0.3) {
                // Create a new File object with the compressed blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                console.log(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                compressBlob(quality - 0.1);
              }
            } else {
              console.log('Could not create blob, using original');
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };

        // Start with moderate quality
        compressBlob(0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setIsLoading(true);

    try {
      let processedFile = file;
      
      // Check for extremely large files (over 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File too large. Please use an image smaller than 100MB.');
        setIsLoading(false);
        return;
      }
      
      // If file is larger than 20MB, compress it (increased from 10MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.loading('Compressing large image...', { id: 'compress-progress' });
        processedFile = await compressImage(file, 20); // Increased from 10MB to 20MB
        toast.dismiss('compress-progress');
        
        // Check if compression was successful (increased limit)
        if (processedFile.size > 25 * 1024 * 1024) {
          toast.error('Could not compress image enough. Please use a smaller image.');
          setIsLoading(false);
          return;
        }
        
        const originalSize = (file.size / 1024 / 1024).toFixed(1);
        const compressedSize = (processedFile.size / 1024 / 1024).toFixed(1);
        const compressionRatio = ((1 - processedFile.size / file.size) * 100).toFixed(0);
        
        // toast.success(`Image compressed: ${originalSize}MB → ${compressedSize}MB (${compressionRatio}% reduction)`);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
          setImageState({
            x: canvasDimensions.width / 2,
            y: canvasDimensions.height / 2,
            scale: 1,
            rotation: 0
          });
          setIsLoading(false);
          toast.success('Image uploaded successfully!');
        };
        img.onerror = () => {
          setIsLoading(false);
          toast.error('Failed to load image');
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        setIsLoading(false);
        toast.error('Failed to read file');
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('File processing error:', error);
      setIsLoading(false);
      toast.error('Failed to process image');
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0] || e.changedTouches[0];
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const getHandleUnderMouse = (mouseX: number, mouseY: number): null | 'nw' | 'ne' | 'se' | 'sw' | 'rotate' => {
    if (!uploadedImage) return null;
    const handleHitSize = 12;
    const { width, height } = getCurrentDrawSize();
    const halfW = width / 2;
    const halfH = height / 2;
    const angle = (imageState.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotated = [
      { name: 'nw' as const, x: imageState.x + (-halfW * cos - -halfH * sin), y: imageState.y + (-halfW * sin + -halfH * cos) },
      { name: 'ne' as const, x: imageState.x + ( halfW * cos - -halfH * sin), y: imageState.y + ( halfW * sin + -halfH * cos) },
      { name: 'se' as const, x: imageState.x + ( halfW * cos -  halfH * sin), y: imageState.y + ( halfW * sin +  halfH * cos) },
      { name: 'sw' as const, x: imageState.x + (-halfW * cos -  halfH * sin), y: imageState.y + (-halfW * sin +  halfH * cos) },
    ];
    for (const h of rotated) {
      if (Math.abs(mouseX - h.x) <= handleHitSize / 2 && Math.abs(mouseY - h.y) <= handleHitSize / 2) {
        return h.name;
      }
    }
    // rotation handle region (top center in rotated space, then offset straight up in screen space)
    const topCenterX = imageState.x + (0 * cos - (-halfH) * sin);
    const topCenterY = imageState.y + (0 * sin + (-halfH) * cos);
    const rotateCenterX = topCenterX;
    const rotateCenterY = topCenterY - 24;
    const distSq = (mouseX - rotateCenterX) * (mouseX - rotateCenterX) + (mouseY - rotateCenterY) * (mouseY - rotateCenterY);
    if (distSq <= 8 * 8) return 'rotate';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;
    const { x, y } = getMousePos(e);

    // Check if mouse is on a handle for resizing
    const handle = getHandleUnderMouse(x, y);
    if (handle) {
      if (handle === 'rotate') {
        const angle = Math.atan2(y - imageState.y, x - imageState.x);
        setIsRotating(true);
        setRotateStart({ startAngle: angle, startRotation: imageState.rotation });
        return;
      } else {
        const { width, height } = getCurrentDrawSize();
        // Direction from center to the handle in rotated space
        const angle = (imageState.rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const halfW = width / 2;
        const halfH = height / 2;
        let ox = 0, oy = 0;
        if (handle === 'nw') { ox = -halfW; oy = -halfH; }
        if (handle === 'ne') { ox =  halfW; oy = -halfH; }
        if (handle === 'se') { ox =  halfW; oy =  halfH; }
        if (handle === 'sw') { ox = -halfW; oy =  halfH; }
        const hx = imageState.x + (ox * cos - oy * sin);
        const hy = imageState.y + (ox * sin + oy * cos);
        const dirX = hx - imageState.x;
        const dirY = hy - imageState.y;
        const len = Math.hypot(dirX, dirY) || 1;
        const ndx = dirX / len;
        const ndy = dirY / len;
        const initialAlong = (x - imageState.x) * ndx + (y - imageState.y) * ndy;
        setIsResizing(handle);
        setResizeStart({ mouseX: x, mouseY: y, baseWidth: width, baseHeight: height, startScale: imageState.scale, dirX: ndx, dirY: ndy, initialAlong });
        return;
      }
    }

    // Otherwise, start dragging the image
    setIsDragging(true);
    setDragStart({ x: x - imageState.x, y: y - imageState.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;
    const { x, y } = getMousePos(e);

    // Cursor feedback when not dragging/resizing
    if (!isDragging && !isResizing && !isRotating) {
      const over = getHandleUnderMouse(x, y);
      const canvas = canvasRef.current;
      if (canvas) {
        if (over === 'nw' || over === 'se') canvas.style.cursor = 'nwse-resize';
        else if (over === 'ne' || over === 'sw') canvas.style.cursor = 'nesw-resize';
        else if (over === 'rotate') canvas.style.cursor = 'grab';
        else canvas.style.cursor = 'move';
      }
    }

    if (isRotating) {
      const currentAngle = Math.atan2(y - imageState.y, x - imageState.x);
      const delta = currentAngle - rotateStart.startAngle;
      const degrees = (delta * 180) / Math.PI;
      setImageState(prev => ({ ...prev, rotation: rotateStart.startRotation + degrees }));
      return;
    }

    if (isResizing) {
      // Project mouse movement on the handle direction for smooth, rotation-aware scaling
      const along = (x - imageState.x) * resizeStart.dirX + (y - imageState.y) * resizeStart.dirY;
      const deltaAlong = along - resizeStart.initialAlong;
      const base = Math.max(resizeStart.baseWidth, resizeStart.baseHeight);
      const newScale = Math.max(0.1, resizeStart.startScale * (1 + deltaAlong / base));
      setImageState(prev => ({ ...prev, scale: newScale }));
      return;
    }

    if (isDragging) {
      setImageState(prev => ({
        ...prev,
        x: x - dragStart.x,
        y: y - dragStart.y
      }));
      return;
    }
  };

  const handleMouseUp = () => {
    if (isDragging) setIsDragging(false);
    if (isResizing) setIsResizing(null);
    if (isRotating) setIsRotating(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = uploadedImage ? 'move' : 'pointer';
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) {
      if (!isLoading) fileInputRef.current?.click();
      return;
    }
    const { x, y } = getTouchPos(e);
    const handle = getHandleUnderMouse(x, y);
    if (handle) {
      if (handle === 'rotate') {
        const angle = Math.atan2(y - imageState.y, x - imageState.x);
        setIsRotating(true);
        setRotateStart({ startAngle: angle, startRotation: imageState.rotation });
      } else {
        const { width, height } = getCurrentDrawSize();
        const angle = (imageState.rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const halfW = width / 2;
        const halfH = height / 2;
        let ox = 0, oy = 0;
        if (handle === 'nw') { ox = -halfW; oy = -halfH; }
        if (handle === 'ne') { ox =  halfW; oy = -halfH; }
        if (handle === 'se') { ox =  halfW; oy =  halfH; }
        if (handle === 'sw') { ox = -halfW; oy =  halfH; }
        const hx = imageState.x + (ox * cos - oy * sin);
        const hy = imageState.y + (ox * sin + oy * cos);
        const dirX = hx - imageState.x;
        const dirY = hy - imageState.y;
        const len = Math.hypot(dirX, dirY) || 1;
        const ndx = dirX / len;
        const ndy = dirY / len;
        const initialAlong = (x - imageState.x) * ndx + (y - imageState.y) * ndy;
        setIsResizing(handle);
        setResizeStart({ mouseX: x, mouseY: y, baseWidth: width, baseHeight: height, startScale: imageState.scale, dirX: ndx, dirY: ndy, initialAlong });
      }
    } else {
      setIsDragging(true);
      setDragStart({ x: x - imageState.x, y: y - imageState.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;
    e.preventDefault();
    const { x, y } = getTouchPos(e);
    if (isRotating) {
      const currentAngle = Math.atan2(y - imageState.y, x - imageState.x);
      const delta = currentAngle - rotateStart.startAngle;
      const degrees = (delta * 180) / Math.PI;
      setImageState(prev => ({ ...prev, rotation: rotateStart.startRotation + degrees }));
      return;
    }
    if (isResizing) {
      const along = (x - imageState.x) * resizeStart.dirX + (y - imageState.y) * resizeStart.dirY;
      const deltaAlong = along - resizeStart.initialAlong;
      const base = Math.max(resizeStart.baseWidth, resizeStart.baseHeight);
      const newScale = Math.max(0.1, resizeStart.startScale * (1 + deltaAlong / base));
      setImageState(prev => ({ ...prev, scale: newScale }));
      return;
    }
    if (isDragging) {
      setImageState(prev => ({ ...prev, x: x - dragStart.x, y: y - dragStart.y }));
      return;
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleScaleChange = (value: number[]) => {
    setImageState(prev => ({ ...prev, scale: value[0] }));
  };

  const handleRotationChange = (value: number[]) => {
    setImageState(prev => ({ ...prev, rotation: value[0] }));
  };

  const handleReset = () => {
    setImageState({
      x: canvasDimensions.width / 2,
      y: canvasDimensions.height / 2,
      scale: 1,
      rotation: 0
    });
    toast.success('Position reset!');
  };

  const resizeImageIfNeeded = (image: HTMLImageElement, maxDimension: number = 4096): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Enable high-DPI rendering for crisp images
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    const { width, height } = image;
    let newWidth = width;
    let newHeight = height;

    // Only resize if image is extremely large (4K+)
    if (width > maxDimension || height > maxDimension) {
      const aspectRatio = width / height;
      if (width > height) {
        newWidth = maxDimension;
        newHeight = maxDimension / aspectRatio;
      } else {
        newHeight = maxDimension;
        newWidth = maxDimension * aspectRatio;
      }
    }

    // Set canvas size with device pixel ratio for crisp rendering
    canvas.width = newWidth * devicePixelRatio;
    canvas.height = newHeight * devicePixelRatio;
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
    
    // Scale context for high-DPI
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    
    console.log(`Image resized from ${width}x${height} to ${newWidth}x${newHeight} (DPR: ${devicePixelRatio})`);
    return canvas;
  };

  const canvasToBlob = (canvas: HTMLCanvasElement, isOriginal: boolean = false): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Use high quality settings to prevent blur
      // For original images, use maximum quality
      // For rendered/cropped images, use high quality but still compress
      const quality = isOriginal ? 0.95 : 0.92;
      const format = 'image/jpeg';
      
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`Canvas blob created: ${blob.size} bytes (${format}, quality: ${quality})`);
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, format, quality);
    });
  };

  const compressBlobForUpload = async (blob: Blob, maxSize: number): Promise<Blob> => {
    if (blob.size <= maxSize) {
      return blob;
    }

    console.log(`Compressing blob from ${(blob.size / 1024 / 1024).toFixed(2)}MB to target ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
    
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(blob);
        return;
      }

      img.onload = () => {
        let { width, height } = img;
        
        // More aggressive compression - reduce dimensions significantly
        const compressionFactor = Math.sqrt(maxSize / blob.size) * 0.8; // Extra 20% reduction
        const newWidth = Math.floor(width * compressionFactor);
        const newHeight = Math.floor(height * compressionFactor);
        
        // Ensure minimum dimensions
        const finalWidth = Math.max(newWidth, 800);
        const finalHeight = Math.max(newHeight, 600);
        
        // Set canvas dimensions (no device pixel ratio for compression)
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        
        // Enable image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw compressed image
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        
        // Try different quality levels until we get under the size limit
        const tryCompression = (quality: number): void => {
          canvas.toBlob((compressedBlob) => {
            if (compressedBlob) {
              console.log(`Compression attempt: Quality=${quality}, Size=${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
              
              if (compressedBlob.size <= maxSize || quality <= 0.3) {
                console.log(`Final compression: ${(blob.size / 1024 / 1024).toFixed(2)}MB → ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedBlob);
              } else {
                // Try with lower quality
                tryCompression(quality - 0.1);
              }
            } else {
              resolve(blob);
            }
          }, 'image/jpeg', quality);
        };
        
        // Start with moderate quality
        tryCompression(0.8);
      };
      
      img.onerror = () => {
        console.error('Failed to load image for compression');
        resolve(blob);
      };
      
      img.src = URL.createObjectURL(blob);
    });
  };

  const handleSave = async () => {
    if (!uploadedImage || !canvasRef.current || !croppedCanvasRef.current) {
      toast.error('Please upload an image first');
      return;
    }

    setIsUploading(true);
    
    try {
      toast.loading('Preparing images for upload...', { id: 'upload-progress' });
      
      // Step 1: Create high-quality canvas blobs
      const renderedBlob = await canvasToBlob(canvasRef.current, false);
      const croppedBlob = await canvasToBlob(croppedCanvasRef.current, false);
      
      // Step 2: Create original image blob with high quality
      const resizedOriginalCanvas = resizeImageIfNeeded(uploadedImage, 4096);
      const originalBlob = await canvasToBlob(resizedOriginalCanvas, true);

      console.log('Initial blob sizes:', {
        rendered: (renderedBlob.size / 1024 / 1024).toFixed(2) + 'MB',
        cropped: (croppedBlob.size / 1024 / 1024).toFixed(2) + 'MB',
        original: (originalBlob.size / 1024 / 1024).toFixed(2) + 'MB'
      });

      toast.loading('Compressing images for optimal upload...', { id: 'upload-progress' });

      // Step 3: Compress images if they're too large
      const compressedRenderedBlob = await compressBlobForUpload(renderedBlob, 3 * 1024 * 1024); // 3MB limit
      const compressedCroppedBlob = await compressBlobForUpload(croppedBlob, 3 * 1024 * 1024); // 3MB limit
      const compressedOriginalBlob = await compressBlobForUpload(originalBlob, 8 * 1024 * 1024); // 8MB limit

      console.log('Compressed blob sizes:', {
        rendered: (compressedRenderedBlob.size / 1024 / 1024).toFixed(2) + 'MB',
        cropped: (compressedCroppedBlob.size / 1024 / 1024).toFixed(2) + 'MB',
        original: (compressedOriginalBlob.size / 1024 / 1024).toFixed(2) + 'MB'
      });

      toast.loading('Uploading images to cloud storage...', { id: 'upload-progress' });

      // Step 4: Upload compressed images to Cloudinary
      const [renderedResult, croppedResult, originalResult] = await Promise.all([
        uploadToCloudinary(new File([compressedRenderedBlob], `${product.handle}-rendered-${Date.now()}.jpg`, { type: 'image/jpeg' })),
        uploadToCloudinary(new File([compressedCroppedBlob], `${product.handle}-cropped-${Date.now()}.jpg`, { type: 'image/jpeg' })),
        uploadToCloudinary(new File([compressedOriginalBlob], `${product.handle}-original-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      ]);

      const renderedUrl = renderedResult.secure_url;
      const croppedUrl = croppedResult.secure_url;
      const originalUrl = originalResult.secure_url;

      toast.loading('Saving customization...', { id: 'upload-progress' });

      // Step 5: Save customization data
      saveCustomization(product.id, {
        originalImageUrl: originalUrl,
        renderedImageUrl: renderedUrl,
        croppedImageUrl: croppedUrl,
        frameImageUrl,
        imageState,
        canvasDimensions,
        createdAt: new Date().toISOString()
      });

      toast.dismiss('upload-progress');
      toast.success('Customization saved successfully!');
      router.push(`/products/${product.handle}`);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.dismiss('upload-progress');
      
      let errorMessage = 'Failed to save customization';
      if (error instanceof Error) {
        if (error.message.includes('File too large')) {
          errorMessage = 'Image file is too large. Please use a smaller image.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Upload timed out. Please check your internet connection and try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = `Failed to save customization: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    router.push(`/products/${product.handle}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-[95vw] h-[90vh] overflow-auto lg:overflow-auto p-0">
        <div className="flex flex-col h-full min-h-0 overflow-scroll">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Customize {product.title}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Upload and position your image</p>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex flex-1 overflow-auto lg:overflow-auto
           flex-col lg:flex-col min-h-0">
            {/* Canvas Section */}
            <div className="flex-1 p-0 sm:p-6 bg-gray-50 flex items-center justify-center">
              <div className="space-y-4 relative">
                {/* Upload Button */}
                {!uploadedImage && (
                  <div className="flex justify-center absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <Upload className="h-4 w-4" />
                      {isLoading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <canvas
                    ref={canvasRef}
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    className="border border-gray-200 rounded-lg mx-auto block max-w-full h-auto touch-none"
                    onClick={() => { if (!uploadedImage && !isLoading) fileInputRef.current?.click(); }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ maxWidth: '100%', height: 'auto', cursor: uploadedImage ? 'move' : 'pointer' }}
                  />
                  {!uploadedImage && (
                    <p className="mt-3 text-xs text-gray-500 text-center">Tap the canvas to upload an image</p>
                  )}
                </div>

                {/* Hidden file input for canvas-triggered upload */}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Hidden cropped canvas */}
              <canvas
                ref={croppedCanvasRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                className="hidden"
              />
            </div>

            {/* Controls Section */}
            <div className="w-full lg:w-full border-t lg:border-t-0 lg:border-l border-gray-100 bg-white">
              <div className="p-6 space-y-6">
                {uploadedImage ? ( <div>
                  <div className="flex flex-col gap-3 items-center">
                    {/* Rotation Control */}
                    <div className="space-y-3 w-full">
                      {/* Rotation Control */}
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Rotation</Label>
                        <span className="text-sm text-gray-500">{imageState.rotation}°</span>
                      </div>
                      <Slider
                        value={[imageState.rotation]}
                        onValueChange={handleRotationChange}
                        min={-180}
                        max={180}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-3 w-full">
                      {/* Scale Control */}
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Scale</Label>
                        <span className="text-sm text-gray-500">{(imageState.scale * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        value={[imageState.scale]}
                        onValueChange={([newScale]) => {
                          setImageState(prev => ({
                            ...prev,
                            scale: Math.max(0.1, Math.min(newScale, 3)),
                          }));
                        }}
                        min={0.1}
                        max={3}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    {/* Reset Button */}
                  </div>
                 </div>
                ) : ("")}

                {/* Frame Load Error Warning */}
                {frameImageLoadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-red-900 mb-1">Frame Error</h4>
                    <p className="text-xs text-red-700">
                      Using fallback frame due to loading error.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className=" m-auto flex justify-center items-center w-full border-t border-gray-100 p-4 sm:p-6">
                <div className="flex gap-3 m-auto">
                  <Button variant="secondary" onClick={handleSkip} className="flex-1" size="sm">
                    Skip
                  </Button>
                
                  <Button variant="outline" onClick={onClose} className="flex-1" size="sm">
                    Cancel
                  </Button>
                  
                  <Button variant="outline" onClick={handleReset} className="w-min " size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" /> Reset
                  </Button> 
                  <Button 
                    onClick={handleSave} 
                    disabled={!uploadedImage || isUploading}
                    className="flex-1"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUploading ? 'Saving...' : 'Save'}
                  </Button>
           
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}