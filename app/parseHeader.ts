import type { DnsMessageHeaders } from "./types";

function parseHeader(msg: Buffer): DnsMessageHeaders {
  const packetId = msg.readUint16BE(0);
  const flag = msg.readUInt16BE(2);
  const QDCOUNT = msg.readUint16BE(4);
  const ANCOUNT = msg.readUint16BE(6);
  const NSCOUNT = msg.readUint16BE(8);
  const ARCOUNT = msg.readUint16BE(10);
  const flagObj = extractFlags(flag);
  return { packetId, ...flagObj, QDCOUNT, ANCOUNT, NSCOUNT, ARCOUNT };
}

function extractFlags(flags: number): DnsMessageHeaders {
  const QR = (flags & 0b1000000000000000) >> 15; // Query (0) or Response (1)
  const OPCODE = (flags & 0b0111100000000000) >> 11; // Type of query
  const AA = (flags & 0b0000010000000000) >> 10; // Authoritative Answer
  const TC = (flags & 0b0000001000000000) >> 9; // Truncation
  const RD = (flags & 0b0000000100000000) >> 8; // Recursion Desired
  const RA = (flags & 0b0000000010000000) >> 7; // Recursion Available
  const Z = (flags & 0b0000000001110000) >> 4; // Reserved, usually 0
  const RCODE = flags & 0b0000000000001111;
  return { AA, OPCODE, QR, TC, RA, RD, Z, RCODE };
}
export default parseHeader;
