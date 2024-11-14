import extractLabel from "./extractLabel";

function parseAnswer(data: Buffer, ancount: number, offset: number) {
  const answers = [];
  for (let i = 0; i < ancount; i++) {
    const [name, newOffset] = extractLabel(data, offset);
    offset = newOffset;

    // Read Type (2 bytes)
    const type = data.readUInt16BE(offset);
    offset += 2;

    // Read Class (2 bytes)
    const classCode = data.readUInt16BE(offset);
    offset += 2;

    // Read TTL (4 bytes)
    const ttl = data.readUInt32BE(offset);
    offset += 4;

    // Read Data Length (2 bytes)
    const dataLength = data.readUInt16BE(offset);
    offset += 2;

    // Read Resource Data based on type
    let resourceData;
    if (type === 1 && dataLength === 4) {
      // A record (IPv4 address): Data is 4 bytes for IPv4
      resourceData = Array.from(data.subarray(offset, offset + 4)).join(".");
    } else {
      // Other types of records (could be extended to handle other record types)
      resourceData = data.subarray(offset, offset + dataLength).toString("hex");
    }
    offset += dataLength;

    // Log the parsed answer for debugging

    answers.push({
      domainName: name,
      type,
      class: classCode,
      ttl,
      dataLength,
      data: resourceData,
    });
  }

  return answers;
}

export default parseAnswer;
