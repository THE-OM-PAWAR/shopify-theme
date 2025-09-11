// Cloudinary upload utility using signed uploads
export const uploadToCloudinary = async (file: Blob, filename: string): Promise<string> => {
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