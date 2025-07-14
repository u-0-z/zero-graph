# Examples

This directory contains example implementations that demonstrate how to use the ZeroGraph TypeScript template.

## Files

### Synchronous Examples (Mock LLM)

#### `simple-nodes.ts`

- **SimpleQuestionNode**: Uses preset questions from shared store or defaults
- **AnswerNode**: Processes questions and generates mock answers

#### `simple-flow.ts`

- **createSimpleQAFlow()**: Creates a simple question-answering flow
- Connects SimpleQuestionNode → AnswerNode

#### `example.ts`

- **runExample()**: Demonstrates basic usage of the simple flow
- No user interaction required
- Uses mock LLM responses

### Asynchronous Examples (Real LLM)

#### `async-example.ts`

- **SimpleAsyncQuestionNode**: Uses preset questions asynchronously
- **SimpleAsyncAnswerNode**: Processes questions and generates real LLM answers
- **runAsyncExample()**: Demonstrates async flow with real LLM calls
- Requires OpenAI API key
- Uses preset question: "In one sentence, what's the end of universe?"

## Usage

```bash
# Run synchronous example (mock LLM) from the template root directory
yarn example

# Run asynchronous example (real LLM) - requires OpenAI API key
yarn async-example

# Or run directly with ts-node
npx ts-node examples/example.ts
npx ts-node examples/async-example.ts
```

## Key Differences from Interactive Version

| Feature      | Interactive Version      | Simple Version             |
| ------------ | ------------------------ | -------------------------- |
| User Input   | Uses `readline-sync`     | Uses preset questions      |
| Dependencies | Requires `readline-sync` | No additional dependencies |
| Use Case     | Production applications  | Testing and demonstrations |
| Execution    | Blocks for user input    | Runs automatically         |

## Customization

To customize the example:

1. **Change the question**: Modify the `question` property in `example.ts`
2. **Add more nodes**: Extend the flow in `simple-flow.ts`
3. **Modify LLM behavior**: Update the `callLLMSync` function in `../utils/callLLM.ts`

## Integration

These examples can be easily integrated into your main application:

```typescript
import { createSimpleQAFlow } from './examples/simple-flow';
import { SharedStore } from '@u0z/zero-graph';

const shared: SharedStore = {
  question: 'Your custom question here',
  answer: null,
};

const flow = createSimpleQAFlow();
flow.run(shared);
console.log(shared.answer);
```
