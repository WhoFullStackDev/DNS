import * as dgram from "dgram";
import { DnsMessageHeader } from "./dnsMessage";
import type { Question } from "./writeQuestion";
import writeHeader from "./writeaHeader";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");

const defeaultHeader = new DnsMessageHeader();
defeaultHeader.packetID = 1234;
defeaultHeader.isResponse = true;

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);
    const questions: Question[] = [
      { domainName: "codecrafters.io", class: 1, type: 1 },
    ];
    const header = writeHeader({
      packetId: 1234,
      QR: 1,
      QDCOUNT: questions.length,
    });
    udpSocket.send(
      // @ts-expect-error
      Buffer.concat([header, writeHeader(questions)]),
      remoteAddr.port,
      remoteAddr.address
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});

udpSocket.bind(2053, "127.0.0.1");
