# Node

A **Node** is the fundamental building block of ZeroGraph. It represents a single task or operation in your workflow.

## Overview

Nodes follow a simple three-phase lifecycle:

1. **prep**: Prepare data from the shared store
2. **exec**: Execute the main logic
3. **post**: Process results and determine next action

## Basic Usage

```typescript
import { Node, SharedStore } from '@u0z/zero-graph';

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
```

## Node Lifecycle

### 1. prep(shared: SharedStore): any

Prepares data from the shared store for processing.

**Parameters:**

- `shared`: The shared store containing workflow data

**Returns:**

- Any data needed for the `exec` phase

**Example:**

```typescript
prep(shared: SharedStore): { question: string; context: string } {
  return {
    question: shared.question,
    context: shared.context || ''
  };
}
```

### 2. exec(prepResult: any): any

Executes the main logic of the node.

**Parameters:**

- `prepResult`: The result from the `prep` phase

**Returns:**

- The result of the operation

**Example:**

```typescript
exec(input: { question: string; context: string }): string {
  return callLLM(`Context: ${input.context}\nQuestion: ${input.question}`);
}
```

### 3. post(shared: SharedStore, prepRes: any, execRes: any): string

Processes the execution result and determines the next action.

**Parameters:**

- `shared`: The shared store
- `prepRes`: The result from the `prep` phase
- `execRes`: The result from the `exec` phase

**Returns:**

- The action name for the next node (default: 'default')

**Example:**

```typescript
post(shared: SharedStore, prepRes: any, execRes: string): string {
  shared.answer = execRes;

  if (execRes.includes('error')) {
    return 'error';
  }

  return 'success';
}
```

## Error Handling

### Retry Logic

Nodes support automatic retry with configurable parameters:

```typescript
class RobustNode extends Node {
  constructor() {
    super(3, 1); // 3 retries, 1 second wait
  }

  exec(input: any): any {
    // This will be retried up to 3 times if it throws
    return riskyOperation(input);
  }
}
```

### Fallback Handling

Implement custom fallback logic:

```typescript
class FallbackNode extends Node {
  exec(input: any): any {
    return riskyOperation(input);
  }

  execFallback(prepRes: any, error: Error): any {
    console.error('Operation failed:', error);
    return 'fallback result';
  }
}
```

## Advanced Features

### Conditional Actions

Use different actions based on results:

```typescript
class ConditionalNode extends Node {
  post(shared: SharedStore, prepRes: any, execRes: any): string {
    if (execRes.confidence > 0.8) {
      return 'high_confidence';
    } else if (execRes.confidence > 0.5) {
      return 'medium_confidence';
    } else {
      return 'low_confidence';
    }
  }
}
```

### Stateful Nodes

Maintain state between executions:

```typescript
class CounterNode extends Node {
  private count = 0;

  exec(input: any): number {
    this.count++;
    return this.count;
  }
}
```

## Best Practices

### 1. Single Responsibility

Each node should have a single, well-defined purpose:

```typescript
// Good: Single responsibility
class TranslateNode extends Node {
  exec(text: string): string {
    return translate(text, 'en', 'es');
  }
}

// Avoid: Multiple responsibilities
class TranslateAndSaveNode extends Node {
  exec(text: string): string {
    const translated = translate(text, 'en', 'es');
    saveToDatabase(translated);
    sendEmail(translated);
    return translated;
  }
}
```

### 2. Proper Error Handling

Always handle potential errors:

```typescript
class SafeNode extends Node {
  exec(input: any): any {
    try {
      return riskyOperation(input);
    } catch (error) {
      console.error('Operation failed:', error);
      throw error; // Re-throw to trigger retry
    }
  }

  execFallback(prepRes: any, error: Error): any {
    return { error: error.message, fallback: true };
  }
}
```

### 3. Type Safety

Use TypeScript types for better development experience:

```typescript
interface UserData {
  name: string;
  email: string;
}

interface ProcessedUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

class ProcessUserNode extends Node {
  prep(shared: SharedStore): UserData {
    return shared.userData as UserData;
  }

  exec(userData: UserData): ProcessedUser {
    return {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
    };
  }

  post(shared: SharedStore, prepRes: UserData, execRes: ProcessedUser): string {
    shared.processedUser = execRes;
    return 'default';
  }
}
```

## Common Patterns

### 1. Data Transformation

```typescript
class TransformNode extends Node {
  exec(data: any[]): any[] {
    return data.map(item => ({
      ...item,
      processed: true,
      timestamp: new Date(),
    }));
  }
}
```

### 2. External API Call

```typescript
class APINode extends Node {
  async exec(query: string): Promise<any> {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  }
}
```

### 3. Validation

```typescript
class ValidateNode extends Node {
  exec(data: any): any {
    if (!data.email || !data.name) {
      throw new Error('Missing required fields');
    }
    return data;
  }

  post(shared: SharedStore, prepRes: any, execRes: any): string {
    return 'valid';
  }
}
```

## Node Types

ZeroGraph provides several specialized node types:

- **[Node](./node.md)**: Basic node with retry logic
- **[BatchNode](./batch.md)**: Process multiple items
- **[AsyncNode](./async.md)**: Asynchronous operations
- **[AsyncBatchNode](./async.md)**: Async batch processing
- **[AsyncParallelBatchNode](./async.md)**: Parallel async batch processing

## Next Steps

- Learn about [Flows](./flow.md) to orchestrate multiple nodes
- Explore [Batch Processing](./batch.md) for handling multiple items
- Check out [Async Operations](./async.md) for non-blocking workflows
