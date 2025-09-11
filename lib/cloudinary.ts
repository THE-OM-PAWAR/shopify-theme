// Cloudinary upload utility using signed uploads
export const uploadToCloudinary = async (file: Blob, filename: string): Promise<string> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('Cloudinary config check:', { 
    cloudName: cloudName ? 'Set' : 'Missing', 
    apiKey: apiKey ? 'Set' : 'Missing',
    apiSecret: apiSecret ? 'Set' : 'Missing'
  });

  if (!cloudName || !apiKey || !apiSecret) {
    const missingVars = [];
    if (!cloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missingVars.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET');
    throw new Error(`Cloudinary configuration is missing: ${missingVars.join(', ')}. Please check your environment variables.`);
  }

  try {
    console.log('Uploading to Cloudinary via API route:', filename);
    
    // Use our API route for signed uploads
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();
    console.log('Upload API response status:', response.status);
    console.log('Upload API response:', responseText);

    if (!response.ok) {
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText
      });
      throw new Error(`Upload failed: ${response.status} ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Upload successful:', data.secure_url);
    
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};