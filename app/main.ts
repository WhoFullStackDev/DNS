import * as dgram from "dgram";
import { DnsMessageHeader } from "./dnsMessage";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");

const defeaultHeader = new DnsMessageHeader();
defeaultHeader.packetID = 1234;
defeaultHeader.isResponse = true;

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);
    const response = Buffer.from(defeaultHeader.encode());
    udpSocket.send(response, remoteAddr.port, remoteAddr.address);
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});

udpSocket.bind(2053, "127.0.0.1");
