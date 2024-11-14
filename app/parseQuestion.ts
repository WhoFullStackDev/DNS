import extractLabel from "./extractLabel";

function parseQuestion(questionsBuff: Buffer, qdcount: number) {
  let offset = 12;
  const questions: Array<{
    domainName: string;
    type: number;
    class: number;
    offset: number;
  }> = [];

  for (let i = 0; i < qdcount; i++) {
    const label: string[] = [];
    const { domainName, newOffset } = extractLabel(
      questionsBuff,
      offset,
      label
    );

    offset = newOffset;

    const type = questionsBuff.readUInt16BE(offset);
    const classCode = questionsBuff.readUInt16BE(offset + 2);
    offset += 4;

    questions.push({ domainName, type, class: classCode, offset });
  }
  return questions;
}

export default parseQuestion;
