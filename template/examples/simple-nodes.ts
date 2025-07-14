import { Node, SharedStore } from '@u0z/zero-graph';
import { callLLMSync } from '../utils/callLLM';

export class SimpleQuestionNode extends Node {
  prep(shared: SharedStore): string {
    // Use question from shared store, or default question
    return shared.question || "In one sentence, what's the end of universe?";
  }

  exec(question: string): string {
    // Simply return the question
    return question;
  }

  post(shared: SharedStore, prepRes: string, execRes: string): string {
    // Store the question
    shared.question = execRes;
    return 'default';
  }
}

export class AnswerNode extends Node {
  prep(shared: SharedStore): string {
    // Read question from shared
    return shared.question;
  }

  exec(question: string): string {
    // Call LLM to get the answer
    return callLLMSync(question);
  }

  post(shared: SharedStore, prepRes: string, execRes: string): string {
    // Store the answer in shared
    shared.answer = execRes;
    return 'default';
  }
}
