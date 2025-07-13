# ZeroGraph Hello World

Your first ZeroGraph TypeScript application! This simple example demonstrates how to create a basic ZeroGraph app from scratch.

## What This Example Demonstrates

- How to create your first ZeroGraph TypeScript application
- Basic ZeroGraph concepts and usage
- Simple example of ZeroGraph's capabilities

## Project Structure

```
.
├── index.ts       # Main application entry point
├── package.json   # Project dependencies
└── README.md      # Project documentation
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the example:

```bash
npm run dev
```

Or build and run:

```bash
npm run build
npm start
```

## How It Works

The example creates a simple Q&A flow:

1. **AnswerNode**: Takes a question from the shared store and generates an answer
   - `prep()`: Reads the question from shared store
   - `exec()`: Calls LLM to generate an answer
   - `post()`: Stores the answer back in shared store

2. **Flow**: Orchestrates the node execution

## Expected Output

```
Question: In one sentence, what's the end of universe?
Answer: Mock LLM response to: In one sentence, what's the end of universe?
```

## Key Concepts

- **Node**: The basic building block that handles simple tasks
- **Flow**: Orchestrates node execution
- **Shared Store**: Enables communication between nodes
- **prep/exec/post**: The three phases of node execution

## Next Steps

- Check out the [agent example](../agent) for more complex workflows
- Learn about [batch processing](../batch) for handling multiple items
- Explore [async operations](../async) for asynchronous workflows
