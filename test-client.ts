import ShakkerAI from './index';

const client = new ShakkerAI({ apiKey: 'ak123', apiSecret: 'sk789', baseURL: 'https://openapi-test.shakker.ai' });
async function main() {
  const prediction = await client.run({
    input: {
      "generateParams": {
        "vaeId": "",
        "prompt": "Asian portrait,A young woman wearing a green baseball cap,covering one eye with her hand",
        "negativePrompt": "ng_deepnegative_v1_75t,(badhandv4:1.2),EasyNegative,(worst quality:2),nsfw",
        "checkPointId": "56b8605077e84dbeaa4d79173386e677",
        "clipSkip": 2,
        "sampler": 0,
        "steps": 20,
        "cfgScale": 7,
        "width": 768,
        "height": 1024,
        "imgCount": 1,
        "randnSource": 0,
        "seed": -1,
        "restoreFaces": 0,
        "additionalNetwork": null,
        "hiResFixInfo": null,
        "controlNet": null
      },
      "templateUuid": "e10adc3949ba59abbe56e057f20f883e"
    }
  })
  console.log(prediction)
}
main()