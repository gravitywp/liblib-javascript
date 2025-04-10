# LiblibAI JavaScript SDK

[![npm version](https://img.shields.io/npm/v/liblibai.svg)](https://www.npmjs.com/package/liblibai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official JavaScript/TypeScript client for the LiblibAI API. This SDK provides a convenient way to interact with LiblibAI's image generation services.
更多模型参数信息请参考 [LiblibAI API Documentation](https://liblibai.feishu.cn/wiki/UAMVw67NcifQHukf8fpccgS5n6d)。

## Installation

```bash
# Using npm
npm install liblibai

# Using yarn
yarn add liblibai

# Using pnpm
pnpm add liblibai
```

## Quick Start

```javascript
// JavaScript
const { LiblibAI } = require('liblibai');

// Create a client instance
const client = new LiblibAI({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});

// Generate an image
client.text2img({
  prompt: 'a beautiful sunset',
  width: 1024,
  height: 1024,
})
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

```typescript
// TypeScript
import { LiblibAI } from 'liblibai';

// Create a client instance
const client = new LiblibAI({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});

// Generate an image
async function generateImage() {
  try {
    const result = await client.text2img({
      prompt: 'a beautiful sunset',
      width: 1024,
      height: 1024,
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

generateImage();
```

## API Reference

### Configuration

Create a new LiblibAI client with your API credentials:

```typescript
const client = new LiblibAI({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  baseURL: 'https://openapi.liblibai.cloud', // Optional, defaults to https://openapi.liblibai.cloud
});
```

### Image Generation Methods

#### Text to Image

Generate an image from a text prompt:

```typescript
const result = await client.text2img({
    "templateUuid": "e10adc3949ba59abbe56e057f20f883e",
    "generateParams": {
        "checkPointId": "0ea388c7eb854be3ba3c6f65aac6bfd3", // 底模 modelVersionUUID
        "prompt": "Asian portrait,A young woman wearing a green baseball cap,covering one eye with her hand", // 选填
        "negativePrompt": "ng_deepnegative_v1_75t,(badhandv4:1.2),EasyNegative,(worst quality:2),", //选填
        "sampler": 15, // 采样方法
        "steps": 20, // 采样步数
        "cfgScale": 7, // 提示词引导系数
        "width": 768, // 宽
        "height": 1024, // 高
        "imgCount": 1, // 图片数量    
        "randnSource": 0,  // 随机种子生成器 0 cpu，1 Gpu
        "seed": 2228967414, // 随机种子值，-1表示随机    
        "restoreFaces": 0,  // 面部修复，0关闭，1开启
        
        // Lora添加，最多5个
        "additionalNetwork": [
            {
                "modelId": "31360f2f031b4ff6b589412a52713fcf", //LoRA的模型版本versionuuid
                "weight": 0.3 // LoRA权重
            },
            {
                "modelId": "365e700254dd40bbb90d5e78c152ec7f", //LoRA的模型版本uuid
                "weight": 0.6 // LoRA权重
            }
        ],
    
        // 高分辨率修复
        "hiResFixInfo": {
            "hiresSteps": 20, // 高分辨率修复的重绘步数
            "hiresDenoisingStrength": 0.75, // 高分辨率修复的重绘幅度
            "upscaler": 10, // 放大算法模型枚举
            "resizedWidth": 1024,  // 放大后的宽度
            "resizedHeight": 1536  // 放大后的高度
        }
    }
});
```

#### Image to Image

Generate a new image based on an existing image and a text prompt:

```typescript
const result = await client.img2img({
    "templateUuid": "9c7d531dc75f476aa833b3d452b8f7ad", // 预设参数模板ID
    "generateParams": {
        // 基础参数
        "checkPointId": "0ea388c7eb854be3ba3c6f65aac6bfd3", //底模
        "prompt": "1 girl wear sunglasses", //正向提示词
        "negativePrompt": //负向提示词
        "clipSkip": 2, // Clip跳过层
        "sampler": 15, //采样方法
        "steps": 20, // 采样步数
        "cfgScale": 7, // 提示词引导系数    
        "randnSource": 0, // 随机种子来源，0表示CPU，1表示GPU
        "seed": -1, // 随机种子值，-1表示随机
        "imgCount": 1, // 1到4
        "restoreFaces": 0,  // 面部修复，0关闭，1开启
        
        // 图像相关参数
        "sourceImage": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/7c1cc38e-522c-43fe-aca9-07d5420d743e.png",
        "resizeMode": 0, // 缩放模式， 0 拉伸，1 裁剪，2 填充 
        "resizedWidth": 1024, // 图像缩放后的宽度
        "resizedHeight": 1536, // 图像缩放后的高度
        "mode": 4, // 0图生图，4局部重绘
        "denoisingStrength": 0.75, // 重绘幅度
        
        // Lora添加，最多5个
        "additionalNetwork": [
            {
                "modelId": "31360f2f031b4ff6b589412a52713fcf", //LoRA的模型版本uuid
                "weight": 0.3 // LoRA权重
            },
            {
                "modelId": "365e700254dd40bbb90d5e78c152ec7f", //LoRA的模型版本uuid
                "weight": 0.6 // LoRA权重
            }
        ],
        
        // 局部重绘相关参数
        "inpaintParam": { 
            "maskImage": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/323fc358-618b-4c7d-b431-7d890209e5a5.png", // 蒙版地址
            "maskBlur": 4, // 蒙版模糊度
            "maskPadding": 32, //蒙版边缘预留像素，也称蒙版扩展量 
            "maskMode": 0, // 蒙版模式    
            "inpaintArea": 0, //重绘区域, 0重绘全图，1仅重绘蒙版区域
            "inpaintingFill": 1 //蒙版内容的填充模式
        },
    
        // controlNet，最多4组
        "controlNet": [
            {
                "unitOrder": 1, // 执行顺序
                "sourceImage": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/7c1cc38e-522c-43fe-aca9-07d5420d743e.png",
                "width": 1024, // 参考图宽度
                "height": 1536, // 参考图高度
                "preprocessor": 3, // 预处理器枚举值
                "annotationParameters": { // 预处理器参数， 不同预处理器不同，此处仅为示意
                    "depthLeres": { // 3 预处理器 对应的参数
                        "preprocessorResolution": 1024,
                        "removeNear": 0,
                        "removeBackground": 0
                    }
                },
                "model": "6349e9dae8814084bd9c1585d335c24c", // controlnet的模型
                "controlWeight": 1, // 控制权重
                "startingControlStep": 0, //开始控制步数
                "endingControlStep": 1, // 结束控制步数
                "pixelPerfect": 1, // 完美像素
                "controlMode": 0, // 控制模式 ，0 均衡，1 更注重提示词，2 更注重controlnet，
                "resizeMode": 1, // 缩放模式， 0 拉伸，1 裁剪，2 填充
                "maskImage": "" // 蒙版图
            }
        ]
    }
});
```

#### Ultra Models

For higher quality generations using the Ultra models:

```typescript
// Text to Image Ultra
const result = await client.text2imgUltra({
    "templateUuid":"5d7e67009b344550bc1aa6ccbfa1d7f4",
    "generateParams":{
        "prompt":"1 girl,lotus leaf,masterpiece,best quality,finely detail,highres,8k,beautiful and aesthetic,no watermark,",
        "aspectRatio":"portrait",
        //或者配置imageSize设置具体宽高
        "imageSize": {
            "width": 768,
            "height": 1024
        },
        "imgCount":1,
        "steps": 30, // 采样步数，建议30
        
        //高级设置，可不填写
        "controlnet":{
            "controlType":"depth",
            "controlImage": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/7c1cc38e-522c-43fe-aca9-07d5420d743e.png",
        }        
    }
});

// Image to Image Ultra
const result = await client.img2imgUltra({
    "templateUuid":"5d7e67009b344550bc1aa6ccbfa1d7f4",
    "generateParams":{
        "prompt":"1 girl,lotus leaf,masterpiece,best quality,finely detail,highres,8k,beautiful and aesthetic,no watermark,",
        "aspectRatio":"portrait",
        //或者配置imageSize设置具体宽高
        "imageSize": {
            "width": 768,
            "height": 1024
        },
        "imgCount":1,
        "steps": 30, // 采样步数，建议30
        
        //高级设置，可不填写
        "controlnet":{
            "controlType":"depth",
            "controlImage": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/7c1cc38e-522c-43fe-aca9-07d5420d743e.png",
        }        
    }
});
```

#### ComfyUI Workflows

Run custom ComfyUI workflows:

```typescript
const result = await client.runComfy({
    "templateUuid": "4df2efa0f18d46dc9758803e478eb51c",
    "generateParams": {
        "workflowUuid": "fa2e042e32fa4aabbbacc255b4ab2cca",
        "30":
        {
            "class_type": "LoadImage",
            "inputs":
            {
                "image": "https://liblibai-online.liblib.cloud/img/081e9f07d9bd4c2ba090efde163518f9/5fae2d9099c208487bc97867bece2bf3d904068e307c7bd30c646c9f3059af33.png"
            }
        },
        "31":
        {
            "class_type": "ImageScale",
            "inputs":
            {
                "width": 2048,
                "height": 2048
            }
        }
    }
});
```

### File Upload

The SDK provides methods to upload files that can be used in generation tasks.

#### Upload a File

Upload a file to use in image generation tasks:

```typescript
// In Node.js environment using Buffer
const fs = require('fs');
const path = require('path');

// Read a file into a Buffer
const imagePath = path.join(__dirname, 'my_image.jpg');
const fileBuffer = fs.readFileSync(imagePath);

// Upload the file with a custom filename
const uploadedUrl = await client.uploadFile(fileBuffer, 'my_uploaded_image.jpg');
console.log(`Uploaded file URL: ${uploadedUrl}`);

// Use the uploaded file in an img2img task
const result = await client.img2img({
  generateParams: {
    prompt: "Transform this into a beautiful oil painting",
    // Other parameters...
    sourceImage: uploadedUrl, // Use the uploaded image URL here
    ...
  }
});
```

```typescript
// In browser environment using File/Blob
// Assuming you have a file input element in your HTML
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    // Upload the file
    const uploadedUrl = await client.uploadFile(file);
    console.log(`Uploaded file URL: ${uploadedUrl}`);
    
    // You can now use uploadedUrl in other API calls
  } catch (error) {
    console.error('Error uploading file:', error);
  }
});
```

### Low-level API Methods

#### Submit a Request

Submit a generation request without waiting for the result:

```typescript
const submitResult = await client.submitText2Img({
    "templateUuid": "e10adc3949ba59abbe56e057f20f883e", // 参数模板ID
    "generateParams": {
        // 基础参数
        "checkPointId": "0ea388c7eb854be3ba3c6f65aac6bfd3", // 底模 modelVersionUUID
        "vaeId": "",
        "prompt": "Asian portrait,A young woman wearing a green baseball cap,covering one eye with her hand", // 选填
        "negativePrompt": "ng_deepnegative_v1_75t,(badhandv4:1.2),EasyNegative,(worst quality:2),nsfw", //选填
        "clipSkip": 2,  // 1到12，正整数值
        "sampler": 15, // 采样方法
        "steps": 20, // 采样步数
        "cfgScale": 7, // 提示词引导系数
        "width": 768, // 宽
        "height": 1024, // 高
        "imgCount": 1, // 图片数量    
        "randnSource": 0,  // 随机种子生成器 0 cpu，1 Gpu
        "seed": -1, // 随机种子值，-1表示随机    
        "restoreFaces": 0,  // 面部修复，0关闭，1开启
        
        // Lora添加，最多5个
        "additionalNetwork": [],
    
        // 高分辨率修复
        "hiResFixInfo": {},   
       
        // controlNet，最多4组
        "controlNet": []
    }
});

const generateUuid = submitResult.generateUuid;
```

#### Check Generation Status Manually

Check the status of a generation:

```typescript
let status
while (true) {
    status = await client.getStatus(generateUuid);
    if ([GenerateStatus.SUCCESS, GenerateStatus.FAILED, GenerateStatus.TIMEOUT].includes(status.generateStatus)) {
        break;
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
}
console.log(status)
```

#### Wait for Results

Wait for a generation to complete:

```typescript
const result = await client.waitResult(generateUuid);
```

### For Comfy Task
```typescript
const status = await client.getComfyStatus(generateUuid);
const result = await client.waitAppResult(generateUuid)
```

### Error Handling

The SDK throws `LiblibAIError` for API-related errors:

```typescript
try {
  const result = await client.text2img({
    prompt: 'a beautiful sunset',
  });
  console.log(result);
} catch (error) {
  if (error instanceof LiblibAIError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Generation Status Codes

The API uses the following status codes for generation requests:

```typescript
enum GenerateStatus {
  PENDING = 1,
  PROCESSING = 2,
  GENERATED = 3,
  AUDITING = 4,
  SUCCESS = 5,
  FAILED = 6,
  TIMEOUT = 7
}
```

## License

This SDK is distributed under the MIT License. See the LICENSE file for more information.

## Support

For issues, questions, or feedback, please open an issue on our [GitHub repository](https://github.com/gravitywp/liblib-javascript/issues).