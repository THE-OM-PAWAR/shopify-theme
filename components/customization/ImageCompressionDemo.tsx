'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { compressImage, getFileSizeString, isImageFile } from '@/lib/image-compression';
import { Upload, Shrink, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CompressionDemoProps {
  onCompressedImage?: (blob: Blob) => void;
}

export default function ImageCompressionDemo({ onCompressedImage }: CompressionDemoProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<{
    originalSize: string;
    compressedSize: string;
    compressionRatio: number;
    wasCompressed: boolean;
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error('Please select a valid image file');
      return;
    }

    setSelectedFile(file);
    setCompressionResult(null);
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsCompressing(true);
    try {
      const result = await compressImage(selectedFile, {
        maxSizeInMB: 20,
        quality: 0.9,
        maxWidth: 4000,
        maxHeight: 4000
      });

      setCompressionResult({
        originalSize: getFileSizeString(result.originalSize),
        compressedSize: getFileSizeString(result.compressedSize),
        compressionRatio: result.compressionRatio,
        wasCompressed: result.wasCompressed
      });

      if (result.wasCompressed) {
        const compressionPercentage = ((1 - result.compressionRatio) * 100).toFixed(1);
        toast.success(`Image compressed by ${compressionPercentage}%`);
      } else {
        toast.success('Image is already under 10MB');
      }

      // Call the callback with compressed image
      if (onCompressedImage) {
        onCompressedImage(result.compressedBlob);
      }
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to compress image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Compression Demo</h3>
        <p className="text-sm text-gray-600">
          Upload an image to see compression in action. Images over 20MB will be automatically compressed.
        </p>
      </div>

      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="demo-file" className="text-sm font-medium text-gray-700">
          Select Image File
        </Label>
        <Input
          id="demo-file"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="w-full"
        />
        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({getFileSizeString(selectedFile.size)})
          </div>
        )}
      </div>

      {/* Compress Button */}
      <Button
        onClick={handleCompress}
        disabled={!selectedFile || isCompressing}
        className="w-full"
      >
        {isCompressing ? (
          <>
            <Shrink className="h-4 w-4 mr-2 animate-pulse" />
            Compressing...
          </>
        ) : (
          <>
            <Shrink className="h-4 w-4 mr-2" />
            Compress Image
          </>
        )}
      </Button>

      {/* Results */}
      {compressionResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {compressionResult.wasCompressed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-500" />
            )}
            <h4 className="font-medium text-gray-900">
              {compressionResult.wasCompressed ? 'Image Compressed' : 'No Compression Needed'}
            </h4>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Original Size:</span>
              <span className="font-medium">{compressionResult.originalSize}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Compressed Size:</span>
              <span className="font-medium">{compressionResult.compressedSize}</span>
            </div>
            {compressionResult.wasCompressed && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Compression Ratio:</span>
                <span className="font-medium text-green-600">
                  {((1 - compressionResult.compressionRatio) * 100).toFixed(1)}% smaller
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
