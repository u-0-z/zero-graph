# ZeroGraph TypeScript Template: Agentic Coding

This is a project template for Agentic Coding with [ZeroGraph](https://github.com/u-0-z/zero-graph), a 100-line LLM framework, and your editor of choice.

## Features

- **TypeScript Support**: Full TypeScript support with type safety
- **LLM Integration**: Easy integration with OpenAI and other LLM providers
- **Modular Design**: Clean separation of concerns with nodes, flows, and utilities
- **Development Tools**: Pre-configured build, dev, and start scripts

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

1. Clone or copy this template to your project directory
2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your environment variables:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

### Development

- **Development mode**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`
- **Clean**: `npm run clean`

### Usage

The template includes both interactive and simple question-answering flows:

### Interactive Version (requires user input)

```typescript
import { createQAFlow } from './flow';
import { SharedStore } from '@u0z/zero-graph';

const shared: SharedStore = {
  question: null,
  answer: null,
};

const qaFlow = createQAFlow();
qaFlow.run(shared); // Will prompt for user input

console.log('Answer:', shared.answer);
```

### Simple Version (no user interaction)

```typescript
import { createSimpleQAFlow } from './examples/simple-flow';
import { SharedStore } from '@u0z/zero-graph';

const shared: SharedStore = {
  question: 'Your question here',
  answer: null,
};

const qaFlow = createSimpleQAFlow();
qaFlow.run(shared);

console.log('Answer:', shared.answer);
```

## Project Structure

```
template/
├── flow.ts              # Interactive flow definition and creation
├── nodes.ts             # Interactive node implementations
├── main.ts              # Main entry point (requires user input)
├── examples/
│   ├── simple-nodes.ts  # Simple nodes with preset questions
│   ├── simple-flow.ts   # Simple flow creation
│   ├── example.ts       # Example entry point (no user interaction)
│   └── README.md        # Examples documentation
├── utils/
│   └── callLLM.ts       # LLM utility functions
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── USAGE.md             # Detailed usage guide
└── README.md            # This file
```

## Learn More

- Check out the [ZeroGraph Documentation](https://github.com/u-0-z/zero-graph)
- Explore more examples in the [examples directory](../examples/)
- Learn about [Agentic Coding patterns](https://the-pocket.github.io/PocketFlow/guide.html)

## License

MIT
