function getValue(msg: Buffer) {
  const id = msg.readUint16BE(0);
  const flag = msg.readUInt16BE(2);
  const qdcount = msg.readUint16BE(4);
  const ancount = msg.readUint16BE(6);
  const nscount = msg.readUint16BE(8);
  const arcount = msg.readUint16BE(10);
  const flagObj = extractFlags(flag);
  return { id, flagObj, qdcount, ancount, nscount, arcount };
}

function extractFlags(flags: number) {
  const qr = (flags & 0b1000000000000000) >> 15; // Query (0) or Response (1)
  const opcode = (flags & 0b0111100000000000) >> 11; // Type of query
  const aa = (flags & 0b0000010000000000) >> 10; // Authoritative Answer
  const tc = (flags & 0b0000001000000000) >> 9; // Truncation
  const rd = (flags & 0b0000000100000000) >> 8; // Recursion Desired
  const ra = (flags & 0b0000000010000000) >> 7; // Recursion Available
  const z = (flags & 0b0000000001110000) >> 4; // Reserved, usually 0
  const rcode = flags & 0b0000000000001111;
  return { qr, opcode, aa, tc, rd, ra, z, rcode };
}
export default getValue;
