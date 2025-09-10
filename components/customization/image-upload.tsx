'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage?: File | null;
  onRemoveImage?: () => void;
}

export function ImageUpload({ onImageSelect, selectedImage, onRemoveImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleRemoveImage = () => {
    setPreview(null);
    onRemoveImage?.();
  };

  if (preview) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Uploaded preview"
          className="w-full h-64 object-contain border-2 border-dashed border-gray-300 rounded-lg"
        />
        <button
          onClick={handleRemoveImage}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      
      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      
      {isDragActive ? (
        <p className="text-blue-600">Drop your image here...</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">
            Drag & drop your image here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, WebP up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}