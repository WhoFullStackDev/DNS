import type { DnsMessageAnswer } from "./types";

const writeAnswers = (answers: DnsMessageAnswer[]) => {
  return Buffer.concat(
    //@ts-ignore

    answers.map((answer) => {
      // Encode the domain name as an uncompressed label
      const labels = answer.domainName.split(".");

      const domainBuffer = Buffer.concat(
        labels.map((label) => {
          const len = Buffer.alloc(1);
          len.writeUInt8(label.length);
          return Buffer.concat([len, Buffer.from(label)]);
        })
      );
      const terminator = Buffer.from([0x00]); // Null terminator for the domain

      // Create a buffer for the rest of the answer fields
      const answerBuffer = Buffer.alloc(10);
      answerBuffer.writeUInt16BE(1, 0); // TYPE (A record = 1)
      answerBuffer.writeUInt16BE(1, 2); // CLASS (IN = 1)
      answerBuffer.writeUInt32BE(300, 4); // TTL (300 seconds)
      answerBuffer.writeUInt16BE(4, 8); // RDLENGTH (4 bytes for IPv4)

      // Write the IPv4 address (e.g., "192.0.2.1") as 4 bytes
      const ipParts = answer.data.split(".").map((part) => parseInt(part, 10));
      const ipBuffer = Buffer.from(ipParts);

      return Buffer.concat([domainBuffer, terminator, answerBuffer, ipBuffer]);
    })
  );
};

export default writeAnswers;
