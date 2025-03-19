import { LiblibAI,  LiblibAIError, GenerateStatus } from '../index';
import * as utils from '../utils';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the getSignedUrl function
jest.mock('../utils', () => ({
  getSignedUrl: jest.fn(),
}));

describe('LiblibAI Client', () => {
  let client: LiblibAI;
  const mockApiKey = 'test-api-key';
  const mockApiSecret = 'test-api-secret';
  const mockBaseURL = 'https://openapi.liblibai.cloud';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the getSignedUrl function to return a predictable value
    (utils.getSignedUrl as jest.Mock).mockImplementation((url) => `${url}?signed=true`);
    
    // Create a new client instance for each test
    client = new LiblibAI({
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
      baseURL: mockBaseURL,
    });
    
    // Default mock implementation for fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        code: 0,
        msg: 'success',
        data: {
          generateUuid: 'test-uuid',
          generateStatus: GenerateStatus.SUCCESS,
          percentCompleted: 100,
          duration: 5,
          generateMsg: 'Generation completed',
          pointsCost: 10,
          accountBalance: 90,
          images: [
            {
              imageUrl: 'https://example.com/image.jpg',
              seed: 12345,
              auditStatus: 1
            }
          ],
          videos: []
        }
      }),
    });
  });

  describe('Constructor', () => {
    test('should create a client with default baseURL when not provided', () => {
      const defaultClient = new LiblibAI({
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
      });
      
      // @ts-ignore - Accessing private property for testing
      expect(defaultClient.baseURL).toBe('https://openapi.liblibai.cloud');
    });

    test('should throw an error when apiKey is not provided', () => {
      expect(() => {
        new LiblibAI({
          // @ts-ignore - Testing invalid input
          apiKey: undefined,
          apiSecret: mockApiSecret,
        });
      }).toThrow('API key is required');
    });

    test('should throw an error when apiSecret is not provided', () => {
      expect(() => {
        new LiblibAI({
          apiKey: mockApiKey,
          // @ts-ignore - Testing invalid input
          apiSecret: undefined,
        });
      }).toThrow('API key is required');
    });
  });

  describe('request method', () => {
    test('should make a request with the correct URL and headers', async () => {
      // @ts-ignore - Accessing private method for testing

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          code: 0,
          msg: 'success',
          data: {
          }
        }) 
      });

      await client.request('/test-endpoint');
      
      expect(utils.getSignedUrl).toHaveBeenCalledWith('/test-endpoint', mockApiKey, mockApiSecret);
      const signedUrl = utils.getSignedUrl('/test-endpoint', mockApiKey, mockApiSecret);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}${signedUrl}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': '@liblibai/client',
          }),
        })
      );
    });

    test('should throw LiblibAIError when response is not ok', async () => {
      const errorMessage = 'Test error';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          msg: errorMessage,
        }),
      });

      // @ts-ignore - Accessing private method for testing
      await expect(client.request('/test-endpoint')).rejects.toThrow();
    });
  });

  describe('taskToEndpoint method', () => {
    test('should return the correct endpoint for text2img task', async () => {
      const endpoint = await client.taskToEndpoint('text2img');
      expect(endpoint).toBe('/api/generate/webui/text2img');
    });

    test('should return the correct endpoint for img2img task', async () => {
      const endpoint = await client.taskToEndpoint('img2img');
      expect(endpoint).toBe('/api/generate/webui/img2img');
    });

    test('should return the correct endpoint for text2img_ultra task', async () => {
      const endpoint = await client.taskToEndpoint('text2img_ultra');
      expect(endpoint).toBe('/api/generate/webui/text2img/ultra');
    });

    test('should return the correct endpoint for img2img_ultra task', async () => {
      const endpoint = await client.taskToEndpoint('img2img_ultra');
      expect(endpoint).toBe('/api/generate/webui/img2img/ultra');
    });

    test('should return the correct endpoint for run_comfy task', async () => {
      const endpoint = await client.taskToEndpoint('run_comfy');
      expect(endpoint).toBe('/api/generate/comfyui/app');
    });

    test('should return default endpoint for unknown task', async () => {
      const endpoint = await client.taskToEndpoint('unknown_task');
      expect(endpoint).toBe('/api/generate/webui/text2img');
    });
  });

  describe('create method', () => {
    test('should make a POST request to the text2img endpoint', async () => {
      const request = {
        prompt: 'test prompt',
        width: 512,
        height: 512,
      };

      await client.create(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('run method', () => {
    test('should submit a request and wait for the result', async () => {
      const request = {
        prompt: 'test prompt',
      };

      const mockSubmitResult = {
        data: {
          generateUuid: 'test-uuid',
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockSubmitResult),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid: 'test-uuid',
              generateStatus: GenerateStatus.SUCCESS,
            },
          }),
        });

      const result = await client.run('text2img', request);

      expect(result).toEqual(expect.objectContaining({
        generateUuid: 'test-uuid',
        generateStatus: GenerateStatus.SUCCESS,
      }));
    });

    test('should use waitAppResult for run_comfy task', async () => {
      const request = {
        prompt: 'test prompt',
      };

      const mockSubmitResult = {
        data: {
          generateUuid: 'test-uuid',
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockSubmitResult),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid: 'test-uuid',
              generateStatus: GenerateStatus.SUCCESS,
            },
          }),
        });

      const result = await client.run('run_comfy', request);

      expect(result).toEqual(expect.objectContaining({
        generateUuid: 'test-uuid',
        generateStatus: GenerateStatus.SUCCESS,
      }));
    });
  });

  describe('submit method', () => {
    test('should make a POST request to the correct endpoint', async () => {
      const request = {
        prompt: 'test prompt',
      };

      const mockResponse = {
        data: {
          generateUuid: 'test-uuid',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await client.submit('text2img', request);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('convenience methods', () => {
    test('text2img should call run with text2img task', async () => {
      const request = {
        prompt: 'test prompt',
      };

      const spy = jest.spyOn(client, 'run');
      
      await client.text2img(request);
      
      expect(spy).toHaveBeenCalledWith('text2img', request);
    });

    test('img2img should call run with img2img task', async () => {
      const request = {
        prompt: 'test prompt',
        image: 'base64-encoded-image',
      };

      const spy = jest.spyOn(client, 'run');
      
      await client.img2img(request);
      
      expect(spy).toHaveBeenCalledWith('img2img', request);
    });

    test('text2imgUltra should call run with text2img_ultra task', async () => {
      const request = {
        prompt: 'test prompt',
      };

      const spy = jest.spyOn(client, 'run');
      
      await client.text2imgUltra(request);
      
      expect(spy).toHaveBeenCalledWith('text2img_ultra', request);
    });

    test('img2imgUltra should call run with img2img_ultra task', async () => {
      const request = {
        prompt: 'test prompt',
        image: 'base64-encoded-image',
      };

      const spy = jest.spyOn(client, 'run');
      
      await client.img2imgUltra(request);
      
      expect(spy).toHaveBeenCalledWith('img2img_ultra', request);
    });

    test('runComfy should call run with run_comfy task', async () => {
      const request = {
        workflow: 'test workflow',
      };

      const spy = jest.spyOn(client, 'run');
      
      await client.runComfy(request);
      
      expect(spy).toHaveBeenCalledWith('run_comfy', request);
    });

    test('submitText2Img should call submit with text2img task', async () => {
      const request = {
        prompt: 'test prompt',
      };

      const spy = jest.spyOn(client, 'submit');
      
      await client.submitText2Img(request);
      
      expect(spy).toHaveBeenCalledWith('text2img', request);
    });
  });

  describe('getStatus method', () => {
    test('should make a POST request to the status endpoint', async () => {
      const generateUuid = 'test-uuid';

      await client.getStatus(generateUuid);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ generateUuid }),
        })
      );
    });
  });

  describe('getComfyStatus method', () => {
    test('should make a POST request to the comfy status endpoint', async () => {
      const generateUuid = 'test-uuid';

      await client.getComfyStatus(generateUuid);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ generateUuid }),
        })
      );
    });
  });

  describe('waitResult method', () => {
    test('should poll until status is SUCCESS', async () => {
      const generateUuid = 'test-uuid';

      // First call returns PROCESSING status
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid,
              generateStatus: GenerateStatus.PROCESSING,
            },
          }),
        })
        // Second call returns SUCCESS status
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid,
              generateStatus: GenerateStatus.SUCCESS,
            },
          }),
        });

      // Mock setTimeout to avoid waiting in tests
      // jest.useFakeTimers();
      const waitResultPromise = client.waitResult(generateUuid);
      
      const result = await waitResultPromise;
      // Fast-forward timers
      // jest.runAllTimers();
      
      expect(result).toEqual(expect.objectContaining({
        generateUuid,
        generateStatus: GenerateStatus.SUCCESS,
      }));
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      // jest.useRealTimers();
    }, 10000);

    test('should stop polling when status is FAILED', async () => {
      const generateUuid = 'test-uuid';

      // First call returns PROCESSING status
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid,
              generateStatus: GenerateStatus.PROCESSING,
            },
          }),
        })
        // Second call returns FAILED status
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid,
              generateStatus: GenerateStatus.FAILED,
            },
          }),
        });

      // Mock setTimeout to avoid waiting in tests
      // jest.useFakeTimers();
      const waitResultPromise = client.waitResult(generateUuid);
      
      // Fast-forward timers
      // jest.runAllTimers();
      
      const result = await waitResultPromise;
      
      expect(result).toEqual(expect.objectContaining({
        generateUuid,
        generateStatus: GenerateStatus.FAILED,
      }));
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // jest.useRealTimers();
    });
  });

  describe('waitAppResult method', () => {
    test('should poll until status is SUCCESS', async () => {
      const generateUuid = 'test-uuid';

      // First call returns PROCESSING status
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid,
              generateStatus: GenerateStatus.PROCESSING,
            },
          }),
        })
        // Second call returns SUCCESS status
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              generateUuid,
              generateStatus: GenerateStatus.SUCCESS,
            },
          }),
        });

      // Mock setTimeout to avoid waiting in tests
      // jest.useFakeTimers();
      const waitAppResultPromise = client.waitAppResult(generateUuid);
      
      // Fast-forward timers
      // jest.runAllTimers();
      
      const result = await waitAppResultPromise;
      
      expect(result).toEqual(expect.objectContaining({
        generateUuid,
        generateStatus: GenerateStatus.SUCCESS,
      }));
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // jest.useRealTimers();
    });
  });

  describe('LiblibAIError', () => {
    test('should create an error with the correct properties', () => {
      const message = 'Test error';
      const statusCode = 400;
      const response = { error: 'Bad request' };

      const error = new LiblibAIError(message, statusCode, response);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.response).toBe(response);
      expect(error.name).toBe('LiblibAIError');
    });
  });

});
