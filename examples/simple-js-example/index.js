const { LiblibAI } = require('liblibai');
// require('dotenv').config();

// Check for required environment variables
const API_KEY = process.env.LIBLIBAI_API_KEY;
const API_SECRET = process.env.LIBLIBAI_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('Error: API_KEY and API_SECRET must be set in .env file');
  console.error('Create a .env file with the following content:');
  console.error('LIBLIBAI_API_KEY=your_api_key');
  console.error('LIBLIBAI_API_SECRET=your_api_secret');
  process.exit(1);
}

// Create a new LiblibAI client
const client = new LiblibAI({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  // Uncomment to use a custom API endpoint
  // baseURL: 'https://openapi-test.liblibai.cloud'
});

async function generateImage() {
  console.log('Generating image...');
  
  try {
    // Generate an image using text2img
    const result = await client.text2img({
      generateParams: {
        prompt: 'A beautiful sunset over mountains, photorealistic, 8k, detailed',
        width: 1024,
        height: 768,
        steps: 30,
        // Add more parameters as needed
        checkPointId: "0ea388c7eb854be3ba3c6f65aac6bfd3", // Example model ID
        negativePrompt: "blurry, bad quality, deformed",
        sampler: 15,
        cfgScale: 7,
        imgCount: 1,
        seed: -1 // Random seed
      }
    });
    
    console.log('Generation successful!');
    console.log(`Status: ${result.generateStatus}`);
    console.log(`UUID: ${result.generateUuid}`);
    
    // Display image URLs
    if (result.images && result.images.length > 0) {
      console.log('Image URLs:');
      result.images.forEach((img, index) => {
        console.log(`Image ${index + 1}: ${img.imageUrl}`);
      });
    } else {
      console.log('No images were generated.');
    }
    
  } catch (error) {
    console.error('Error generating image:');
    console.error(error);
  }
}

// Run the image generation
generateImage().catch(console.error);
