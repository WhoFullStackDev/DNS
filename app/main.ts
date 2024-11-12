import * as dgram from "dgram";
import type { Question } from "./writeQuestion";
import writeHeader from "./writeaHeader";
import writeQuestions from "./writeQuestion";
import writeAnswers from "./writeAnswer";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

    const questions: Question[] = [
      { class: 1, type: 1, domainName: "codecrafters.io" },
    ];
    const answers = [
      {
        type: 1,
        class: 1,
        ttl: 60,
        data: "\x08\x08\x08\x08",
        domainName: "codecrafters.io",
      },
    ];
    const header = writeHeader({
      packetId: 1234,
      QR: 1,
      QDCOUNT: questions.length,
      ANCOUNT: answers.length,
    });
    udpSocket.send(
      Buffer.concat([header, writeQuestions(questions), writeAnswers(answers)]),
      remoteAddr.port,
      remoteAddr.address
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
