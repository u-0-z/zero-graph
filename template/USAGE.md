# ZeroGraph TypeScript Template - Usage Guide

## Problem Fixed

Issues in the original template:

- `GetQuestionNode` used `Promise` but `Node` class is synchronous
- Resulted in output `Promise { <pending> }` instead of actual user input

## Solutions

We provide two solutions:

### 1. Using readline-sync (Recommended for interactive applications)

Files: `nodes.ts`, `flow.ts`, `main.ts`

```bash
# Install dependencies
npm install readline-sync
npm install --save-dev @types/readline-sync

# Usage
yarn dev  # Will prompt user for input
```

### 2. Using simple version (Recommended for examples and testing)

Files: `examples/simple-nodes.ts`, `examples/simple-flow.ts`, `examples/example.ts`

```bash
# Run example
yarn example  # Uses preset question, no user interaction required
```

## File Structure

```
template/
├── nodes.ts                  # Interactive AsyncNodes using readline-sync + real LLM
├── flow.ts                   # Interactive AsyncFlow creation
├── main.ts                   # Main entry point (requires user input, real LLM)
├── examples/
│   ├── simple-nodes.ts       # Synchronous nodes with mock LLM
│   ├── simple-flow.ts        # Synchronous flow creation
│   ├── example.ts            # Synchronous example (mock LLM)
│   ├── async-example.ts      # Asynchronous example (real LLM)
│   └── README.md             # Examples documentation
├── utils/
│   └── callLLM.ts            # LLM utility functions (async + sync)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## File Descriptions

### Interactive Version (Real LLM)

- `nodes.ts` - Uses AsyncNode with readline-sync for user input and real LLM calls
- `flow.ts` - Creates AsyncFlow for handling asynchronous operations
- `main.ts` - Main entry point, requires user input and OpenAI API key

### Example Versions

- `examples/simple-nodes.ts` - Synchronous nodes with mock LLM responses
- `examples/simple-flow.ts` - Synchronous flow for testing
- `examples/example.ts` - Synchronous example, no user interaction, mock LLM
- `examples/async-example.ts` - Asynchronous example with real LLM calls

## Running the Template

```bash
# Interactive version (requires user input, real LLM)
yarn dev

# Synchronous example (mock LLM, no user interaction)
yarn example

# Asynchronous example (real LLM, no user interaction)
yarn async-example

# Build project
yarn build

# Run built files
yarn start

# Clean build files
yarn clean
```

## Important Notes

1. **Sync vs Async**: ZeroGraph's `Node` class is synchronous and cannot return `Promise`
2. **User Input**: For user input, use `readline-sync` instead of native `readline`
3. **Type Safety**: Ensure correct import paths, use `@u0z/zero-graph` instead of relative paths
4. **Development**: The template provides both interactive and non-interactive versions for different use cases

## Recommended Usage

- **Quick Testing**: Use `yarn example` (synchronous, mock LLM, no user interaction)
- **Real LLM Testing**: Use `yarn async-example` (asynchronous, real LLM, no user interaction)
- **Interactive Applications**: Use `yarn dev` (asynchronous, real LLM, user input required)
- **Learning Examples**: Check `examples/` directory for different implementation patterns
- **Quick Start**: Copy the template, run `yarn install`, set OpenAI API key, then `yarn async-example`

## Dependencies

- `@u0z/zero-graph` - The core ZeroGraph framework
- `openai` - For LLM API calls
- `readline-sync` - For synchronous user input
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution for development
