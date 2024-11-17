import * as dgram from "dgram";
import writeHeader from "./writeHeader";
import writeQuestions from "./writeQuestion";
import writeAnswers from "./writeAnswer";
import parseHeader from "./parseHeader";
import parseQuestion from "./parseQuestion";
import forwardQuery from "./forwardQuery";
import type {
  DnsMessageAnswer,
  DnsMessageHeaders,
  DnsMessageQuestions,
} from "./types";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

// ... previous code remains the same//+
udpSocket.on("message", async (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  // Parse the DNS request header and questions
  const value = parseHeader(data);
  const QuestData = parseQuestion(data, value.QDCOUNT as number);
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

    // get dns question value
    const questions: DnsMessageQuestions[] = QuestData;

    // Forward the DNS query to the resolver
    const responses = await Promise.all(
      questions.map((question) => forwardQuery(value, question))
    );

    // Filter out null responses and extract the answers
    const answers: DnsMessageAnswer[] = [];
    let headerValue: DnsMessageHeaders;

    for (const response of responses) {
      if (
        response === null ||
        response.answers[0] === undefined ||
        response.header === undefined
      ) {
        return null;
      }
      answers.push(...response.answers);
      headerValue = response.header; // Assign headerValue here//+
    }

    // Prepare the DNS response header and questions
    const header = writeHeader({
      QR: 1, // Response-
      packetId: headerValue.packetId, // Use headerValue here//+
      OPCODE: headerValue.OPCODE,
      RD: headerValue.RD, // Echo back the RD value from the query
      RA: 1, // Set RA to 1 to indicate recursion is available
      RCODE: headerValue.RCODE === 0 ? 0 : 4, // Keep the RCODE logic intact
      QDCOUNT: headerValue.QDCOUNT,
      ANCOUNT: headerValue.ANCOUNT,
      ARCOUNT: headerValue.ARCOUNT,
      NSCOUNT: headerValue.NSCOUNT,
    });

    // send Encoded value to client
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
