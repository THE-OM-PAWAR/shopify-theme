import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CleanupRequest {
  publicIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { publicIds }: CleanupRequest = await request.json();

    if (!publicIds || publicIds.length === 0) {
      return NextResponse.json({ error: 'No public IDs provided' }, { status: 400 });
    }

    const results = {
      deleted: [] as string[],
      failed: [] as string[],
      notFound: [] as string[]
    };

    // Delete images from Cloudinary
    for (const publicId of publicIds) {
      if (!publicId || publicId.trim() === '') {
        continue;
      }

      try {
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
          results.deleted.push(publicId);
          console.log(`Successfully deleted from Cloudinary: ${publicId}`);
        } else if (result.result === 'not found') {
          results.notFound.push(publicId);
          console.log(`Image not found in Cloudinary: ${publicId}`);
        } else {
          results.failed.push(publicId);
          console.error(`Failed to delete from Cloudinary: ${publicId}`, result);
        }
      } catch (error) {
        results.failed.push(publicId);
        console.error(`Error deleting ${publicId} from Cloudinary:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Cleanup completed. Deleted: ${results.deleted.length}, Failed: ${results.failed.length}, Not Found: ${results.notFound.length}`
    });

  } catch (error) {
    console.error('Error cleaning up Cloudinary images:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}