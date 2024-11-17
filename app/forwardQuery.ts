import * as dgram from "dgram";
import type {
  DnsMessageAnswer,
  DnsMessageHeaders,
  DnsMessageQuestions,
} from "./types";
import writeHeader from "./writeHeader";
import writeQuestions from "./writeQuestion";
import parseHeader from "./parseHeader";
import parseQuestion from "./parseQuestion";
import parseAnswer from "./parseAnswer";
import { parseAdditionalSection } from "./parseAddition";

// Get DNS resolver address
const resolverAddress = process.argv[3].split(":");
const resolverIp = resolverAddress[0];
const resolverPort = parseInt(resolverAddress[1]);

const forwardQuery = async (
  header: DnsMessageHeaders,
  question: DnsMessageQuestions
): Promise<{
  header: DnsMessageHeaders;
  question: DnsMessageQuestions[];
  answers: DnsMessageAnswer[];
}> => {
  return new Promise((resolve, reject) => {
    // Create a socket to send the query to the DNS resolver
    const forwarderSocket = dgram.createSocket("udp4");

    // Handle udp error
    forwarderSocket.on("error", (err) => {
      if (err) {
        forwarderSocket.close();
        reject();
      }
    });

    // encoded Header section and question section
    const encodeHeader = writeHeader({
      packetId: header.packetId,
      QDCOUNT: header.QDCOUNT,
      RA: 1,
      RD: header.RD,
      QR: 0,
    });

    const encodeQuestion = writeQuestions([question]);

    // Send query to DNS resolver
    // @ts-expect-error
    const query = Buffer.concat([encodeHeader, encodeQuestion]);
    // @ts-expect-error
    forwarderSocket.send(query, resolverPort, resolverIp);

    // Close the socket when the response is received
    forwarderSocket.once("message", (data: Buffer) => {
      // get Header and question and answer value
      const decodeHeader = parseHeader(data);
      const questions = parseQuestion(data, header.QDCOUNT as number);
      const { answers, offset } = parseAnswer(
        data,
        header.QDCOUNT as number,
        question.offset
      );

      resolve({
        header: decodeHeader,
        question: questions,
        answers,
      });
    });
  });
};

export default forwardQuery;
