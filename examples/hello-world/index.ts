import { Node, Flow, SharedStore } from '../../src/index';

// Mock LLM call function (replace with actual implementation)
function callLLM(prompt: string): string {
  // This is a mock implementation
  // In real usage, you would call your LLM API here
  return `Mock LLM response to: ${prompt}`;
}

class AnswerNode extends Node {
  prep(shared: SharedStore): string {
    // Read question from shared store
    return shared.question;
  }
  
  exec(question: string): string {
    return callLLM(question);
  }
  
  post(shared: SharedStore, prepRes: string, execRes: string): string {
    // Store the answer in shared store
    shared.answer = execRes;
    return 'default';
  }
}

// Create the flow
const answerNode = new AnswerNode();
const qaFlow = new Flow(answerNode);

// Example usage
function main() {
  const shared: SharedStore = {
    question: "In one sentence, what's the end of universe?",
    answer: null
  };

  qaFlow.run(shared);
  
  console.log("Question:", shared.question);
  console.log("Answer:", shared.answer);
}

if (require.main === module) {
  main();
}

export { AnswerNode, qaFlow, main }; 