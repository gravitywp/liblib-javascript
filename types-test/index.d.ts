export enum GenerateStatus {
  PENDING = 1,
  PROCESSING = 2,
  GENERATED = 3,
  AUDITING = 4,
  SUCCESS = 5,
  FAILED = 6,
  TIMEOUT = 7
}

export interface ShakkerAIConfig {
  /** Your ShakkerAI API key */
  apiKey: string;
  apiSecret: string;
  /** Optional base URL for the API (defaults to https://api.shakkerai.com) */
  baseURL?: string;
}

export interface Request {
  /** Text description of the image to generate */
  input: Record<string, any>;
}

export interface Response {
  data: Prediction;
  code: number;
  msg: string;
}

export interface PredictionImage {
  imageUrl: string;
  seed: number;
  auditStatus: number;
}

export interface PredictionVideo {
  videoUrl: string;
  coverPath: string;
  nodeId: string;
  outputName: string;
  auditStatus: number;
}

export interface Prediction {
  generateUuid: string;
  generateStatus: number;
  percentCompleted: number;
  duration: number;
  generateMsg: string;
  pointsCost: number;
  accountBalance: number;
  images: PredictionImage[];
  videos: PredictionVideo[];
}

export class ShakkerAIError extends Error {
  constructor(message: string, statusCode?: number, response?: any);
  statusCode?: number;
  response?: any;
}

export class ShakkerAI {
  constructor(config: ShakkerAIConfig);
  create(request: Request): Promise<Response>;
  run(request: Request): Promise<Prediction>;
  private templateIdToEndpoint(templateId: string): Promise<string>;
  private isComfyRequest(templateId: string): boolean;
  private waitResult(generateUuid: string): Promise<Prediction>;
  private waitAppResult(generateUuid: string): Promise<Prediction>;
}

export { ShakkerAI as ShakkerAIClient };
export default ShakkerAI;
