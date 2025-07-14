import { AsyncFlow } from '@u0z/zero-graph';
import { GetQuestionNode, AnswerNode, ContinueNode } from './nodes';

export function createQAFlow(): AsyncFlow {
  // Create nodes
  const getQuestionNode = new GetQuestionNode();
  const answerNode = new AnswerNode();
  const continueNode = new ContinueNode();

  // Connect nodes in sequence with loop
  getQuestionNode.next(answerNode);
  answerNode.next(continueNode);

  // Add loop: if continue, go back to question node
  continueNode.next(getQuestionNode, 'continue');
  // If end, the flow will naturally terminate

  // Create async flow starting with input node
  return new AsyncFlow(getQuestionNode);
}

export const qaFlow = createQAFlow();
