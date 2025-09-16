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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [frameImageLoadError, setFrameImageLoadError] = useState(false);
  
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

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    if (uploadedImage) {
      ctx.save();
      ctx.translate(imageState.x, imageState.y);
      ctx.rotate((imageState.rotation * Math.PI) / 180);
      ctx.scale(imageState.scale, imageState.scale);
      
      const imgAspect = uploadedImage.width / uploadedImage.height;
      const canvasAspect = canvasDimensions.width / canvasDimensions.height;
      
      let drawWidth, drawHeight;
      if (imgAspect > canvasAspect) {
        drawWidth = canvasDimensions.width * 0.8;
        drawHeight = drawWidth / imgAspect;
      } else {
        drawHeight = canvasDimensions.height * 0.8;
        drawWidth = drawHeight * imgAspect;
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
  };

  const drawCroppedCanvas = () => {
    const croppedCanvas = croppedCanvasRef.current;
    if (!croppedCanvas || !uploadedImage) return;

    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;

    croppedCanvas.width = canvasDimensions.width;
    croppedCanvas.height = canvasDimensions.height;

    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    ctx.save();
    ctx.translate(imageState.x, imageState.y);
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    ctx.scale(imageState.scale, imageState.scale);
    
    const imgAspect = uploadedImage.width / uploadedImage.height;
    const canvasAspect = canvasDimensions.width / canvasDimensions.height;
    
    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
      drawWidth = canvasDimensions.width * 0.8;
      drawHeight = drawWidth / imgAspect;
    } else {
      drawHeight = canvasDimensions.height * 0.8;
      drawWidth = drawHeight * imgAspect;
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

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
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: x - imageState.x, y: y - imageState.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !uploadedImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setImageState(prev => ({
      ...prev,
      x: x - dragStart.x,
      y: y - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
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

  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png', 0.9);
    });
  };

  const handleSave = async () => {
    if (!uploadedImage || !canvasRef.current || !croppedCanvasRef.current) {
      toast.error('Please upload an image first');
      return;
    }

    setIsUploading(true);
    
    try {
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = uploadedImage.width;
      originalCanvas.height = uploadedImage.height;
      const originalCtx = originalCanvas.getContext('2d');
      if (originalCtx) {
        originalCtx.drawImage(uploadedImage, 0, 0);
      }

      const renderedBlob = await canvasToBlob(canvasRef.current);
      const croppedBlob = await canvasToBlob(croppedCanvasRef.current);
      const originalBlob = await canvasToBlob(originalCanvas);

      const [renderedUrl, croppedUrl, originalUrl] = await Promise.all([
        uploadToCloudinary(renderedBlob, `${product.handle}-rendered-${Date.now()}`),
        uploadToCloudinary(croppedBlob, `${product.handle}-cropped-${Date.now()}`),
        uploadToCloudinary(originalBlob, `${product.handle}-original-${Date.now()}`)
      ]);

      saveCustomization(product.id, {
        originalImageUrl: originalUrl,
        renderedImageUrl: renderedUrl,
        croppedImageUrl: croppedUrl,
        frameImageUrl,
        imageState,
        canvasDimensions,
        createdAt: new Date().toISOString()
      });

      toast.success('Customization saved successfully!');
      router.push(`/products/${product.handle}`);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save customization: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      <DialogContent className="sm:max-w-4xl w-[95vw] h-[90vh] overflow-auto lg:overflow-hidden p-0">
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Customize {product.title}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Upload and position your image</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex flex-1 overflow-auto lg:overflow-hidden flex-col lg:flex-row min-h-0">
            {/* Canvas Section */}
            <div className="flex-1 p-4 sm:p-6 bg-gray-50 flex items-center justify-center">
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <canvas
                    ref={canvasRef}
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    className="border border-gray-200 rounded-lg cursor-move mx-auto block max-w-full h-auto"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? 'Loading...' : 'Browse'}
                    </Button>
                  </div>
                </div>
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
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 bg-white">
              <div className="p-6 space-y-6">
                {uploadedImage ? (
                  <>
                    {/* Scale Control */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Scale</Label>
                        <span className="text-sm text-gray-500">{imageState.scale.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[imageState.scale]}
                        onValueChange={handleScaleChange}
                        min={0.1}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Rotation Control */}
                    <div className="space-y-3">
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

                    {/* Position Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">
                        Position: ({Math.round(imageState.x)}, {Math.round(imageState.y)})
                      </p>
                      <p className="text-xs text-gray-500">
                        Drag the image on canvas to reposition
                      </p>
                    </div>

                    {/* Reset Button */}
                    <Button variant="outline" onClick={handleReset} className="w-full" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Position
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Upload Your Image</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Choose an image to customize your product
                    </p>
                    <p className="text-xs text-gray-400">
                      Supported: JPG, PNG, GIF
                    </p>
                  </div>
                )}

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
              <div className="border-t border-gray-100 p-4 sm:p-6">
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleSkip} className="flex-1" size="sm">
                    Skip
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1" size="sm">
                    Cancel
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