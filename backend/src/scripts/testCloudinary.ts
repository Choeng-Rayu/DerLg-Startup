import cloudinaryService from '../services/cloudinary.service';

/**
 * Test Cloudinary Integration
 * Tests image upload, optimization, thumbnail generation, and deletion
 */

// Sample base64 image (1x1 red pixel PNG)
const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// Sample base64 image (1x1 blue pixel PNG)
const sampleBase64Image2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==';

async function testCloudinaryIntegration() {
  console.log('\n=== Testing Cloudinary Integration ===\n');

  try {
    // Test 1: Upload single image
    console.log('Test 1: Upload single image to hotels folder');
    const uploadResult = await cloudinaryService.uploadBase64Image(
      sampleBase64Image,
      'hotels',
      { tags: ['test', 'hotel'] }
    );
    console.log('✓ Image uploaded successfully');
    console.log(`  URL: ${uploadResult.url}`);
    console.log(`  Public ID: ${uploadResult.publicId}`);

    // Test 2: Generate optimized image URL
    console.log('\nTest 2: Generate optimized image URL');
    const optimizedUrl = cloudinaryService.getOptimizedImageUrl(uploadResult.publicId, {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto',
    });
    console.log('✓ Optimized URL generated');
    console.log(`  URL: ${optimizedUrl}`);

    // Test 3: Generate thumbnail URL
    console.log('\nTest 3: Generate thumbnail URL');
    const thumbnailUrl = cloudinaryService.getThumbnailUrl(uploadResult.publicId);
    console.log('✓ Thumbnail URL generated');
    console.log(`  URL: ${thumbnailUrl}`);

    // Test 4: Upload multiple images
    console.log('\nTest 4: Upload multiple images to rooms folder');
    const multipleUploadResults = await cloudinaryService.uploadMultipleBase64Images(
      [sampleBase64Image, sampleBase64Image2],
      'rooms'
    );
    console.log('✓ Multiple images uploaded successfully');
    multipleUploadResults.forEach((result, index) => {
      console.log(`  Image ${index + 1}:`);
      console.log(`    URL: ${result.url}`);
      console.log(`    Public ID: ${result.publicId}`);
    });

    // Test 5: Delete single image
    console.log('\nTest 5: Delete single image');
    await cloudinaryService.deleteImage(uploadResult.publicId);
    console.log('✓ Image deleted successfully');

    // Test 6: Delete multiple images
    console.log('\nTest 6: Delete multiple images');
    const publicIdsToDelete = multipleUploadResults.map((result) => result.publicId);
    await cloudinaryService.deleteMultipleImages(publicIdsToDelete);
    console.log('✓ Multiple images deleted successfully');

    // Test 7: Upload to different folders
    console.log('\nTest 7: Upload to different folders (tours, events, profiles)');
    const tourImage = await cloudinaryService.uploadBase64Image(
      sampleBase64Image,
      'tours',
      { tags: ['test', 'tour'] }
    );
    const eventImage = await cloudinaryService.uploadBase64Image(
      sampleBase64Image,
      'events',
      { tags: ['test', 'event'] }
    );
    const profileImage = await cloudinaryService.uploadBase64Image(
      sampleBase64Image,
      'profiles',
      { tags: ['test', 'profile'] }
    );
    console.log('✓ Images uploaded to different folders');
    console.log(`  Tour image: ${tourImage.publicId}`);
    console.log(`  Event image: ${eventImage.publicId}`);
    console.log(`  Profile image: ${profileImage.publicId}`);

    // Cleanup
    console.log('\nCleaning up test images...');
    await cloudinaryService.deleteMultipleImages([
      tourImage.publicId,
      eventImage.publicId,
      profileImage.publicId,
    ]);
    console.log('✓ Cleanup completed');

    console.log('\n=== All Cloudinary Tests Passed ===\n');
    console.log('Summary:');
    console.log('  ✓ Single image upload');
    console.log('  ✓ Optimized URL generation');
    console.log('  ✓ Thumbnail generation');
    console.log('  ✓ Multiple image upload');
    console.log('  ✓ Single image deletion');
    console.log('  ✓ Multiple image deletion');
    console.log('  ✓ Folder organization');

    console.log('\nCloudinary is properly configured and working!');
    console.log('\nNext steps:');
    console.log('  1. Set up your Cloudinary account at https://cloudinary.com');
    console.log('  2. Add credentials to .env file:');
    console.log('     CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('     CLOUDINARY_API_KEY=your_api_key');
    console.log('     CLOUDINARY_API_SECRET=your_api_secret');
    console.log('  3. Use cloudinaryService in your controllers for image uploads');

  } catch (error: any) {
    console.error('\n✗ Cloudinary test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check if Cloudinary credentials are set in .env file');
    console.error('  2. Verify your Cloudinary account is active');
    console.error('  3. Check your internet connection');
    console.error('  4. Ensure API keys have proper permissions');
    process.exit(1);
  }
}

// Run tests
testCloudinaryIntegration();
