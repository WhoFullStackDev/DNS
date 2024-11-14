import * as dgram from "dgram";
import writeHeader from "./writeaHeader";
import writeQuestions from "./writeQuestion";
import writeAnswers from "./writeAnswer";
import parseHeader from "./parseHeader";
import parseQuestion from "./parseQuestion";
import forwardQuery from "./forwardQuery";
import type { DnsMessageAnswer, DnsMessageQuestions } from "./types";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", async (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  const value = parseHeader(data);
  const QuestData = parseQuestion(data, value.QDCOUNT as number);
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

    const questions: DnsMessageQuestions[] = QuestData;
    const responses = await Promise.all(
      questions.map((question) => forwardQuery(value, question))
    );

    const answers: DnsMessageAnswer[] = [];
    for (const response of responses) {
      if (response === null || response.answer[0] === undefined) {
        return null;
      }
      answers.push(...response.answer);
    }

    const header = writeHeader({
      QR: 1,
      packetId: value.packetId,
      OPCODE: value.OPCODE,
      RD: value.RD,
      RCODE: value.RCODE === 0 ? 0 : 4,
      QDCOUNT: value.QDCOUNT,
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
