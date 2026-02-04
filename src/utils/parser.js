export function parseQuestions(text) {
  const blocks = text.trim().split(/\n\s*\n/);

  return blocks.map(block => {
    const lines = block
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    // Extract answer letter from question line
    const questionLine = lines[0];
    const answerMatch = questionLine.match(/\(([A-Da-d])\)|\b([A-Da-d])$/);
    const answerLetter = (answerMatch?.[1] || answerMatch?.[2]).toUpperCase();
    const correctIndex = ["A", "B", "C", "D"].indexOf(answerLetter);

    // Clean question text
    const question = questionLine
      .replace(/\([A-Da-d]\)/, "")
      .replace(/\b[A-Da-d]$/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();

    // Extract options
    const options = lines
      .slice(1)
      .filter(l => /^[A-D]\./.test(l))
      .map(l => l.replace(/^[A-D]\.\s*/, ""));

    return {
      question,
      options,
      correctIndex
    };
  });
}
