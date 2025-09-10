'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ImageUpload } from '@/components/customization/image-upload';
import { ImageCropper } from '@/components/customization/image-cropper';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import Image from 'next/image';

export default function CustomizePage() {
  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [cropData, setCropData] = useState<any>(null);
  const [step, setStep] = useState<'frame' | 'image' | 'crop' | 'preview'>('frame');
  const { addItem, addCustomFrame } = useCartStore();

  const frameOptions = [
    {
      id: '1',
      title: 'Classic Wood Frame',
      price: 29.99,
      image: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=500',
      overlay: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
      id: '2',
      title: 'Modern Black Frame',
      price: 34.99,
      image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=500',
      overlay: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
      id: '3',
      title: 'Vintage Gold Frame',
      price: 49.99,
      image: 'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=500',
      overlay: 'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
  ];

  const handleImageSelect = (file: File) => {
    setUploadedImage(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep('crop');
  };

  const handleCropComplete = (croppedAreaPixels: any) => {
    setCropData(croppedAreaPixels);
    setStep('preview');
  };

  const handleAddToCart = () => {
    if (!selectedFrame || !uploadedImage || !cropData) return;

    const customFrame = {
      id: `custom-${Date.now()}`,
      productId: selectedFrame.id,
      variantId: `variant-${selectedFrame.id}`,
      imageUrl,
      cropData,
      frameType: selectedFrame.title,
      createdAt: new Date().toISOString(),
    };

    addCustomFrame(customFrame);

    addItem({
      id: `custom-${Date.now()}`,
      variantId: `variant-${selectedFrame.id}`,
      productId: selectedFrame.id,
      title: selectedFrame.title,
      price: selectedFrame.price,
      quantity: 1,
      image: selectedFrame.image,
      variant: 'Custom',
      customImage: {
        url: imageUrl,
        cropData,
        originalName: uploadedImage.name,
      },
    });

    // Reset and show success
    setStep('frame');
    setSelectedFrame(null);
    setUploadedImage(null);
    setImageUrl('');
    setCropData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Custom Frame</h1>
          <p className="text-gray-600 mt-2">
            Choose a frame style, upload your photo, and create a personalized masterpiece
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[
              { key: 'frame', title: 'Choose Frame', number: 1 },
              { key: 'image', title: 'Upload Image', number: 2 },
              { key: 'crop', title: 'Crop & Adjust', number: 3 },
              { key: 'preview', title: 'Preview & Add', number: 4 },
            ].map((stepItem, index) => (
              <div key={stepItem.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step === stepItem.key
                      ? 'bg-blue-600 text-white'
                      : index < ['frame', 'image', 'crop', 'preview'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepItem.number}
                </div>
                <span className={`ml-2 ${step === stepItem.key ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {stepItem.title}
                </span>
                {index < 3 && <div className="w-12 h-px bg-gray-300 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Steps */}
          <div className="space-y-6">
            {/* Step 1: Frame Selection */}
            {step === 'frame' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Choose Your Frame Style</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {frameOptions.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        setSelectedFrame(frame);
                        setStep('image');
                      }}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        selectedFrame?.id === frame.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-square relative mb-2 overflow-hidden rounded">
                        <Image
                          src={frame.image}
                          alt={frame.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900">{frame.title}</h3>
                      <p className="text-lg font-semibold text-blue-600">${frame.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Image Upload */}
            {step === 'image' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Upload Your Image</h2>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  selectedImage={uploadedImage}
                  onRemoveImage={() => {
                    setUploadedImage(null);
                    setImageUrl('');
                  }}
                />
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => setStep('frame')}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Image Cropping */}
            {step === 'crop' && imageUrl && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Crop & Adjust Your Image</h2>
                <ImageCropper
                  imageSrc={imageUrl}
                  onCropComplete={handleCropComplete}
                  aspectRatio={4/3}
                />
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => setStep('image')}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Preview & Add to Cart */}
            {step === 'preview' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Preview Your Custom Frame</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{selectedFrame?.title}</h3>
                    <p className="text-2xl font-bold text-blue-600">${selectedFrame?.price}</p>
                    <p className="text-sm text-gray-600 mt-1">Includes your custom image</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleAddToCart} className="flex-1">
                      Add to Cart - ${selectedFrame?.price}
                    </Button>
                    <Button variant="outline" onClick={() => setStep('crop')}>
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            
            {selectedFrame && (
              <div className="space-y-4">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  {imageUrl && step === 'preview' ? (
                    <div className="relative w-full h-full">
                      {/* Cropped image preview */}
                      <Image
                        src={imageUrl}
                        alt="Your custom image"
                        fill
                        className="object-cover"
                        style={{
                          clipPath: cropData ? `inset(${cropData.y}px ${cropData.width - cropData.x - cropData.width}px ${cropData.height - cropData.y - cropData.height}px ${cropData.x}px)` : 'none'
                        }}
                      />
                      {/* Frame overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <Image
                          src={selectedFrame.overlay}
                          alt="Frame overlay"
                          fill
                          className="object-cover mix-blend-multiply opacity-30"
                        />
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Uploaded image"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={selectedFrame.image}
                      alt={selectedFrame.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="font-medium text-gray-900">{selectedFrame.title}</h3>
                  <p className="text-gray-600">
                    {!imageUrl ? 'Upload an image to see your custom frame' :
                     step === 'preview' ? 'Your custom frame is ready!' :
                     'Adjust your image using the cropper'}
                  </p>
                </div>
              </div>
            )}
            
            {!selectedFrame && (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Select a frame to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}