const fs = require('fs');
const path = require('path');
const { LiblibAI } = require('../dist/index.js');

// Check for required environment variables
const API_KEY = process.env.LIBLIBAI_API_KEY || 'd7owdUWeAxCrB2cnzj6ThA';
const API_SECRET = process.env.LIBLIBAI_API_SECRET || 'z7GnvLQUF5IdVWdSepHBx4lk_RqXmjPY';

if (!API_KEY || !API_SECRET) {
  console.error('Error: API_KEY and API_SECRET must be set as environment variables');
  console.error('You can set them by running:');
  console.error('export LIBLIBAI_API_KEY=your_api_key');
  console.error('export LIBLIBAI_API_SECRET=your_api_secret');
  process.exit(1);
}

// Create a new LiblibAI client
const client = new LiblibAI({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  baseURL: 'https://openapi-test.liblib.cloud'
});

/**
 * Example 1: Upload a file using a Buffer
 * This demonstrates how to upload a file from the local filesystem using Node.js Buffer
 */
async function uploadFileFromBuffer() {
  console.log('Uploading file from Buffer...');

  try {
    // Path to a local image file
    const imagePath = path.join(__dirname, 'test2.png');

    // Read the file into a Buffer
    const fileBuffer = fs.readFileSync(imagePath);

    // Upload the file with a custom filename
    const uploadedUrl = await client.uploadFile(fileBuffer, 'test2.png');

    console.log('File uploaded successfully!');
    console.log(`Uploaded file URL: ${uploadedUrl}`);

    const result = await client.run('img2img', {
      templateUuid: '63b72710c9574457ba303d9d9b8df8bd',
      generateParams: {
        prompt: 'a beautiful sunset', sourceImage: uploadedUrl,
        resizeMode: 0, // 缩放模式， 0 拉伸，1 裁剪，2 填充 
        resizedWidth: 1024, // 图像缩放后的宽度
        resizedHeight: 1024, // 图像缩放后的高度
      }
    })
    console.log('Image generated successfully!', result.images);

    return uploadedUrl;
  } catch (error) {
    console.error('Error uploading file from Buffer:');
    console.error(error);
    return null;
  }
}

uploadFileFromBuffer().then((url) => {
  console.log('Uploaded file URL:', url);
});