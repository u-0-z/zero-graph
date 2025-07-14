/**
 * ZeroGraph Async Chat - Simplified Single File Version
 *
 * This simplified version assumes the vm2 environment already provides:
 * - ZeroGraph framework (from @u0z/zero-graph npm package)
 * - openai client instance
 * - Basic JavaScript global objects
 *
 * Features:
 * - Minimal code implementation
 * - Depends on host environment for packages and services
 * - Focuses on business logic rather than framework implementation
 */

// Get ZeroGraph framework from host environment
const { AsyncNode, AsyncFlow } = ZeroGraph;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convenient function to call LLM
 * Uses the openai client provided by host environment
 */
async function callLLM(prompt, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 200,
      temperature: options.temperature || 0.8,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('LLM call failed:', error.message);
    // Fallback to mock response
    return `Sorry, AI service is temporarily unavailable. You said: ${prompt.substring(0, 50)}...`;
  }
}

/**
 * Mock function to get user input
 * In vm2 environment, this is usually handled by the host environment
 */
async function getUserInput(prompt) {
  // In actual vm2 environment, the host environment handles input
  // This provides a placeholder implementation
  console.log(prompt);

  // Mock user input sequence
  const mockInputs = [
    'Hello, who are you?',
    'Please write a poem about autumn',
    'Thank you!',
    'exit',
  ];

  const currentInput = mockInputs.shift() || 'exit';
  console.log(`[Mock User Input] ${currentInput}`);

  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 1000));

  return currentInput;
}

// =============================================================================
// Chat Node Definitions
// =============================================================================

/**
 * User input node
 */
class UserInputNode extends AsyncNode {
  async execAsync() {
    const input = await getUserInput('\n💬 User: ');
    return input.trim();
  }

  async postAsync(shared, prepRes, execRes) {
    const userInput = execRes;

    // Check exit commands
    if (['exit', 'quit', 'goodbye', 'bye'].includes(userInput.toLowerCase())) {
      shared.shouldExit = true;
      console.log('\n👋 Goodbye! Thanks for using ZeroGraph Chat Assistant!');
      return 'exit';
    }

    // Save user input
    shared.userMessage = userInput;
    return 'process';
  }
}

/**
 * AI response node
 */
class AIResponseNode extends AsyncNode {
  async prepAsync(shared) {
    // Build conversation context
    const history = shared.conversationHistory || [];
    const userMessage = shared.userMessage || '';

    return { history, userMessage };
  }

  async execAsync({ history, userMessage }) {
    // Build prompt with history
    let prompt =
      'You are a friendly and intelligent AI assistant. Please respond naturally and helpfully.\n\n';

    // Add recent conversation history (last 3 exchanges)
    if (history.length > 0) {
      prompt += 'Recent conversation:\n';
      history.slice(-3).forEach(({ user, ai }) => {
        prompt += `User: ${user}\nAssistant: ${ai}\n`;
      });
      prompt += '\n';
    }

    prompt += `User: ${userMessage}\nAssistant:`;

    // Call LLM
    const response = await callLLM(prompt, {
      temperature: 0.8,
      maxTokens: 300,
    });

    return response;
  }

  async postAsync(shared, { history, userMessage }, aiResponse) {
    // Update conversation history
    const conversationHistory = shared.conversationHistory || [];
    conversationHistory.push({
      user: userMessage,
      ai: aiResponse,
    });

    // Keep last 5 exchanges
    if (conversationHistory.length > 5) {
      conversationHistory.shift();
    }

    shared.conversationHistory = conversationHistory;

    // Display AI response
    console.log(`\n🤖 Assistant: ${aiResponse}`);

    return 'continue';
  }
}

/**
 * Conversation control node
 */
class ConversationControlNode extends AsyncNode {
  async execAsync() {
    // Check if should continue
    return 'continue';
  }

  async postAsync(shared) {
    // If user wants to exit, end conversation
    if (shared.shouldExit) {
      return 'exit';
    }

    // Otherwise continue next round
    return 'next_round';
  }
}

// =============================================================================
// Flow Creation and Execution
// =============================================================================

/**
 * Create chat flow
 */
function createChatFlow() {
  const userInput = new UserInputNode();
  const aiResponse = new AIResponseNode();
  const control = new ConversationControlNode();

  // Connect nodes
  userInput.next(aiResponse, 'process');
  userInput.next(control, 'exit'); // Direct exit

  aiResponse.next(control, 'continue');

  control.next(userInput, 'next_round'); // Continue next round
  // 'exit' action will naturally end the flow

  return new AsyncFlow(userInput);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Welcome to ZeroGraph Simplified Chat Assistant!');
  console.log(
    '📝 This is a simplified version that depends on services provided by vm2 environment'
  );
  console.log('💡 Type "exit" or "quit" to end the conversation\n');

  // Initialize conversation state
  const shared = {
    userMessage: '',
    conversationHistory: [],
    shouldExit: false,
  };

  try {
    console.log('🎯 Starting chat...');

    // Create and run chat flow
    const chatFlow = createChatFlow();
    await chatFlow.runAsync(shared);

    console.log('\n✅ Chat session ended');
  } catch (error) {
    console.error('\n❌ Error during chat:', error.message);
    console.log(
      'This might be due to network issues or API configuration problems'
    );
  }
}

// =============================================================================
// Module Export (for testing and extension)
// =============================================================================

// Export key components for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UserInputNode,
    AIResponseNode,
    ConversationControlNode,
    createChatFlow,
    callLLM,
    getUserInput,
    main,
  };
}

// =============================================================================
// Auto-execution
// =============================================================================

// If running this file directly, start chat
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

// If running in vm2 environment, can also call main() directly
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Node.js or vm2 environment
  main().catch(console.error);
}
