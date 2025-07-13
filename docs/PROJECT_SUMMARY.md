# ZeroGraph TypeScript - Project Summary

## 🎯 Project Overview

ZeroGraph TypeScript is a TypeScript implementation of the minimalist LLM framework based on the Python version of ZeroGraph. It maintains the original 100-line core code design philosophy while providing complete TypeScript type support and modern development experience.

## 🏗️ Project Structure

```
@u0z/zero-graph/
├── src/                    # Core framework source code
│   └── index.ts           # 100-line core implementation
├── examples/              # Usage examples
│   ├── hello-world/       # Basic example
│   ├── agent/            # Agent example
│   ├── batch/            # Batch processing example
│   ├── async/            # Async operations example
│   └── README.md         # Examples overview
├── docs/                 # Documentation
│   ├── core/            # Core concepts documentation
│   ├── patterns/        # Design patterns documentation
│   ├── api/             # API reference documentation
│   └── README.md        # Documentation entry point
├── tests/               # Test files
│   └── index.test.ts    # Basic tests
├── dist/                # Build output (generated)
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration
├── README.md            # Project description
└── LICENSE              # MIT License
```

## ⚡ Core Features

### 1. Minimalist Design

- **100-line core code**: Maintains the same minimalist design as the Python version
- **Zero dependencies**: No external dependencies, avoiding vendor lock-in
- **Lightweight**: Minimal package size

### 2. Native TypeScript Support

- **Complete type safety**: All APIs have complete type definitions
- **Excellent IDE support**: Auto-completion, refactoring, error checking
- **Modern development experience**: Follows TypeScript best practices

### 3. Powerful Features

- **Sync/Async support**: Supports both synchronous and asynchronous operations
- **Batch processing capability**: Efficiently processes multiple items
- **Error handling**: Built-in retry mechanisms and error fallback
- **Parallel processing**: Supports parallel batch processing

## 🔧 Core Architecture

### Base Class Hierarchy

```
BaseNode (Abstract base class)
├── Node (Basic node with retry support)
│   ├── BatchNode (Batch processing node)
│   └── AsyncNode (Async node)
│       ├── AsyncBatchNode (Async batch processing)
│       └── AsyncParallelBatchNode (Parallel async batch processing)
└── Flow (Flow orchestration)
    ├── BatchFlow (Batch processing flow)
    └── AsyncFlow (Async flow)
        ├── AsyncBatchFlow (Async batch processing flow)
        └── AsyncParallelBatchFlow (Parallel async batch processing flow)
```

### Core Concepts

1. **Node**: Basic building block of workflows
   - `prep(shared)`: Prepare data from shared storage
   - `exec(prepRes)`: Execute main logic
   - `post(shared, prepRes, execRes)`: Process results and determine next action

2. **Flow**: Orchestrates execution of multiple nodes
   - Connects nodes through actions
   - Supports conditional branching and loops
   - Manages data flow and state

3. **SharedStore**: Communication mechanism between nodes
   - Stores workflow state
   - Passes data between nodes
   - Supports arbitrary data types

## 📚 Usage Examples

### Basic Example

```typescript
import { Node, Flow } from '@u0z/zero-graph';

class GreetingNode extends Node {
  prep(shared: SharedStore): string {
    return shared.name || 'World';
  }

  exec(name: string): string {
    return `Hello, ${name}!`;
  }

  post(shared: SharedStore, prepRes: string, execRes: string): string {
    shared.greeting = execRes;
    return 'default';
  }
}

const flow = new Flow(new GreetingNode());
const shared = { name: 'TypeScript' };
flow.run(shared);
console.log(shared.greeting); // "Hello, TypeScript!"
```

### Agent Example

```typescript
// Decision node -> Search node -> Answer node
const decide = new DecideActionNode();
const search = new SearchWebNode();
const answer = new AnswerQuestionNode();

decide.next(search, 'search');
decide.next(answer, 'answer');
search.next(decide, 'decide');

const agentFlow = new Flow(decide);
```

### Batch Processing Example

```typescript
class TranslateNode extends BatchNode {
  prep(shared: SharedStore): Array<{ text: string; lang: string }> {
    return shared.languages.map(lang => ({
      text: shared.text,
      lang,
    }));
  }

  exec(item: { text: string; lang: string }): string {
    return translate(item.text, item.lang);
  }
}
```

### Async Example

```typescript
class AsyncAPINode extends AsyncNode {
  async execAsync(query: string): Promise<any> {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  }
}
```

## 🎨 Design Patterns

### 1. Agent Pattern

- Autonomous decision-making capability
- Conditional branching flows
- State accumulation

### 2. Workflow Pattern

- Sequential task processing
- Data pipeline
- Step orchestration

### 3. Batch Pattern

- Multi-item processing
- Result aggregation
- Efficiency optimization

### 4. Async Pattern

- Non-blocking operations
- Concurrent processing
- Performance optimization

## 🚀 Development and Build

### Development Environment Setup

```bash
# Install dependencies
npm install

# Development mode (watch file changes)
npm run dev

# Build project
npm run build

# Run tests
npm test

# Code linting
npm run lint

# Code formatting
npm run format
```

### Project Configuration

- **TypeScript**: Strict mode, ES2020 target
- **ESLint**: Code quality checking
- **Prettier**: Code formatting
- **Jest**: Unit testing framework

## 📖 Documentation Structure

### Core Documentation

- [Node](./docs/core/node.md) - Detailed node explanation
- [Flow](./docs/core/flow.md) - Flow orchestration
- [Shared Store](./docs/core/shared-store.md) - Data sharing
- [Batch Processing](./docs/core/batch.md) - Batch processing
- [Async Operations](./docs/core/async.md) - Async operations

### Design Patterns

- [Agent Pattern](./docs/patterns/agent.md) - Agent pattern
- [Workflow Pattern](./docs/patterns/workflow.md) - Workflow pattern
- [Batch Pattern](./docs/patterns/batch.md) - Batch processing pattern
- [RAG Pattern](./docs/patterns/rag.md) - Retrieval Augmented Generation

### API Reference

- [BaseNode](./docs/api/base-node.md) - Base node API
- [Node](./docs/api/node.md) - Node API
- [Flow](./docs/api/flow.md) - Flow API
- [Types](./docs/api/types.md) - Type definitions

## 🔄 Comparison with Python Version

| Feature         | Python Version | TypeScript Version |
| --------------- | -------------- | ------------------ |
| Core Code Lines | 100 lines      | 100 lines          |
| Type Safety     | Runtime check  | Compile-time check |
| IDE Support     | Basic          | Excellent          |
| Package Manager | pip            | npm/yarn           |
| Async Support   | asyncio        | async/await        |
| Error Handling  | try/except     | try/catch          |
| Module System   | import         | ES6 modules        |

## 🎯 Use Cases

### 1. LLM Application Development

- Intelligent dialogue systems
- Content generation pipelines
- Document processing automation

### 2. Data Processing

- Batch data transformation
- Async API calls
- Parallel processing tasks

### 3. Workflow Automation

- Business process automation
- Decision support systems
- Multi-step task orchestration

## 📊 Performance Characteristics

### Advantages

- **Lightweight**: Minimal runtime overhead
- **Type safe**: Compile-time error checking
- **Concurrent support**: Efficient async processing
- **Extensible**: Easy to add new node types

### Suitable Scenarios

- Projects requiring type safety
- Complex async workflows
- High-performance batch processing tasks
- Enterprise application development

## 🤝 Contributing Guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT License - See [LICENSE](./LICENSE)

## 🔗 Related Links

- [Python Version](https://github.com/u-0-z/ZeroGraph)
- [Official Documentation](https://u-zero.github.io/ZeroGraph/)
- [Discord Community](https://discord.gg/hUHHE9Sa6T)
- [Issue Reporting](https://github.com/u-0-z/zero-graph/issues)

---

_ZeroGraph TypeScript - A minimalist framework for AI agents to build AI agents_
