import * as dgram from "dgram";
import type { DnsMessageHeaders, DnsMessageQuestions } from "./types";

const resolverAddress = process.argv[3].split(":");
const resolverIp = resolverAddress[0];
const resolverPort = parseInt(resolverAddress[1]);

const forwardQuery = (
  header: DnsMessageHeaders,
  question: DnsMessageQuestions
) => {
  return new Promise((resolve, reject) => {
    const forwarderSocket = dgram.createSocket("udp4");
    forwarderSocket.on("error", (err) => {
      if (err) {
        forwarderSocket.close();
        reject();
      }
    });
  });
};
