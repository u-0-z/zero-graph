import { Flow } from '@u0z/zero-graph';
import { SimpleQuestionNode, AnswerNode } from './simple-nodes';

export function createSimpleQAFlow(): Flow {
  // Create nodes
  const questionNode = new SimpleQuestionNode();
  const answerNode = new AnswerNode();

  // Connect nodes in sequence
  questionNode.next(answerNode);

  // Create flow starting with question node
  return new Flow(questionNode);
}

export const simpleQAFlow = createSimpleQAFlow();
