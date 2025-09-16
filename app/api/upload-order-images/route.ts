import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ImageUploadData {
  originalImageUrl: string;
  croppedImageUrl: string;
  renderedImageUrl: string;
  productTitle: string;
  variantTitle: string;
  orderNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    const { images }: { images: ImageUploadData[] } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
    }

    const uploadedFiles: Array<{
      productTitle: string;
      variantTitle: string;
      files: Array<{ filename: string; shopifyFileId: string; cloudinaryPublicId: string }>;
    }> = [];

    // Process each customized product
    for (const imageData of images) {
      const productFiles: Array<{ filename: string; shopifyFileId: string; cloudinaryPublicId: string }> = [];

      // Upload each image type to Shopify
      const imageTypes = [
        { url: imageData.originalImageUrl, suffix: 'original' },
        { url: imageData.croppedImageUrl, suffix: 'cropped' },
        { url: imageData.renderedImageUrl, suffix: 'rendered' }
      ];

      for (const imageType of imageTypes) {
        try {
          // Download image from Cloudinary
          const imageResponse = await fetch(imageType.url);
          if (!imageResponse.ok) {
            console.error(`Failed to fetch image: ${imageType.url}`);
            continue;
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');

          // Create filename
          const filename = `${imageData.orderNumber}_${imageData.productTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${imageData.variantTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${imageType.suffix}.png`;

          // Upload to Shopify Files API
          const shopifyResponse = await fetch(
            `https://${shopifyDomain}/admin/api/2024-01/files.json`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
              },
              body: JSON.stringify({
                file: {
                  filename: filename,
                  attachment: base64Image,
                  content_type: 'image/png'
                }
              })
            }
          );

          if (shopifyResponse.ok) {
            const shopifyResult = await shopifyResponse.json();
            const shopifyFileId = shopifyResult.file?.id;

            if (shopifyFileId) {
              // Extract Cloudinary public ID from URL
              const cloudinaryPublicId = extractCloudinaryPublicId(imageType.url);
              
              productFiles.push({
                filename,
                shopifyFileId,
                cloudinaryPublicId
              });

              console.log(`Successfully uploaded ${filename} to Shopify with ID: ${shopifyFileId}`);
            }
          } else {
            console.error(`Failed to upload ${filename} to Shopify:`, await shopifyResponse.text());
          }
        } catch (error) {
          console.error(`Error processing ${imageType.suffix} image:`, error);
        }
      }

      uploadedFiles.push({
        productTitle: imageData.productTitle,
        variantTitle: imageData.variantTitle,
        files: productFiles
      });
    }

    return NextResponse.json({
      success: true,
      uploadedFiles,
      message: `Successfully processed ${uploadedFiles.length} customized products`
    });

  } catch (error) {
    console.error('Error uploading order images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to extract Cloudinary public ID from URL
function extractCloudinaryPublicId(url: string): string {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
      // Get the part after version (v1234567890)
      const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      return pathAfterVersion.replace(/\.[^/.]+$/, '');
    }
    return '';
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return '';
  }
}