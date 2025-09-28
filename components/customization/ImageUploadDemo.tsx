'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isImageFile } from '@/lib/image-compression';
import { Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadDemoProps {
  onImageSelected?: (file: File) => void;
}

export default function ImageUploadDemo({ onImageSelected }: ImageUploadDemoProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error('Please select a valid image file');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Image uploaded successfully!');
      
      // Call the callback with the original file
      if (onImageSelected) {
        onImageSelected(selectedFile);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Upload Demo</h3>
        <p className="text-sm text-gray-600">
          Upload an image to see it in action. Images are uploaded as-is without compression.
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
            Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-pulse" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </>
        )}
      </Button>

      {/* Success Message */}
      {selectedFile && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h4 className="font-medium text-gray-900">Image Ready for Upload</h4>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">File Name:</span>
              <span className="font-medium">{selectedFile.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">File Size:</span>
              <span className="font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">File Type:</span>
              <span className="font-medium">{selectedFile.type}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
