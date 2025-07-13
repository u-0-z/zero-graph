# ZeroGraph TypeScript Examples

Welcome to the ZeroGraph TypeScript examples! This directory contains comprehensive examples demonstrating various usage patterns and design concepts.

## Quick Start

Each example is self-contained and can be run independently:

```bash
cd examples/hello-world
npm install
npm run dev
```

## Examples Overview

### 🚀 Basic Examples

| Example                       | Difficulty          | Description                         |
| ----------------------------- | ------------------- | ----------------------------------- |
| [Hello World](./hello-world/) | ⭐ _Beginner_       | Your first ZeroGraph application    |
| [Agent](./agent/)             | ⭐⭐ _Intermediate_ | Research agent with decision making |
| [Batch](./batch/)             | ⭐⭐ _Intermediate_ | Process multiple items efficiently  |
| [Async](./async/)             | ⭐⭐ _Intermediate_ | Asynchronous operations and flows   |

### 🎯 Design Patterns

| Pattern              | Example                         | Description                       |
| -------------------- | ------------------------------- | --------------------------------- |
| **Agent**            | [Research Agent](./agent/)      | Autonomous decision-making system |
| **Workflow**         | [Content Pipeline](./workflow/) | Multi-step content generation     |
| **Batch Processing** | [Text Translation](./batch/)    | Handle multiple items at once     |
| **Async Operations** | [Recipe Finder](./async/)       | Non-blocking I/O operations       |

### 💡 Core Concepts

Each example demonstrates key ZeroGraph concepts:

- **Node**: Basic building block for tasks
- **Flow**: Orchestrates node execution
- **Shared Store**: Communication between nodes
- **Actions**: Conditional flow control
- **Batch Processing**: Handle multiple items
- **Async Support**: Non-blocking operations

## Running Examples

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

Each example has its own `package.json`. To run an example:

```bash
cd examples/[example-name]
npm install
npm run dev
```

### Development

For development with auto-reload:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

## Example Structure

Each example follows this structure:

```
example-name/
├── index.ts        # Main implementation
├── package.json    # Dependencies and scripts
├── README.md       # Detailed documentation
└── tsconfig.json   # TypeScript configuration (if needed)
```

## Key Features Demonstrated

### 1. Node Types

- **BaseNode**: Abstract base class
- **Node**: Basic node with retry logic
- **BatchNode**: Process multiple items
- **AsyncNode**: Asynchronous operations
- **AsyncBatchNode**: Async batch processing
- **AsyncParallelBatchNode**: Parallel async processing

### 2. Flow Types

- **Flow**: Basic flow orchestration
- **BatchFlow**: Batch processing flows
- **AsyncFlow**: Asynchronous flows
- **AsyncBatchFlow**: Async batch flows
- **AsyncParallelBatchFlow**: Parallel async batch flows

### 3. Design Patterns

- **Agent Pattern**: Autonomous decision making
- **Workflow Pattern**: Sequential task processing
- **Batch Pattern**: Multiple item processing
- **Map-Reduce Pattern**: Data transformation
- **Pipeline Pattern**: Data flow processing

## Best Practices

### 1. Node Design

- Keep nodes focused on single responsibilities
- Use proper TypeScript typing
- Implement error handling in `execFallback`
- Use shared store for communication

### 2. Flow Design

- Design clear action names
- Handle all possible flow paths
- Use appropriate flow types for your use case
- Consider async requirements early

### 3. Error Handling

- Implement retry logic where appropriate
- Use fallback mechanisms
- Log errors appropriately
- Handle edge cases gracefully

### 4. Performance

- Use async operations for I/O bound tasks
- Consider parallel processing for independent tasks
- Batch similar operations when possible
- Monitor memory usage in long-running flows

## Contributing

To add a new example:

1. Create a new directory under `examples/`
2. Follow the standard structure
3. Include comprehensive README
4. Add TypeScript types
5. Include error handling
6. Add to this overview

## Support

- [Documentation](../docs/)
- [GitHub Issues](https://github.com/u-0-z/zero-graph/issues)
- [Discord Community](https://discord.gg/hUHHE9Sa6T)

## License

MIT License - see [LICENSE](../LICENSE) for details.
