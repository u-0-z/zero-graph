import { SharedStore } from '@u0z/zero-graph';
import { createQAFlow } from './flow';

// Example main function
// Please replace this with your own main function
async function main(): Promise<void> {
  console.log(
    'welcome to the question and answer system! input "quit" or "exit" to exit.'
  );

  const shared: SharedStore = {
    question: null,
    answer: null,
  };

  const qaFlow = createQAFlow();
  await qaFlow.runAsync(shared);

  console.log('bye');
}

if (require.main === module) {
  main().catch(console.error);
}

export { main };
