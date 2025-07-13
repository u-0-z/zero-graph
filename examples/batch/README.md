# ZeroGraph Batch Processing Example

This example demonstrates the BatchNode concept in ZeroGraph by implementing a text translator that processes multiple languages simultaneously.

## What this Example Demonstrates

- How to use BatchNode to process multiple items efficiently
- The three key methods of BatchNode:
  1. `prep`: Splits input into batches
  2. `exec`: Processes each batch item independently
  3. `post`: Combines results from all batch items

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the example:

```bash
npm run dev
```

## How it Works

The example translates text into multiple languages:

1. **Batching (prep)**: The input text is prepared for translation into multiple languages
2. **Processing (exec)**: Each language translation is processed independently
3. **Combining (post)**: All translations are collected and stored in the shared store

## Example Output

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

Total time: 15ms
```

## Key Concepts Illustrated

1. **Batch Processing**: Shows how BatchNode handles multiple items efficiently
2. **Independent Processing**: Demonstrates how each batch item is processed separately
3. **Result Aggregation**: Shows how individual results are combined into a final output
4. **Error Handling**: Built-in retry mechanism (configured with maxRetries)

## Customization

You can easily customize this example by:

1. **Adding Real Translation**: Replace the mock `translateText` function with actual translation APIs
2. **Different Batch Types**: Modify the `prep` method to create different types of batches
3. **Parallel Processing**: Use `AsyncParallelBatchNode` for concurrent processing
4. **Error Handling**: Implement custom `execFallback` for handling translation failures

## Real-World Applications

This pattern is useful for:

- Document translation into multiple languages
- Image processing with different filters
- Data validation across multiple rules
- API calls to multiple endpoints
- File processing in batches

## Next Steps

- Try the [async batch example](../async-batch) for concurrent processing
- Check out [parallel batch processing](../parallel-batch) for I/O-bound tasks
- Explore [batch flows](../batch-flow) for more complex batch workflows
