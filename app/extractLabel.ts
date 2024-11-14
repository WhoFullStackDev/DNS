function extractLabel(buffer: Buffer, offset: number): [string, number] {
  let labels: string[] = [];
  let jumped = false;
  let originalOffset = offset;
  while (buffer[offset] !== 0) {
    if ((buffer[offset] & 0xc0) === 0xc0) {
      // Compression pointer
      if (!jumped) {
        originalOffset = offset + 2;
      }
      offset = ((buffer[offset] & 0x3f) << 8) | buffer[offset + 1];
      jumped = true;
    } else {
      const length = buffer[offset];
      labels.push(buffer.slice(offset + 1, offset + 1 + length).toString());
      offset += length + 1;
    }
  }
  if (!jumped) {
    originalOffset = offset + 1;
  }
  return [labels.join("."), originalOffset];
}

export default extractLabel;
