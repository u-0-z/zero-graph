# ZeroGraph TypeScript Testing Guide

This document describes how to run various tests for the ZeroGraph TypeScript project.

## Table of Contents

1. [Unit Testing](#unit-testing)
2. [Example Testing](#example-testing)
3. [Manual Testing](#manual-testing)
4. [Performance Testing](#performance-testing)
5. [Troubleshooting](#troubleshooting)

## Unit Testing

### Run All Unit Tests

```bash
npm test
```

### Run Tests with Coverage Report

```bash
npm test -- --coverage
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Specific Test File

```bash
npx jest tests/index.test.ts
```

## Example Testing

### Quick Test All Examples

Use the provided test script:

```bash
./test-examples.sh
```

### Manual Testing of Individual Examples

#### 1. Hello World Example

```bash
cd examples/hello-world
npx ts-node index.ts
```

**Expected Output:**

```
Question: In one sentence, what's the end of universe?
Answer: Mock LLM response to: In one sentence, what's the end of universe?
```

#### 2. Agent Example

```bash
cd examples/agent
npx ts-node index.ts
```

**Expected Output:**

```
=== Starting Research Agent ===
Question: What are the recent developments in quantum computing?

Decision: answer
Final answer generated

=== Final Result ===
Answer: Mock LLM response to: Based on the following search results, answer the question:
...
```

#### 3. Batch Example

```bash
cd examples/batch
npx ts-node index.ts
```

**Expected Output:**

```
=== Starting Batch Translation ===
Original text: ZeroGraph is a 100-line minimalist LLM framework
Target languages: Chinese, Spanish, Japanese, French

Translating to Chinese...
Translating to Spanish...
Translating to Japanese...
Translating to French...
✓ Chinese translation completed
✓ Spanish translation completed
✓ Japanese translation completed
✓ French translation completed

All 4 translations completed!

=== Translation Results ===
Chinese: [Chinese] ZeroGraph is a 100-line minimalist LLM framework
Spanish: [Spanish] ZeroGraph is a 100-line minimalist LLM framework
Japanese: [Japanese] ZeroGraph is a 100-line minimalist LLM framework
French: [French] ZeroGraph is a 100-line minimalist LLM framework

Total time: 0ms
```

#### 4. Async Example

```bash
cd examples/async
npx ts-node index.ts
```

**Expected Output:**

```
=== Starting Async Recipe Finder ===
Looking for recipes with: chicken

Fetching recipes for: chicken
Found 4 recipes

Suggesting: Unknown recipe
Accept "Unknown recipe"? (y/n):
✓ Great choice! You selected: Unknown recipe

=== Final Result ===
Final choice: Unknown recipe
Total time: 907ms
```

## Manual Testing

### Local Testing with npm link

If you want to test ZeroGraph in other projects:

```bash
# In ZeroGraph project root directory
npm link

# In other projects
npm link @u0z/zero-graph
```

### Build and Validation

```bash
# Build the project
npm run build

# Verify build output
ls -la dist/

# Verify type definitions
npx tsc --noEmit
```

## Performance Testing

### Benchmarking

Create a simple performance test:

```typescript
// performance-test.ts
import { Node, Flow, SharedStore } from './src/index';

const iterations = 1000;
const start = Date.now();

for (let i = 0; i < iterations; i++) {
  // Run your test code
}

const end = Date.now();
console.log(`${iterations} iterations took ${end - start}ms`);
```

### Memory Usage Testing

```bash
# Use Node.js memory monitoring
node --max-old-space-size=100 examples/hello-world/index.ts
```

## Troubleshooting

### Common Issues

#### 1. TypeScript Compilation Errors

**Issue:** `TSError: ⨯ Unable to compile TypeScript`

**Solution:**

```bash
# Check TypeScript configuration
npx tsc --showConfig

# Clean and rebuild
rm -rf dist/
npm run build
```

#### 2. Module Import Errors

**Issue:** `Cannot find module '@u0z/zero-graph'`

**Solution:**

```bash
# Ensure main project is built
npm run build

# Or use relative path imports
import { Node, Flow } from '../../src/index';
```

#### 3. Dependency Issues

**Issue:** `npm error notarget No matching version found`

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debugging Tips

#### 1. Enable Verbose Logging

```bash
# Enable debugging at runtime
DEBUG=* npx ts-node examples/hello-world/index.ts
```

#### 2. Use Node.js Debugger

```bash
# Use built-in debugger
node --inspect-brk -r ts-node/register examples/hello-world/index.ts
```

#### 3. Add Breakpoints

```typescript
// Add breakpoints in code
debugger;
```

## Continuous Integration

### GitHub Actions Configuration Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: ./test-examples.sh
```

## Best Practices

1. **Build Before Testing:** Always run `npm run build` to build the main project first
2. **Use TypeScript:** All examples should have proper type definitions
3. **Error Handling:** Test various error conditions and edge cases
4. **Documentation Sync:** Ensure example code stays in sync with documentation
5. **Performance Monitoring:** Regularly run performance tests to ensure no regressions

## Contributing Guidelines

If you want to add new tests or examples:

1. Create new examples in the `examples/` directory
2. Add corresponding README.md documentation
3. Add new examples to `test-examples.sh`
4. Update this testing guide documentation
5. Ensure all tests pass

---

For questions, please check [GitHub Issues](https://github.com/u-0-z/zero-graph/issues) or submit a new issue.
