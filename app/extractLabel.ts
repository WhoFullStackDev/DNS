function extractLabel(
  msg: Buffer,
  offset: number,
  label: string[] = [],
  visitedOffsets: Set<number> = new Set()
): { domainName: string; newOffset: number } {
  let newOffset = offset;
  let jumped = false;
  while (msg[newOffset] !== 0x00) {
    if ((msg[newOffset] & 0xc0) === 0xc0) {
      if (visitedOffsets.has(newOffset)) {
        throw new Error("Circular pointer detected while parsing domain name");
      }
      visitedOffsets.add(newOffset);

      const pointer = msg.readUInt16BE(newOffset) & 0x3fff;
      newOffset = pointer;
      jumped = true;
    } else {
      const length = msg[newOffset];
      label.push(msg.toString("ascii", newOffset + 1, newOffset + 1 + length));
      newOffset += length + 1;
    }
    if (jumped) break;
  }

  if (!jumped) newOffset += 1;
  const domainName = label.join(".");
  return { domainName, newOffset: jumped ? offset + 2 : newOffset };
}

export default extractLabel;
