# ZeroGraph TypeScript Documentation

Welcome to the ZeroGraph TypeScript documentation! This comprehensive guide will help you understand and use the framework effectively.

## 📚 Documentation Structure

### [Core Concepts](./core/)

Understand the fundamental building blocks of ZeroGraph:

- [Node](./core/node.md) - Basic building block for tasks
- [Flow](./core/flow.md) - Orchestrates node execution
- [Shared Store](./core/shared-store.md) - Communication between nodes
- [Actions](./core/actions.md) - Conditional flow control
- [Batch Processing](./core/batch.md) - Handle multiple items
- [Async Operations](./core/async.md) - Non-blocking operations

### [Design Patterns](./patterns/)

Learn common patterns and best practices:

- [Agent Pattern](./patterns/agent.md) - Autonomous decision making
- [Workflow Pattern](./patterns/workflow.md) - Sequential task processing
- [Batch Pattern](./patterns/batch.md) - Multiple item processing
- [Map-Reduce Pattern](./patterns/map-reduce.md) - Data transformation
- [RAG Pattern](./patterns/rag.md) - Retrieval-augmented generation
- [Multi-Agent Pattern](./patterns/multi-agent.md) - Multiple agents coordination

### [API Reference](./api/)

Complete API documentation:

- [BaseNode](./api/base-node.md) - Abstract base class
- [Node](./api/node.md) - Basic node implementation
- [BatchNode](./api/batch-node.md) - Batch processing node
- [AsyncNode](./api/async-node.md) - Asynchronous node
- [Flow](./api/flow.md) - Flow orchestration
- [Types](./api/types.md) - TypeScript type definitions

### [Migration Guide](./migration/)

Transitioning from other frameworks:

- [From Python ZeroGraph](./migration/from-python.md)
- [From LangChain](./migration/from-langchain.md)
- [From LangGraph](./migration/from-langgraph.md)

## 🚀 Quick Start

### Installation

```bash
npm install @u0z/zero-graph
```

### Basic Usage

```typescript
import { Node, Flow } from '@u0z/zero-graph';

class GreetingNode extends Node {
  exec(name: string): string {
    return `Hello, ${name}!`;
  }
}

const flow = new Flow(new GreetingNode());
const shared = { name: 'World' };
flow.run(shared);
```

## 🎯 Key Features

### 1. **Lightweight**

- Just 100 lines of core code
- Zero dependencies
- Minimal bundle size

### 2. **Type-Safe**

- Full TypeScript support
- Strong typing throughout
- Excellent IDE support

### 3. **Expressive**

- Clean, intuitive API
- Flexible flow control
- Easy to understand

### 4. **Powerful**

- Async/await support
- Batch processing
- Error handling
- Retry mechanisms

## 📖 Learning Path

### Beginner

1. Start with [Core Concepts](./core/)
2. Try the [Hello World](../examples/hello-world/) example
3. Learn about [Nodes](./core/node.md) and [Flows](./core/flow.md)

### Intermediate

1. Explore [Design Patterns](./patterns/)
2. Try the [Agent](../examples/agent/) example
3. Learn about [Batch Processing](./core/batch.md)

### Advanced

1. Study [Async Operations](./core/async.md)
2. Implement [Multi-Agent](./patterns/multi-agent.md) systems
3. Build custom patterns

## 🔧 Development

### Building the Documentation

```bash
npm run docs:build
```

### Serving Locally

```bash
npm run docs:serve
```

### Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📝 Examples

Check out the [examples directory](../examples/) for comprehensive usage examples:

- [Hello World](../examples/hello-world/) - Basic usage
- [Agent](../examples/agent/) - Decision-making agent
- [Batch](../examples/batch/) - Batch processing
- [Async](../examples/async/) - Asynchronous operations

## 🤝 Community

- [GitHub Repository](https://github.com/u-0-z/zero-graph)
- [Discord Community](https://discord.gg/hUHHE9Sa6T)
- [Issue Tracker](https://github.com/u-0-z/zero-graph/issues)

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
