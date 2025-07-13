# Flow

A **Flow** orchestrates the execution of multiple nodes, managing the workflow logic and data flow between nodes.

## Overview

Flows connect nodes through actions, creating a directed graph that represents your workflow. Each node can return different actions, determining which node executes next.

## Basic Usage

```typescript
import { Node, Flow, SharedStore } from '@u0z/zero-graph';

class StartNode extends Node {
  exec(input: any): string {
    return 'processed';
  }

  post(shared: SharedStore, prepRes: any, execRes: string): string {
    return 'continue';
  }
}

class EndNode extends Node {
  exec(input: any): string {
    return 'completed';
  }
}

// Create nodes
const start = new StartNode();
const end = new EndNode();

// Connect nodes
start.next(end, 'continue');

// Create flow
const flow = new Flow(start);
```

## Connecting Nodes

### Simple Connection

```typescript
const nodeA = new NodeA();
const nodeB = new NodeB();

// Connect with default action
nodeA.next(nodeB);

// Connect with specific action
nodeA.next(nodeB, 'success');
```

### Multiple Connections

```typescript
const decision = new DecisionNode();
const success = new SuccessNode();
const error = new ErrorNode();

// Connect different actions to different nodes
decision.next(success, 'success');
decision.next(error, 'error');
```

### Conditional Flow

```typescript
class ConditionalNode extends Node {
  post(shared: SharedStore, prepRes: any, execRes: any): string {
    if (execRes.success) {
      return 'success';
    } else {
      return 'retry';
    }
  }
}

const conditional = new ConditionalNode();
const successNode = new SuccessNode();
const retryNode = new RetryNode();

conditional.next(successNode, 'success');
conditional.next(retryNode, 'retry');
```

## Flow Execution

### Running a Flow

```typescript
const shared: SharedStore = {
  input: 'some data',
  result: null,
};

// Run the flow
const finalAction = flow.run(shared);
console.log('Flow completed with action:', finalAction);
```

### Flow Lifecycle

1. **Start**: Begin with the start node
2. **Execute**: Run each node's lifecycle (prep → exec → post)
3. **Navigate**: Use the returned action to find the next node
4. **Repeat**: Continue until no next node is found
5. **Complete**: Return the final action

## Advanced Features

### Loops and Cycles

```typescript
class LoopNode extends Node {
  private iterations = 0;

  post(shared: SharedStore, prepRes: any, execRes: any): string {
    this.iterations++;

    if (this.iterations < 3) {
      return 'continue'; // Loop back
    } else {
      return 'done'; // Exit loop
    }
  }
}

const loop = new LoopNode();
const process = new ProcessNode();
const end = new EndNode();

loop.next(process, 'continue');
process.next(loop, 'default'); // Create loop
loop.next(end, 'done'); // Exit condition
```

### Dynamic Flow Control

```typescript
class DynamicNode extends Node {
  post(shared: SharedStore, prepRes: any, execRes: any): string {
    // Dynamic action based on runtime conditions
    const condition = shared.condition;

    switch (condition) {
      case 'A':
        return 'path_a';
      case 'B':
        return 'path_b';
      default:
        return 'default_path';
    }
  }
}
```

### Error Handling in Flows

```typescript
class ErrorHandlingNode extends Node {
  exec(input: any): any {
    if (input.shouldFail) {
      throw new Error('Simulated error');
    }
    return 'success';
  }

  execFallback(prepRes: any, error: Error): any {
    return { error: error.message };
  }

  post(shared: SharedStore, prepRes: any, execRes: any): string {
    if (execRes.error) {
      return 'error';
    }
    return 'success';
  }
}
```

## Flow Types

### Basic Flow

```typescript
class BasicFlow extends Flow {
  constructor() {
    const start = new StartNode();
    super(start);
  }
}
```

### Custom Flow Logic

```typescript
class CustomFlow extends Flow {
  prep(shared: SharedStore): any {
    // Custom preparation logic
    return { startTime: Date.now() };
  }

  post(shared: SharedStore, prepRes: any, execRes: any): string {
    // Custom completion logic
    const duration = Date.now() - prepRes.startTime;
    shared.duration = duration;
    return execRes;
  }
}
```

## Best Practices

### 1. Clear Action Names

Use descriptive action names:

```typescript
// Good: Descriptive actions
node.post(shared, prepRes, execRes): string {
  if (execRes.confidence > 0.8) {
    return 'high_confidence';
  } else {
    return 'needs_review';
  }
}

// Avoid: Generic actions
node.post(shared, prepRes, execRes): string {
  return execRes.success ? 'a' : 'b';
}
```

### 2. Handle All Paths

Ensure all possible actions have corresponding connections:

```typescript
const decision = new DecisionNode();
const success = new SuccessNode();
const error = new ErrorNode();
const unknown = new UnknownNode();

// Handle all possible actions
decision.next(success, 'success');
decision.next(error, 'error');
decision.next(unknown, 'unknown');
```

### 3. Avoid Deep Nesting

Keep flows readable by avoiding too many nested conditions:

```typescript
// Good: Simple flow
const validate = new ValidateNode();
const process = new ProcessNode();
const save = new SaveNode();

validate.next(process, 'valid');
process.next(save, 'processed');

// Avoid: Complex nested flow
const complex = new ComplexNode();
// ... many nested conditions
```

## Common Patterns

### 1. Linear Workflow

```typescript
const step1 = new Step1Node();
const step2 = new Step2Node();
const step3 = new Step3Node();

step1.next(step2);
step2.next(step3);

const workflow = new Flow(step1);
```

### 2. Conditional Branching

```typescript
const check = new CheckNode();
const pathA = new PathANode();
const pathB = new PathBNode();
const merge = new MergeNode();

check.next(pathA, 'condition_a');
check.next(pathB, 'condition_b');
pathA.next(merge);
pathB.next(merge);
```

### 3. Retry Pattern

```typescript
const attempt = new AttemptNode();
const success = new SuccessNode();
const retry = new RetryNode();

attempt.next(success, 'success');
attempt.next(retry, 'retry');
retry.next(attempt, 'default'); // Loop back
```

### 4. Error Handling Pattern

```typescript
const risky = new RiskyNode();
const success = new SuccessNode();
const error = new ErrorNode();
const cleanup = new CleanupNode();

risky.next(success, 'success');
risky.next(error, 'error');
success.next(cleanup);
error.next(cleanup);
```

## Debugging Flows

### 1. Logging

```typescript
class LoggingFlow extends Flow {
  protected getNextNode(curr: BaseNode, action: string): BaseNode | null {
    console.log(
      `Transitioning from ${curr.constructor.name} via action '${action}'`
    );
    return super.getNextNode(curr, action);
  }
}
```

### 2. Visualization

```typescript
class VisualizationFlow extends Flow {
  getFlowGraph(): string {
    // Generate flow graph representation
    return 'digraph { /* ... */ }';
  }
}
```

## Flow Variants

ZeroGraph provides several flow types:

- **[Flow](./flow.md)**: Basic flow orchestration
- **[BatchFlow](./batch.md)**: Batch processing flows
- **[AsyncFlow](./async.md)**: Asynchronous flows
- **[AsyncBatchFlow](./async.md)**: Async batch flows
- **[AsyncParallelBatchFlow](./async.md)**: Parallel async batch flows

## Next Steps

- Learn about [Batch Processing](./batch.md) for handling multiple items
- Explore [Async Operations](./async.md) for non-blocking workflows
- Check out [Design Patterns](../patterns/) for common flow patterns
