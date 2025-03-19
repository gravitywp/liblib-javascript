/**
 * Computes a HMAC-SHA1 code.
 *
 * @param k Secret key.
 * @param d Data to be hashed.
 * @param _p Optional b64pad parameter.
 * @param _z Optional character size parameter.
 * @return The hashed string.
 */
declare function b64_hmac_sha1(k: string, d: string, _p?: string, _z?: number): string;

export default b64_hmac_sha1;
