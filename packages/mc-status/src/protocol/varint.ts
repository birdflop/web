export function writeVarInt(val: number): Buffer {
  let value = val;
  const bytes: number[] = [];
  while (true) {
    if ((value & ~0x7f) === 0) {
      bytes.push(value);
      break;
    }
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  return Buffer.from(bytes);
}

export function readVarInt(
  buffer: Buffer,
  offset = 0
): { value: number; bytesRead: number } {
  let value = 0;
  let bytesRead = 0;
  let currentByte = 0;

  while (true) {
    if (offset + bytesRead >= buffer.length) {
      throw new Error('Buffer underflow while reading VarInt');
    }
    currentByte = buffer[offset + bytesRead];
    value |= (currentByte & 0x7f) << (bytesRead * 7);
    bytesRead++;
    if (bytesRead > 5) {
      throw new Error('VarInt is too big');
    }
    if ((currentByte & 0x80) === 0) {
      break;
    }
  }

  return { value, bytesRead };
}

export function writeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, 'utf8');
  const lenBuffer = writeVarInt(strBuffer.length);
  return Buffer.concat([lenBuffer, strBuffer]);
}

export function readString(
  buffer: Buffer,
  offset = 0
): { value: string; bytesRead: number } {
  const { value: length, bytesRead: lenBytes } = readVarInt(buffer, offset);
  const start = offset + lenBytes;
  const end = start + length;
  if (end > buffer.length) {
    throw new Error('Buffer underflow while reading String');
  }
  const value = buffer.toString('utf8', start, end);
  return { value, bytesRead: lenBytes + length };
}
