function parseQuestion(questionsBuff: Buffer) {
  let offset = 12;
  const qdcount = questionsBuff.readUInt16BE(4); // Read qdcount from the DNS header (bytes 4-5)
  const questions: Array<{
    domainName: string;
    type: number;
    class: number;
  }> = [];

  for (let i = 0; i < qdcount; i++) {
    const label: string[] = [];
    const { domainName, newOffset } = extractLabel(
      questionsBuff,
      offset,
      label
    );
    offset = newOffset;

    const type = questionsBuff.readUInt16BE(offset);
    const classCode = questionsBuff.readUInt16BE(offset + 2);
    offset += 4;

    questions.push({ domainName, type, class: classCode });
  }
  return questions;
}

function extractLabel(
  msg: Buffer,
  offset: number,
  label: string[] = []
): { domainName: string; newOffset: number } {
  let newOffset = offset;
  while (msg[newOffset] !== 0x00) {
    const length = msg[newOffset];
    label.push(msg.toString("ascii", newOffset + 1, newOffset + 1 + length));
    newOffset += length + 1;
  }
  const domainName = label.join(".");
  newOffset += 1; // Skip the null byte
  return { domainName, newOffset };
}

export default parseQuestion;
