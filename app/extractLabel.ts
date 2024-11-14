/**
 * Extracts domain name labels from a DNS message buffer, handling compression pointers
 * @param msg - The DNS message buffer
 * @param offset - Starting offset in the buffer
 * @param label - Accumulator for labels (used in recursive calls)
 * @param visitedOffsets - Set of visited offsets to detect compression loops
 * @returns Object containing the extracted domain name and new offset
 */
function extractLabel(
  msg: Buffer,
  offset: number,
  label: string[] = [],
  visitedOffsets: Set<number> = new Set()
): { domainName: string; newOffset: number } {
  let currentOffset = offset;
  const originalOffset = offset;
  let jumped = false;

  while (true) {
    // Check if we've reached the end of the name
    if (currentOffset >= msg.length || msg[currentOffset] === 0x00) {
      break;
    }

    // Check for compression pointer (first two bits are 11)
    if ((msg[currentOffset] & 0xc0) === 0xc0) {
      if (visitedOffsets.has(currentOffset)) {
        throw new Error("Circular pointer detected while parsing domain name");
      }

      visitedOffsets.add(currentOffset);

      // Extract pointer value (14 bits) and follow it
      const pointer =
        ((msg[currentOffset] & 0x3f) << 8) | msg[currentOffset + 1];

      if (pointer >= msg.length) {
        throw new Error("Invalid compression pointer");
      }

      if (!jumped) {
        // Only move offset forward 2 bytes for the first jump
        currentOffset += 2;
        jumped = true;
      }

      // Follow the pointer
      const result = extractLabel(msg, pointer, label, visitedOffsets);
      return {
        domainName: result.domainName,
        newOffset: jumped ? currentOffset : result.newOffset,
      };
    }

    // Regular label
    const length = msg[currentOffset];

    // Validate length
    if (currentOffset + 1 + length > msg.length) {
      throw new Error("Label length extends beyond message bounds");
    }

    // Extract label
    const labelText = msg.toString(
      "ascii",
      currentOffset + 1,
      currentOffset + 1 + length
    );
    label.push(labelText);
    currentOffset += length + 1;
  }

  // Move past the final 0x00 byte if we haven't jumped
  if (!jumped && currentOffset < msg.length && msg[currentOffset] === 0x00) {
    currentOffset++;
  }

  return {
    domainName: label.join("."),
    newOffset: jumped ? originalOffset + 2 : currentOffset,
  };
}

export default extractLabel;
