import type { DnsMessageQuestions } from "./types";

const writeQuestions = (questions: DnsMessageQuestions[]) => {
  return Buffer.concat(
    // @ts-expect-error
    questions.map((q) => {
      const typeAndClass = Buffer.alloc(4);
      const s = q.domainName
        .split(".")
        .map((e) => `${String.fromCharCode(e.length)}${e}`)
        .join("");
      typeAndClass.writeInt16BE(q.type);
      typeAndClass.writeInt16BE(q.class, 2);
      // @ts-expect-error
      return Buffer.concat([Buffer.from(s + "\0", "binary"), typeAndClass]);
    })
  );
};

export default writeQuestions;
