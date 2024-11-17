import extractLabel from "./extractLabel";

function parseQuestion(questionsBuff: Buffer, qdcount: number) {
  let offset = 12;
  // Create an array to store the parsed questions
  const questions: Array<{
    domainName: string;
    type: number;
    class: number;
    offset: number;
  }> = [];

  // Parse the questions from the buffer

  for (let i = 0; i < qdcount; i++) {
    // Extract the domain name from the buffer and update the offset
    const [domainName, newOffset] = extractLabel(questionsBuff, offset);

    // Update the offset for the next question
    offset = newOffset;

    // Read the type and class of the question from the buffer and update the offset
    const type = questionsBuff.readUInt16BE(offset);
    const classCode = questionsBuff.readUInt16BE(offset + 2);
    offset += 4;

    // Store the question data in the questions array
    questions.push({ domainName, type, class: classCode, offset });
  }
  return questions;
}

export default parseQuestion;
