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

async function image2image() {
  return await client.img2img({
    "templateUuid": "9c7d531dc75f476aa833b3d452b8f7ad",
    "generateParams": {
      "checkPointId": "21df5d84cca74f7a885ba672b5a80d19",
      "prompt": "an asian girl,20 years old,realistic,masterpiece,best quality",
      "sampler": 15,
      "steps": 20,
      "cfgScale": 7,
      "imgCount": 1,

      // 图像相关参数
      "sourceImage": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/e17a36c5-279e-44a1-b7e7-2087524cefa4.png",
      "resizedWidth": 768,
      "resizedHeight": 1024,
      "mode": 0, // 图生图
      "denoisingStrength": 0.75
    }
  });
}

async function generateUltraImage() {
  return await client.text2imgUltra({
    "templateUuid": "5d7e67009b344550bc1aa6ccbfa1d7f4",
    "generateParams": {
      "prompt": "1 girl,lotus leaf,masterpiece,best quality,finely detail,highres,8k,beautiful and aesthetic,no watermark,",
      "aspectRatio": "portrait",
      //或者配置imageSize设置具体宽高
      "imageSize": {
        "width": 768,
        "height": 1024
      },
      "imgCount": 1,
      "steps": 30, // 采样步数，建议30

      //高级设置，可不填写
      "controlnet": {
        "controlType": "depth",
        "controlImage": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/7c1cc38e-522c-43fe-aca9-07d5420d743e.png",
      }
    }
  })
}

async function runComfy() {
  return await client.runComfy({
    "templateUuid": "4df2efa0f18d46dc9758803e478eb51c",
    "generateParams": {
      "12": {
        "class_type": "LoadImage",
        "inputs": {
          "image": "https://liblibai-tmp-image.liblib.cloud/img/baf2e419ce1cb06812314957efd2e067/af0c523d3d2b4092ab45c64c72e4deb76babb12e9b8a178eb524143c3b71bf85.png"
        }
      },
      "112": {
        "class_type": "ImageScale",
        "inputs": {
          "width": 768
        }
      },
      "136": {
        "class_type": "RepeatLatentBatch",
        "inputs": {
          "amount": 4
        }
      },
      "137": {
        "class_type": "LatentUpscaleBy",
        "inputs": {
          "scale_by": 1.5
        }
      },
      "workflowUuid": "2f22ab7ce4c044afb6d5eee2e61547f3"
    }
  })
}

runComfy().then(result => console.log(result)).catch(console.error)
// image2image().then(result => console.log(result)).catch(console.error);

// generateUltraImage().then(result => console.log(result)).catch(console.error);

// Run the image generation
// generateImage().then(result => console.log(result)).catch(console.error);
