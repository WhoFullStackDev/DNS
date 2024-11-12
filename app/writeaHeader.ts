const writeHeader = ({
  QR = 1,
  TC = 0,
  RD = 0,
  Z = 0,
  RCODE = 0,
  OPCODE = 0,
  AA = 0,
  RA = 0,
  NSCOUNT = 0,
  ARCOUNT = 0,
  ANCOUNT = 0,
  QDCOUNT = 0,
  packetId = 0,
}: {
  packetId?: number; // 16 bits
  QR?: number; // 1 bit
  OPCODE?: number; // 4 bits
  AA?: number; // 1 bit
  TC?: number; // 1 bit
  RD?: number; // 1 bit
  RA?: number; // 1 bit
  Z?: number; // 3 bits
  RCODE?: number; // 4 bits
  QDCOUNT?: number; // 16 bits
  ANCOUNT?: number; // 16 bits
  NSCOUNT?: number; // 16 bits
  ARCOUNT?: number; // 16 bits
}) => {
  const buffer = Buffer.alloc(12);
  buffer.writeInt16BE(packetId);
  const computed =
    (QR << 15) +
    (OPCODE << 11) +
    (AA << 10) +
    (TC << 9) +
    (RD << 8) +
    (RA << 7) +
    (Z << 4) +
    RCODE;
  buffer.writeInt16BE(computed, 2);
  buffer.writeInt16BE(QDCOUNT, 4);
  buffer.writeInt16BE(ANCOUNT, 6);
  buffer.writeInt16BE(NSCOUNT, 8);
  buffer.writeInt16BE(ARCOUNT, 10);
  return buffer;
};
export default writeHeader;
