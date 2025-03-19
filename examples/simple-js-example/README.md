# LiblibAI SDK - Simple JavaScript Example

This example demonstrates how to use the LiblibAI SDK in a JavaScript project to generate images from text prompts.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Create a `.env` file in this directory with your LiblibAI API credentials:

```
LIBLIBAI_API_KEY=your_api_key
LIBLIBAI_API_SECRET=your_api_secret
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Running the Example

```bash
npm start
# or
yarn start
```

This will:
1. Connect to the LiblibAI API using your credentials
2. Generate an image based on the prompt "A beautiful sunset over mountains"
3. Display the image URLs in the console

## Customizing the Example

You can modify the `index.js` file to:

- Change the prompt
- Adjust image dimensions
- Set different generation parameters
- Add more advanced features like image-to-image generation

## Learn More

For more information, check out the [LiblibAI SDK documentation](https://github.com/gravitywp/liblib-javascript).
