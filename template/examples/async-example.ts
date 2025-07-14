import { AsyncNode, AsyncFlow, SharedStore } from '@u0z/zero-graph';
import { callLLM } from '../utils/callLLM';

// Simple async example nodes
export class SimpleAsyncQuestionNode extends AsyncNode {
  async prepAsync(shared: SharedStore): Promise<string> {
    // Use question from shared store, or default question
    return shared.question || "In one sentence, what's the end of universe?";
  }

  async execAsync(question: string): Promise<string> {
    // Simply return the question
    return question;
  }

  async postAsync(
    shared: SharedStore,
    prepRes: string,
    execRes: string
  ): Promise<string> {
    // Store the question
    shared.question = execRes;
    return 'default';
  }
}

export class SimpleAsyncAnswerNode extends AsyncNode {
  async prepAsync(shared: SharedStore): Promise<string> {
    // Read question from shared
    return shared.question;
  }

  async execAsync(question: string): Promise<string> {
    // Call LLM asynchronously to get the answer
    return await callLLM(question);
  }

  async postAsync(
    shared: SharedStore,
    prepRes: string,
    execRes: string
  ): Promise<string> {
    // Store the answer in shared
    shared.answer = execRes;
    return 'default';
  }
}

// Create async flow
export function createSimpleAsyncQAFlow(): AsyncFlow {
  const questionNode = new SimpleAsyncQuestionNode();
  const answerNode = new SimpleAsyncAnswerNode();

  questionNode.next(answerNode);
  return new AsyncFlow(questionNode);
}

// Example usage
async function runAsyncExample(): Promise<void> {
  const shared: SharedStore = {
    question: "In one sentence, what's the end of universe?",
    answer: null,
  };

  console.log('Running Async Q&A Flow Example...');
  console.log('Question:', shared.question);

  const qaFlow = createSimpleAsyncQAFlow();
  await qaFlow.runAsync(shared);

  console.log('Answer:', shared.answer);
}

if (require.main === module) {
  runAsyncExample().catch(console.error);
}

export { runAsyncExample };
