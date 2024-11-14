export interface DnsMessageHeaders {
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
  ARCOUNT?: number;
}

export interface DnsMessageQuestions {
  type: number;
  class: number;
  domainName: string;
  offset: number;
}

export interface DnsMessageAnswer {
  domainName: string;
  type: number; // 2 bytes
  class: number; // 2 bytes
  ttl: number; // 4 bytes
  data: string;
}
