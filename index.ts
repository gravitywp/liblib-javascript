import { getSignedUrl } from "./utils";
/** Configuration options for the LiblibAI client */
export enum GenerateStatus {
  PENDING = 1,
  PROCESSING = 2,
  GENERATED = 3,
  AUDITING = 4,
  SUCCESS = 5,
  FAILED = 6,
  TIMEOUT = 7
}

interface LiblibAIConfig {
  /** Your LiblibAI API key */
  apiKey: string;
  apiSecret: string;
  /** Optional base URL for the API (defaults to https://openapi.liblibai.cloud) */
  baseURL?: string;
  interval?: number
}

/** Parameters for image generation */
interface Request {
  /** Text description of the image to generate */
  [key: string]: any;
}

/** Response from image generation */
interface Response {
  data: Prediction;
  code: number
  msg: string
}

interface SubmitResult {
  generateUuid: string
}

interface PredictionImage {
  imageUrl: string
  seed: number
  auditStatus: number
}

interface PredictionVideo {
  videoUrl: string
  coverPath: string
  nodeId: string
  outputName: string
  auditStatus: number
}

interface Prediction {
  generateUuid: string
  generateStatus: number
  percentCompleted: number
  duration: number
  generateMsg: string
  pointsCost: number
  accountBalance: number
  images: PredictionImage[]
  videos: PredictionVideo[]
}

class LiblibAIError extends Error {
  constructor(message: string, public statusCode?: number, public response?: any) {
    super(message);
    this.name = 'LiblibAIError';
  }
}

/**
 * LiblibAI client for making API requests
 * @example
 * ```javascript
 * // JavaScript
 * const client = new LiblibAI({ apiKey: 'your-api-key', apiSecret: 'your-api-secret' });
 * 
 * // Generate an image
 * client.text2img({ prompt: 'a beautiful sunset' })
 *   .then(result => console.log(result.data))
 *   .catch(error => console.error(error));
 * ```
 * 
 * @example
 * ```typescript
 * // TypeScript
 * import { LiblibAI } from 'liblibai';
 * 
 * const client = new LiblibAI({ apiKey: 'your-api-key', apiSecret: 'your-api-secret' });
 * 
 * try {
 *   const result = await client.text2img({
 *     prompt: 'a beautiful sunset',
 *     width: 1024,
 *     height: 1024
 *   });
 *   console.log(result);
 * } catch (error) {
 *   console.error(error);
 * }
 * ```
 */
class LiblibAI {
  private baseURL: string;
  private headers: Record<string, string>;
  private apiKey: string;
  private apiSecret: string;
  private interval: number = 3000

  /**
   * Create a new LiblibAI client
   * @param config - Client configuration
   */
  constructor(config: LiblibAIConfig) {
    if (!config.apiKey || !config.apiSecret) {
      throw new LiblibAIError('API key is required');
    }

    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseURL = config.baseURL || 'https://openapi.liblibai.cloud';
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': '@liblibai/client'
    };
    this.interval = config.interval || this.interval
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const signedPath = getSignedUrl(endpoint, this.apiKey, this.apiSecret);
    const url = `${this.baseURL}${signedPath}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers || {})
      },
    });
    if (!response.ok) {
      throw new LiblibAIError(
        response.statusText || `HTTP error ${response.status}`,
        response.status,
        await response.text()
      );
    }

    const data = await response.json();


    return data;
  }

  /**
   * Generate an image from a text prompt
   * @param request - Generation parameters
   * @returns Promise containing the response data
   * @throws {LiblibAIError} If the API request fails
   */
  async create(request: Request): Promise<Response> {
    return this.request('/api/generate/webui/text2img', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async taskToEndpoint(task: string): Promise<string> {
    if (task === 'img2img') {
      return '/api/generate/webui/img2img'
    }
    if (task === 'text2img') {
      return '/api/generate/webui/text2img'
    }
    if (task === 'text2img_ultra') {
      return '/api/generate/webui/text2img/ultra'
    }
    if (task === 'img2img_ultra') {
      return '/api/generate/webui/img2img/ultra'
    }
    if (task === 'run_comfy') {
      return '/api/generate/comfyui/app'
    }
    console.warn(`Unknown task ${task}`)

    return '/api/generate/webui/text2img'
  }

  async run(task: string, request: Request): Promise<Prediction> {
    const endpoint = await this.taskToEndpoint(task)
    const resp: { data: SubmitResult } = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    const generateUuid = resp.data.generateUuid
    let prediction
    if (task === 'run_comfy') {
      prediction = await this.waitAppResult(generateUuid)
    } else {
      prediction = await this.waitResult(generateUuid)
    }
    return prediction
  }

  async submit(task: string, request: Request): Promise<SubmitResult> {
    const endpoint = await this.taskToEndpoint(task)
    const resp = await this.request<{ data: SubmitResult }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return resp.data
  }

  async text2img(request: Request): Promise<Prediction> {
    return this.run('text2img', request)
  }

  async img2img(request: Request): Promise<Prediction> {
    return this.run('img2img', request)
  }

  async text2imgUltra(request: Request): Promise<Prediction> {
    return this.run('text2img_ultra', request)
  }

  async img2imgUltra(request: Request): Promise<Prediction> {
    return this.run('img2img_ultra', request)
  }

  async runComfy(request: Request): Promise<Prediction> {
    return this.run('run_comfy', request)
  }

  async submitText2Img(request: Request): Promise<SubmitResult> {
    return this.submit('text2img', request)
  }

  async submitImg2Img(request: Request): Promise<SubmitResult> {
    return this.submit('img2img', request)
  }

  async submitText2ImgUltra(request: Request): Promise<SubmitResult> {
    return this.submit('text2img_ultra', request)
  }

  async submitImg2ImgUltra(request: Request): Promise<SubmitResult> {
    return this.submit('img2img_ultra', request)
  }

  async submitRunComfy(request: Request): Promise<SubmitResult> {
    return this.submit('run_comfy', request)
  }

  //1 for pending, 2 for processing, 3 for genearted, 4 for auditing, 5 for success, 6 for failed , 7 for timeout
  async getStatus(generateUuid: string): Promise<Prediction> {
    const resp = await this.request<Response>('/api/generate/webui/status', {
      method: 'POST',
      body: JSON.stringify({ generateUuid })
    })
    return resp.data
  }

  async getComfyStatus(generateUuid: string): Promise<Prediction> {
    const resp = await this.request<Response>('/api/generate/comfyui/status', {
      method: 'POST',
      body: JSON.stringify({ generateUuid })
    })
    return resp.data
  }

  async waitResult(generateUuid: string): Promise<Prediction> {
    let result;

    while (true) {
      result = await this.request<Response>('/api/generate/webui/status', {
        method: 'POST',
        body: JSON.stringify({ generateUuid })
      })

      // console.debug('polling result status', result.data.generateStatus)

      if ([GenerateStatus.SUCCESS, GenerateStatus.FAILED, GenerateStatus.TIMEOUT].includes(result.data.generateStatus)) {
        break
      }


      await new Promise(resolve => setTimeout(resolve, this.interval))
    }
    return result.data
  }

  async waitAppResult(generateUuid: string): Promise<Prediction> {
    let result;
    while (true) {
      result = await this.request<Response>('/api/generate/comfy/status', {
        method: 'POST',
        body: JSON.stringify({ generateUuid })
      })
      // console.debug('polling result status', result.data.generateStatus)
      if ([GenerateStatus.SUCCESS, GenerateStatus.FAILED, GenerateStatus.TIMEOUT].includes(result.data.generateStatus)) {
        return result.data
      }
      await new Promise(resolve => setTimeout(resolve, this.interval))
    }
  }

}

// Export the client class as both default and named export for maximum compatibility
export default LiblibAI;
export { LiblibAI, LiblibAIError };

// Export types
export type { LiblibAIConfig, Request as RunRequest, Response as RunResponse };
