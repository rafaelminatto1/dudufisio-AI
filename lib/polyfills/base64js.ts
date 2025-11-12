const code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const lookup: string[] = [];
const revLookup: number[] = [];

for (let i = 0; i < code.length; i++) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

// URL-safe variants
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens(b64: string): [number, number] {
  const len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid base64 string. Length must be a multiple of 4');
  }

  // '=' padding characters
  let validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;

  const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

function outputLength(validLen: number, placeHoldersLen: number): number {
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}

export function byteLength(b64: string): number {
  const [validLen, placeHoldersLen] = getLens(b64);
  return outputLength(validLen, placeHoldersLen);
}

export function toByteArray(b64: string): Uint8Array {
  const [validLen, placeHoldersLen] = getLens(b64);
  const arr = new Uint8Array(outputLength(validLen, placeHoldersLen));

  // If there are placeholders, only get up to the last complete 4 chars
  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  let curByte = 0;

  for (let i = 0; i < len; i += 4) {
    const tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)];

    arr[curByte++] = (tmp >> 16) & 0xff;
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 2) {
    const tmp =
      (revLookup[b64.charCodeAt(len)] << 2) |
      (revLookup[b64.charCodeAt(len + 1)] >> 4);
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 1) {
    const tmp =
      (revLookup[b64.charCodeAt(len)] << 10) |
      (revLookup[b64.charCodeAt(len + 1)] << 4) |
      (revLookup[b64.charCodeAt(len + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  return arr;
}

function encodeChunk(uint8: Uint8Array, start: number, end: number): string {
  const output: string[] = [];
  for (let i = start; i < end; i += 3) {
    const tmp =
      ((uint8[i] << 16) & 0xff0000) +
      ((uint8[i + 1] << 8) & 0xff00) +
      (uint8[i + 2] & 0xff);

    output.push(
      lookup[(tmp >> 18) & 0x3f] +
        lookup[(tmp >> 12) & 0x3f] +
        lookup[(tmp >> 6) & 0x3f] +
        lookup[tmp & 0x3f]
    );
  }

  return output.join('');
}

export function fromByteArray(uint8: Uint8Array): string {
  const len = uint8.length;
  const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  const parts: string[] = [];
  const maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i,
        i + maxChunkLength > len2 ? len2 : i + maxChunkLength
      )
    );
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    const tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + '==');
  } else if (extraBytes === 2) {
    const tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] +
        lookup[(tmp >> 4) & 0x3f] +
        lookup[(tmp << 2) & 0x3f] +
        '='
    );
  }

  return parts.join('');
}

const base64Module = {
  byteLength,
  toByteArray,
  fromByteArray,
};

export default base64Module;
