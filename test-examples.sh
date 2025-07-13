#!/bin/bash

echo "=== ZeroGraph TypeScript Examples Testing ==="
echo

# Function to run an example
run_example() {
    local example_name=$1
    echo "📦 Running $example_name example..."
    echo "----------------------------------------"
    
    cd examples/$example_name
    
    if [ -f "index.ts" ]; then
        npx ts-node index.ts
    else
        echo "❌ No index.ts found in $example_name"
    fi
    
    echo
    echo "✅ $example_name example completed"
    echo "========================================"
    echo
    
    cd ../..
}

# Build the main project first
echo "🔨 Building main project..."
npm run build
echo

# Run all examples
examples=("hello-world" "agent" "batch" "async")

for example in "${examples[@]}"; do
    run_example "$example"
done

echo "🎉 All examples completed!" 