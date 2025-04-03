const hmacsha1 = require("./lib/hmacsha1") as (key: string, data: string) => string;

/**
 * Generates a random string of a specified length.
 * 
 * @param length The length of the string to generate.
 * @returns A random string of the specified length.
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  // Generate cryptographically secure random values using Math.random
  // This is good enough for generating a nonce
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

/**
 * Generates a URL signature.
 * 
 * @param url The URL to sign.
 * @param API_KEY The API key to use for signing.
 * @param API_SECRET The API secret to use for signing.
 * @returns An object containing the signature, timestamp, and signature nonce.
 */
const urlSignature = (url: string, API_KEY: string, API_SECRET: string) => {
  if (!url) return;
  const timestamp = Date.now(); // 当前时间戳
  const signatureNonce = generateRandomString(16); // 随机字符串，你可以任意设置，这个没有要求
  // 原文 = URl地址 + "&" + 毫秒时间戳 + "&" + 随机字符串
  const path = `${url}&${timestamp}&${signatureNonce}`;
  const secretKey = API_SECRET; // 下单后在官网中，找到自己的 SecretKey'
  const hash = hmacsha1(secretKey, path);
  // 最后一步： encodeBase64URLSafeString(密文)
  // 这一步很重要，生成安全字符串。java、Python 以外的语言，可以参考这个 JS 的处理
  const signature = hash
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return {
    signature,
    timestamp,
    signatureNonce,
  };
};

/**
 * Generates a signed URL.
 * 
 * @param url The URL to sign.
 * @param API_KEY The API key to use for signing.
 * @param API_SECRET The API secret to use for signing.
 * @returns The signed URL.
 */
export const getSignedUrl = (url: string, API_KEY: string, API_SECRET: string) => {
  const result = urlSignature(url, API_KEY, API_SECRET);
  if (!result) {
    throw new Error('Invalid URL provided');
  }
  const { signature, timestamp, signatureNonce } = result;
  const accessKey = API_KEY; // '下单后在官网中，找到自己的 AccessKey'
  return `${url}?AccessKey=${accessKey}&Signature=${signature}&Timestamp=${timestamp}&SignatureNonce=${signatureNonce}`;
};