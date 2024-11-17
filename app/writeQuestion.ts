import type { DnsMessageQuestions } from "./types";

const writeQuestions = (questions: DnsMessageQuestions[]) => {
  return Buffer.concat(
    // @ts-expect-error
    questions.map((q) => {
      // Encode the domain name as a series of labels
      const typeAndClass = Buffer.alloc(4);

      // Convert the domain name into a series of labels and their lengths,
      const s = q.domainName
        .split(".")
        .map((e) => `${String.fromCharCode(e.length)}${e}`)
        .join("");

      // Write the type and class of the question to the buffer
      typeAndClass.writeInt16BE(q.type);
      typeAndClass.writeInt16BE(q.class, 2);
      // @ts-expect-error
      return Buffer.concat([Buffer.from(s + "\0", "binary"), typeAndClass]);
    })
  );
};

export default writeQuestions;
