import type { DnsMessageAnswer } from "./types";

const writeAnswers = (answers: DnsMessageAnswer[]) => {
  return Buffer.concat(
    // @ts-expect-error
    answers.map((answer) => {
      // Encode the domain name as an uncompressed label
      const labels = answer.domainName.split(".");
      const domainBuffer = Buffer.concat(
        //@ts-expect-error
        labels.map((label) => {
          const len = Buffer.alloc(1);
          len.writeUInt8(label.length);
          //@ts-expect-error
          return Buffer.concat([len, Buffer.from(label)]);
        })
      );
      const terminator = Buffer.from([0x00]); // Null terminator for the domain name

      // Create the buffer for fixed-size fields (TYPE, CLASS, TTL, and RDLENGTH)
      const answerBuffer = Buffer.alloc(10);
      answerBuffer.writeUInt16BE(answer.type, 0);
      answerBuffer.writeUInt16BE(answer.class, 2);
      answerBuffer.writeUInt32BE(answer.ttl, 4);

      let rdataBuffer: Buffer;

      if (answer.type === 1 && typeof answer.data === "string") {
        // A record (IPv4 address)
        const ipParts = answer.data
          .split(".")
          .map((part) => parseInt(part, 10));
        rdataBuffer = Buffer.from(ipParts);
        answerBuffer.writeUInt16BE(rdataBuffer.length, 8);
      } else if (answer.type === 6 && typeof answer.data === "object") {
        // SOA record
        const primaryNSBuffer = Buffer.concat(
          //@ts-expect-error
          answer.data.primaryNS.split(".").map((label) => {
            const len = Buffer.alloc(1);
            len.writeUInt8(label.length);
            //@ts-expect-error
            return Buffer.concat([len, Buffer.from(label)]);
          })
        );
        const adminEmailBuffer = Buffer.concat(
          //@ts-expect-error
          answer.data.adminEmail.split(".").map((label) => {
            const len = Buffer.alloc(1);
            len.writeUInt8(label.length);
            //@ts-expect-error
            return Buffer.concat([len, Buffer.from(label)]);
          })
        );
        const fixedFieldsBuffer = Buffer.alloc(20); // Fixed-length fields
        fixedFieldsBuffer.writeUInt32BE(answer.data.serial, 0);
        fixedFieldsBuffer.writeUInt32BE(answer.data.refresh, 4);
        fixedFieldsBuffer.writeUInt32BE(answer.data.retry, 8);
        fixedFieldsBuffer.writeUInt32BE(answer.data.expire, 12);
        fixedFieldsBuffer.writeUInt32BE(answer.data.minimum, 16);

        // Concatenate all parts of the SOA RDATA
        rdataBuffer = Buffer.concat([
          //@ts-expect-error
          primaryNSBuffer,
          //@ts-expect-error
          Buffer.from([0x00]),
          //@ts-expect-error// Null terminator for primaryNS
          adminEmailBuffer,
          //@ts-expect-error
          Buffer.from([0x00]), // Null terminator for adminEmail
          //@ts-expect-error
          fixedFieldsBuffer,
        ]);
        answerBuffer.writeUInt16BE(rdataBuffer.length, 8);
      } else {
        throw new Error(`Unsupported record type: ${answer.type}`);
      }

      // Combine all buffers into the final answer buffer

      return Buffer.concat([
        //@ts-expect-error
        domainBuffer,
        //@ts-expect-error
        terminator,
        //@ts-expect-error
        answerBuffer,
        //@ts-expect-error
        rdataBuffer,
      ]);
    })
  );
};

export default writeAnswers;
