import { SharedStore } from '@u0z/zero-graph';
import { createSimpleQAFlow } from './simple-flow';

// Simple example without user interaction
function runExample(): void {
  const shared: SharedStore = {
    question: "In one sentence, what's the end of universe?",
    answer: null,
  };

  // Since GetQuestionNode now requires user input,
  // we'll pre-populate the question for this example
  console.log('Running Q&A Flow Example...');
  console.log('Question:', shared.question);

  const qaFlow = createSimpleQAFlow();
  qaFlow.run(shared);

  console.log('Answer:', shared.answer);
}

if (require.main === module) {
  runExample();
}

export { runExample };
