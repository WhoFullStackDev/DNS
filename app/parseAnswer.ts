import extractLabel from "./extractLabel";

function parseAnswer(data: Buffer, ancount: number, offset: number) {
  const answers = [];
  for (let i = 0; i < ancount; i++) {
    const [name, newOffset] = extractLabel(data, offset);
    offset = newOffset;

    const type = data.readUInt16BE(offset);
    offset += 2;

    const classCode = data.readUInt16BE(offset);
    offset += 2;

    const ttl = data.readUInt32BE(offset);
    offset += 4;

    const dataLength = data.readUInt16BE(offset);
    offset += 2;

    // Read Resource Data based on type
    let resourceData;
    if (type === 1 && dataLength === 4) {
      // A record (IPv4 address): Data is 4 bytes for IPv4
      resourceData = Array.from(data.subarray(offset, offset + 4)).join(".");
    } else if (type === 6) {
      const [mName, afterMNameOffset] = extractLabel(data, offset);
      const [rName, afterRNameOffset] = extractLabel(data, afterMNameOffset);

      const serial = data.readUInt32BE(afterRNameOffset);
      const refresh = data.readUInt32BE(afterRNameOffset + 4);
      const retry = data.readUInt32BE(afterRNameOffset + 8);
      const expire = data.readUInt32BE(afterRNameOffset + 12);
      const minimum = data.readUInt32BE(afterRNameOffset + 16);

      resourceData = {
        primaryNS: mName,
        adminEmail: rName,
        serial,
        refresh,
        retry,
        expire,
        minimum,
      };

      offset = afterRNameOffset + 20;
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
      offset,
    });
  }

  return { answers, offset };
}

export default parseAnswer;
