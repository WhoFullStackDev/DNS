import * as dgram from "dgram";
import type {
  DnsMessageAnswer,
  DnsMessageHeaders,
  DnsMessageQuestions,
} from "./types";
import writeHeader from "./writeaHeader";
import writeQuestions from "./writeQuestion";
import parseHeader from "./parseHeader";
import parseQuestion from "./parseQuestion";
import parseAnswer from "./parseAnswer";

const resolverAddress = process.argv[3].split(":");
const resolverIp = resolverAddress[0];
const resolverPort = parseInt(resolverAddress[1]);

const forwardQuery = async (
  header: DnsMessageHeaders,
  question: DnsMessageQuestions
): Promise<{
  header: DnsMessageHeaders;
  question: DnsMessageQuestions[];
  answer: DnsMessageAnswer[];
}> => {
  return new Promise((resolve, reject) => {
    const forwarderSocket = dgram.createSocket("udp4");
    forwarderSocket.on("error", (err) => {
      if (err) {
        forwarderSocket.close();
        reject();
      }
    });
    console.log(header);
    const encodeHeader = writeHeader({
      packetId: header.packetId,
      QDCOUNT: header.QDCOUNT,
      RD: 1,
      QR: 0,
    });
    const endcodeQuestion = writeQuestions([question]);
    const query = Buffer.concat([encodeHeader, endcodeQuestion]);
    forwarderSocket.send(query, resolverPort, resolverIp);
    forwarderSocket.once("message", (data: Buffer) => {
      const decodeHeader = parseHeader(data);
      // console.log(decodeHeader);
      if (header.RCODE !== 0) {
        console.log(`Received error response with RCODE: ${header.RCODE}`);
      }
      const questions = parseQuestion(data, header.QDCOUNT as number);

      const answer = parseAnswer(
        data,
        header.QDCOUNT as number,
        question.offset
      );

      resolve({
        header: decodeHeader,
        question: questions,
        answer,
      });
    });
  });
};

export default forwardQuery;
