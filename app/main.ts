import * as dgram from "dgram";
import type { Question } from "./writeQuestion";
import writeHeader from "./writeaHeader";
import writeQuestions from "./writeQuestion";
import writeAnswers from "./writeAnswer";
import parseHeader from "./parseHeader";
import parseQuestion from "./parseQuestion";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  const value = parseHeader(data);
  const QuestData = parseQuestion(data);
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

    const questions: Question[] = QuestData;
    const answers = questions.map((question) => ({
      domainName: question.domainName, // Uncompressed label from question
      type: 1, // Type A (IPv4 address)
      class: 1, // Class IN (Internet)
      ttl: 300, // TTL value
      data: "192.0.2.1", // Example IPv4 address
    }));

    const header = writeHeader({
      QR: 1,
      packetId: value.id,
      OPCODE: value.flagObj.opcode,
      RD: value.flagObj.rd,
      RCODE: value.flagObj.opcode === 0 ? 0 : 4,
      QDCOUNT: questions.length,
      ANCOUNT: answers.length,
    });
    udpSocket.send(
      // @ts-expect-error
      Buffer.concat([header, writeQuestions(questions), writeAnswers(answers)]),
      remoteAddr.port,
      remoteAddr.address
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
