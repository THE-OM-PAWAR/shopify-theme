'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

interface CloudinaryImage {
  url: string;
  publicId: string;
}

interface FileUploadSectionProps {
  maxFiles: number;
  productId: string;
  onImagesChange: (images: CloudinaryImage[]) => void;
}

export default function FileUploadSection({ maxFiles, productId, onImagesChange }: FileUploadSectionProps) {
  const [uploadedImages, setUploadedImages] = useState<CloudinaryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load images from localStorage on component mount
  useEffect(() => {
    const storageKey = `uploaded_images_${productId}`;
    const savedImages = localStorage.getItem(storageKey);
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages);
        setUploadedImages(parsedImages);
        onImagesChange(parsedImages);
      } catch (error) {
        console.error('Error parsing saved images:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [productId, onImagesChange]);

  // Save images to localStorage whenever uploadedImages changes
  useEffect(() => {
    const storageKey = `uploaded_images_${productId}`;
    if (uploadedImages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(uploadedImages));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [uploadedImages, productId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const totalFiles = uploadedImages.length + acceptedFiles.length;
    
    if (totalFiles > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files`, {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(file => uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);
      
      const newImages = [
        ...uploadedImages,
        ...results.map(result => ({
          url: result.secure_url,
          publicId: result.public_id
        }))
      ];
      
      setUploadedImages(newImages);
      onImagesChange(newImages);
      
      toast.success('Images uploaded successfully!', {
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, maxFiles, onImagesChange]);

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    try {
      // First remove from UI
      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      onImagesChange(newImages);

      // Then try to delete from Cloudinary
      try {
        await deleteFromCloudinary(imageToRemove.publicId);
        toast.success('Image removed successfully', {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      } catch (deleteError) {
        console.error('Error deleting from Cloudinary:', deleteError);
        // Don't show error to user since image is already removed from UI
        // The image will remain in Cloudinary but won't be accessible from the UI
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image. Please try again.', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: maxFiles - uploadedImages.length,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <p className="text-gray-600">
            {isUploading
              ? 'Uploading...'
              : isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          <p className="text-sm text-gray-500">
            {uploadedImages.length} of {maxFiles} files uploaded
          </p>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Images:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={image.publicId}
                className="relative group"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={image.url}
                    alt={`Collage image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                  disabled={isUploading}
                >
                  ✕
                </button>
                <p className="mt-1 text-xs text-gray-500 truncate text-center">
                  Image {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
