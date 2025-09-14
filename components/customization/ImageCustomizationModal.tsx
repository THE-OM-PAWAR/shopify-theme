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
import { Upload, RotateCcw, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const croppedCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 400,
    height: 600
  });
  const [imageState, setImageState] = useState<ImageState>({
    x: 200,
    y: 300,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [frameImageLoadError, setFrameImageLoadError] = useState(false);
  
  const { saveCustomization } = useCustomizationStore();

  console.log('ImageCustomizationModal - Opening with frame URL:', frameImageUrl);

  // Load frame image and calculate canvas dimensions
  useEffect(() => {
    setFrameImageLoadError(false);
    
    if (frameImageUrl && frameImageUrl.trim() !== '' && (frameImageUrl.startsWith('http://') || frameImageUrl.startsWith('https://'))) {
      console.log('Loading frame image:', frameImageUrl);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log('Frame image loaded successfully, dimensions:', img.width, 'x', img.height);
        setFrameImage(img);
        setFrameImageLoadError(false);
        
        // Calculate canvas dimensions based on frame image aspect ratio
        const frameAspectRatio = img.width / img.height;
        const maxWidth = 500; // Maximum canvas width
        const maxHeight = 700; // Maximum canvas height
        
        let canvasWidth, canvasHeight;
        
        if (frameAspectRatio > 1) {
          // Landscape frame
          canvasWidth = Math.min(maxWidth, img.width);
          canvasHeight = canvasWidth / frameAspectRatio;
        } else {
          // Portrait frame
          canvasHeight = Math.min(maxHeight, img.height);
          canvasWidth = canvasHeight * frameAspectRatio;
        }
        
        // Ensure minimum dimensions
        canvasWidth = Math.max(300, canvasWidth);
        canvasHeight = Math.max(400, canvasHeight);
        
        console.log('Calculated canvas dimensions:', canvasWidth, 'x', canvasHeight);
        setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
        
        // Update initial image position to center
        setImageState(prev => ({
          ...prev,
          x: canvasWidth / 2,
          y: canvasHeight / 2
        }));
      };
      img.onerror = (error) => {
        console.error('Failed to load frame image:', frameImageUrl, error);
        setFrameImageLoadError(true);
        toast.error('Failed to load custom frame image. Please check the image URL or contact support.');
        
        // Create a placeholder frame with default dimensions
        const placeholderImg = new Image();
        placeholderImg.onload = () => {
          setFrameImage(placeholderImg);
          setCanvasDimensions({ width: 400, height: 600 });
          setImageState(prev => ({ ...prev, x: 200, y: 300 }));
        };
        placeholderImg.src = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="600" fill="rgba(255,255,255,0.9)" stroke="#ff6b6b" stroke-width="2"/>
            <rect x="50" y="100" width="300" height="400" fill="none" stroke="#999" stroke-width="1" stroke-dasharray="5,5"/>
            <text x="200" y="300" text-anchor="middle" fill="#ff6b6b" font-family="Arial" font-size="14">Frame Load Error</text>
            <text x="200" y="320" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">Using fallback frame</text>
            <text x="200" y="340" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">Your Image Here</text>
          </svg>
        `);
      };
      img.src = frameImageUrl;
    } else {
      // Create a default placeholder frame
      console.log('Creating placeholder frame');
      setFrameImageLoadError(false);
      const placeholderImg = new Image();
      placeholderImg.onload = () => {
        setFrameImage(placeholderImg);
        setCanvasDimensions({ width: 400, height: 600 });
        setImageState(prev => ({ ...prev, x: 200, y: 300 }));
      };
      placeholderImg.src = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="600" fill="rgba(255,255,255,0.8)" stroke="#ccc" stroke-width="2"/>
          <rect x="50" y="100" width="300" height="400" fill="transparent" stroke="#999" stroke-width="2"/>
          <text x="200" y="320" text-anchor="middle" fill="#666" font-family="Arial" font-size="16">Your Image Here</text>
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

    // Set canvas dimensions
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    // Draw uploaded image if available (behind frame)
    if (uploadedImage) {
      ctx.save();
      
      // Apply transformations
      ctx.translate(imageState.x, imageState.y);
      ctx.rotate((imageState.rotation * Math.PI) / 180);
      ctx.scale(imageState.scale, imageState.scale);
      
      // Calculate image dimensions to fit canvas while maintaining aspect ratio
      const imgAspect = uploadedImage.width / uploadedImage.height;
      const canvasAspect = canvasDimensions.width / canvasDimensions.height;
      
      let drawWidth, drawHeight;
      if (imgAspect > canvasAspect) {
        drawWidth = canvasDimensions.width * 0.8; // Make it smaller so it fits nicely
        drawHeight = drawWidth / imgAspect;
      } else {
        drawHeight = canvasDimensions.height * 0.8;
        drawWidth = drawHeight * imgAspect;
      }
      
      // Draw image centered
      ctx.drawImage(
        uploadedImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      
      ctx.restore();
    }

    // Draw frame image on top
    if (frameImage) {
      ctx.drawImage(frameImage, 0, 0, canvasDimensions.width, canvasDimensions.height);
    }
  };

  const drawCroppedCanvas = () => {
    const croppedCanvas = croppedCanvasRef.current;
    if (!croppedCanvas || !uploadedImage) return;

    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;

    // Set cropped canvas dimensions to match main canvas
    croppedCanvas.width = canvasDimensions.width;
    croppedCanvas.height = canvasDimensions.height;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    // Draw only the uploaded image without the frame
    ctx.save();
    
    // Apply transformations
    ctx.translate(imageState.x, imageState.y);
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    ctx.scale(imageState.scale, imageState.scale);
    
    // Calculate image dimensions to fit canvas while maintaining aspect ratio
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
    
    // Draw image centered
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

    console.log('File selected:', file.name, file.type, file.size);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        console.log('User image loaded, dimensions:', img.width, 'x', img.height);
        setUploadedImage(img);
        // Reset image position to center
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
        console.error('Failed to load uploaded image');
        setIsLoading(false);
        toast.error('Failed to load image');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      console.error('Failed to read file');
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
    console.log('Started dragging at:', x, y);
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
      console.log('Stopped dragging');
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
      console.log('Starting save process...');
      
      // Create canvas for original image
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = uploadedImage.width;
      originalCanvas.height = uploadedImage.height;
      const originalCtx = originalCanvas.getContext('2d');
      if (originalCtx) {
        originalCtx.drawImage(uploadedImage, 0, 0);
      }

      // Get rendered canvas blob (with frame)
      const renderedBlob = await canvasToBlob(canvasRef.current);
      // Get cropped canvas blob (without frame)
      const croppedBlob = await canvasToBlob(croppedCanvasRef.current);
      // Get original image blob
      const originalBlob = await canvasToBlob(originalCanvas);

      console.log('Blobs created, uploading to Cloudinary...');
      
      // Upload all images to Cloudinary
      const [renderedUrl, croppedUrl, originalUrl] = await Promise.all([
        uploadToCloudinary(renderedBlob, `${product.handle}-rendered-${Date.now()}`),
        uploadToCloudinary(croppedBlob, `${product.handle}-cropped-${Date.now()}`),
        uploadToCloudinary(originalBlob, `${product.handle}-original-${Date.now()}`)
      ]);

      console.log('Images uploaded:', { renderedUrl, croppedUrl, originalUrl });

      // Save customization data
      saveCustomization(product.id, {
        originalImageUrl: originalUrl,
        renderedImageUrl: renderedUrl,
        croppedImageUrl: croppedUrl, // New field for cropped image
        frameImageUrl,
        imageState,
        canvasDimensions, // Save canvas dimensions for reference
        createdAt: new Date().toISOString()
      });

      toast.success('Customization saved successfully!');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save customization: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customize {product.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canvas Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Preview with Frame</h4>
              <canvas
                ref={canvasRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                className="border border-gray-300 rounded bg-white cursor-move mx-auto block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Hidden cropped canvas for processing */}
            <div className="hidden">
              <canvas
                ref={croppedCanvasRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
              />
            </div>

            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Your Image</Label>
              <div className="flex gap-2">
                <Input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? 'Loading...' : 'Browse'}
                </Button>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Adjustment Controls</h3>
              
              {uploadedImage ? (
                <div className="space-y-4">
                  {/* Scale Control */}
                  <div>
                    <Label>Scale: {imageState.scale.toFixed(2)}</Label>
                    <Slider
                      value={[imageState.scale]}
                      onValueChange={handleScaleChange}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  {/* Rotation Control */}
                  <div>
                    <Label>Rotation: {imageState.rotation}°</Label>
                    <Slider
                      value={[imageState.rotation]}
                      onValueChange={handleRotationChange}
                      min={-180}
                      max={180}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Position Info */}
                  <div className="text-sm text-gray-600">
                    <p>Position: ({Math.round(imageState.x)}, {Math.round(imageState.y)})</p>
                    <p className="text-xs mt-1">Drag the image on canvas to reposition</p>
                  </div>

                  {/* Reset Button */}
                  <Button variant="outline" onClick={handleReset} className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Position
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload an image to start customizing</p>
                  <p className="text-sm mt-2">Supported formats: JPG, PNG, GIF</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Upload your image using the browse button</li>
                <li>2. Drag the image on canvas to position it</li>
                <li>3. Use sliders to adjust size and rotation</li>
                <li>4. Your image will show through the frame</li>
                <li>5. Click save when you're happy with the result</li>
              </ul>
            </div>

            {/* Canvas Info */}
            <div className="bg-gray-100 p-3 rounded text-xs">
              <p><strong>Canvas Info:</strong></p>
              <p>Frame URL: {frameImageUrl}</p>
              <p>Frame Loaded: {frameImage ? 'Yes' : 'No'}</p>
              <p>Frame Load Error: {frameImageLoadError ? 'Yes' : 'No'}</p>
              <p>User Image: {uploadedImage ? 'Loaded' : 'None'}</p>
              <p>Canvas Size: {canvasDimensions.width}x{canvasDimensions.height}</p>
              {frameImage && (
                <p>Frame Aspect Ratio: {(frameImage.width / frameImage.height).toFixed(2)}</p>
              )}
            </div>

            {/* Frame Load Error Warning */}
            {frameImageLoadError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <h4 className="font-medium text-red-900 mb-1">Frame Image Error</h4>
                <p className="text-sm text-red-800">
                  The custom frame image failed to load. Using a fallback frame instead.
                  This might be due to CORS restrictions or an invalid image URL.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!uploadedImage || isUploading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUploading ? 'Saving...' : 'Save Customization'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}