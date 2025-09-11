// Cloudinary upload utility
export const uploadToCloudinary = async (file: Blob, filename: string): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  console.log('Cloudinary config check:', { 
    cloudName: cloudName ? 'Set' : 'Missing', 
    uploadPreset: uploadPreset ? 'Set' : 'Missing' 
  });

  if (!cloudName || !uploadPreset) {
    const missingVars = [];
    if (!cloudName) missingVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    if (!uploadPreset) missingVars.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    throw new Error(`Cloudinary configuration is missing: ${missingVars.join(', ')}. Please check your environment variables.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('public_id', filename);
  formData.append('folder', 'product-customizations');

  try {
    console.log('Uploading to Cloudinary:', filename);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const responseText = await response.text();
    console.log('Cloudinary response status:', response.status);
    console.log('Cloudinary response:', responseText);

    if (!response.ok) {
      console.error('Cloudinary upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        cloudName,
        uploadPreset
      });
      throw new Error(`Upload failed: ${response.status} ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Cloudinary upload successful:', data.secure_url);
    
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};