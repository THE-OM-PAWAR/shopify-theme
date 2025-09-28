// Cloudinary upload utility using signed uploads
export const uploadToCloudinary = async (file: Blob, filename: string, retries: number = 3): Promise<string> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Uploading to Cloudinary via API route (attempt ${attempt}/${retries}):`, filename);
      console.log('File size:', file.size, 'bytes');
      
      // Use our API route for signed uploads
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', filename);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      console.log('Upload API response status:', response.status);
      console.log('Upload API response:', responseText);

      if (!response.ok) {
        const errorData = responseText ? JSON.parse(responseText) : { error: 'Unknown error' };
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          attempt
        });
        
        // Don't retry for certain errors
        if (response.status === 413 || response.status === 400) {
          throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
        }
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw new Error(`Upload failed after ${retries} attempts: ${errorData.error || response.statusText}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      const data = JSON.parse(responseText);
      console.log('Upload successful:', data.secure_url);
      
      return data.secure_url;
    } catch (error) {
      console.error(`Upload error (attempt ${attempt}/${retries}):`, error);
      
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw new Error(`Failed to upload image after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Upload failed: Maximum retries exceeded');
};