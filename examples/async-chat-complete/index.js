#!/usr/bin/env node

/**
 * ZeroGraph Async Chat Example - Complete Single File Version
 *
 * This example demonstrates an asynchronous chat application using ZeroGraph framework.
 * It's designed to work in vm2 environments with all dependencies contained in this single file.
 *
 * Features:
 * - Async chat flow with OpenAI integration
 * - Single file implementation for vm2 compatibility
 * - Built-in retry logic and error handling
 * - Clean conversation loop with exit capability
 */

// =============================================================================
// ZeroGraph Core Framework (JavaScript Implementation)
// =============================================================================

class BaseNode {
  constructor() {
    this.params = {};
    this.successors = {};
  }

  setParams(params) {
    this.params = params;
  }

  next(node, action = 'default') {
    if (action in this.successors) {
      console.warn(`Overwriting successor for action '${action}'`);
    }
    this.successors[action] = node;
    return node;
  }

  prep(shared) {
    return undefined;
  }

  exec(prepRes) {
    return undefined;
  }

  post(shared, prepRes, execRes) {
    return 'default';
  }

  _exec(prepRes) {
    return this.exec(prepRes);
  }

  _run(shared) {
    const p = this.prep(shared);
    const e = this._exec(p);
    return this.post(shared, p, e);
  }

  run(shared) {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Node won't run successors. Use Flow.");
    }
    return this._run(shared);
  }
}

class Node extends BaseNode {
  constructor(maxRetries = 1, wait = 0) {
    super();
    this.maxRetries = maxRetries;
    this.wait = wait;
    this.curRetry = 0;
  }

  execFallback(prepRes, exc) {
    throw exc;
  }

  _exec(prepRes) {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return this.exec(prepRes);
      } catch (e) {
        if (i === this.maxRetries - 1) {
          return this.execFallback(prepRes, e);
        }
        if (this.wait > 0) {
          // Synchronous wait - not ideal but needed for sync version
          const start = Date.now();
          while (Date.now() - start < this.wait * 1000) {}
        }
      }
    }
  }
}

class AsyncNode extends Node {
  async prepAsync(shared) {
    return undefined;
  }

  async execAsync(prepRes) {
    return undefined;
  }

  async execFallbackAsync(prepRes, exc) {
    throw exc;
  }

  async postAsync(shared, prepRes, execRes) {
    return 'default';
  }

  async _exec(prepRes) {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.execAsync(prepRes);
      } catch (e) {
        if (i === this.maxRetries - 1) {
          return await this.execFallbackAsync(prepRes, e);
        }
        if (this.wait > 0) {
          await new Promise(resolve => setTimeout(resolve, this.wait * 1000));
        }
      }
    }
  }

  async runAsync(shared) {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Node won't run successors. Use AsyncFlow.");
    }
    return await this._runAsync(shared);
  }

  async _runAsync(shared) {
    const p = await this.prepAsync(shared);
    const e = await this._exec(p);
    return await this.postAsync(shared, p, e);
  }

  _run(shared) {
    throw new Error('Use runAsync.');
  }
}

class Flow extends BaseNode {
  constructor(start = null) {
    super();
    this.startNode = start;
  }

  start(start) {
    this.startNode = start;
    return start;
  }

  getNextNode(curr, action) {
    const next = curr.successors[action || 'default'];
    if (!next && Object.keys(curr.successors).length > 0) {
      console.warn(
        `Flow ends: '${action}' not found in [${Object.keys(curr.successors).join(', ')}]`
      );
    }
    return next || null;
  }

  _orch(shared, params) {
    let curr = this.startNode
      ? Object.assign(
          Object.create(Object.getPrototypeOf(this.startNode)),
          this.startNode
        )
      : null;
    const p = params || { ...this.params };
    let lastAction = 'default';

    while (curr) {
      curr.setParams(p);
      lastAction = curr._run(shared);
      curr = this.getNextNode(curr, lastAction);
      if (curr) {
        curr = Object.assign(Object.create(Object.getPrototypeOf(curr)), curr);
      }
    }
    return lastAction;
  }

  _run(shared) {
    const p = this.prep(shared);
    const o = this._orch(shared);
    return this.post(shared, p, o);
  }

  post(shared, prepRes, execRes) {
    return execRes;
  }
}

class AsyncFlow extends Flow {
  async _orchAsync(shared, params) {
    let curr = this.startNode
      ? Object.assign(
          Object.create(Object.getPrototypeOf(this.startNode)),
          this.startNode
        )
      : null;
    const p = params || { ...this.params };
    let lastAction = 'default';

    while (curr) {
      curr.setParams(p);
      lastAction =
        curr instanceof AsyncNode
          ? await curr._runAsync(shared)
          : curr._run(shared);
      curr = this.getNextNode(curr, lastAction);
      if (curr) {
        curr = Object.assign(Object.create(Object.getPrototypeOf(curr)), curr);
      }
    }
    return lastAction;
  }

  async _runAsync(shared) {
    const p = await this.prepAsync(shared);
    const o = await this._orchAsync(shared);
    return await this.postAsync(shared, p, o);
  }

  async prepAsync(shared) {
    return undefined;
  }

  async postAsync(shared, prepRes, execRes) {
    return execRes;
  }

  async runAsync(shared) {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Flow won't run successors. Use parent AsyncFlow.");
    }
    return await this._runAsync(shared);
  }
}

// =============================================================================
// OpenAI Integration
// =============================================================================

/**
 * Simple OpenAI API client for vm2 compatibility
 * Uses fetch API instead of the official OpenAI library
 */
class SimpleOpenAI {
  constructor(config = {}) {
    this.apiKey =
      config.apiKey || process.env.OPENAI_API_KEY || 'your-api-key-here';
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-3.5-turbo';
  }

  async createChatCompletion(messages, options = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  }
}

/**
 * Simple async function to call LLM
 */
async function callLLM(prompt, config = {}) {
  try {
    const client = new SimpleOpenAI(config);
    const response = await client.createChatCompletion(
      [{ role: 'user', content: prompt }],
      config
    );

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('LLM call failed:', error.message);
    // Fallback to mock response in case of API issues
    return `Mock response to: ${prompt.substring(0, 50)}...`;
  }
}

/**
 * Simple async function to get user input
 * Note: In vm2 environment, this might need to be replaced with alternative input method
 */
async function getUserInput(prompt) {
  // For Node.js environments with readline
  if (typeof process !== 'undefined' && process.stdin) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question(prompt, answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
  } else {
    // Fallback for other environments
    console.log(prompt);
    return 'Hello from vm2 environment';
  }
}

// =============================================================================
// Chat Application Nodes
// =============================================================================

/**
 * Node that gets user input for the chat
 */
class GetUserInputNode extends AsyncNode {
  async execAsync(prepRes) {
    const userInput = await getUserInput('\n💬 You: ');
    return userInput;
  }

  async postAsync(shared, prepRes, execRes) {
    if (execRes.toLowerCase() === 'exit' || execRes.toLowerCase() === 'quit') {
      shared.shouldExit = true;
      shared.userMessage = execRes;
      return 'exit';
    }

    shared.userMessage = execRes;
    shared.shouldExit = false;
    return 'process';
  }
}

/**
 * Node that processes user message with LLM
 */
class ChatResponseNode extends AsyncNode {
  async prepAsync(shared) {
    // Build conversation context
    const conversationHistory = shared.conversationHistory || [];
    const userMessage = shared.userMessage || '';

    return {
      history: conversationHistory,
      message: userMessage,
    };
  }

  async execAsync(input) {
    const { history, message } = input;

    // Build prompt with conversation history
    let prompt =
      'You are a helpful AI assistant. Have a natural conversation with the user.\n\n';

    if (history.length > 0) {
      prompt += 'Previous conversation:\n';
      history.forEach((entry, index) => {
        prompt += `User: ${entry.user}\n`;
        prompt += `Assistant: ${entry.assistant}\n`;
      });
      prompt += '\n';
    }

    prompt += `User: ${message}\n`;
    prompt += 'Assistant:';

    // Call LLM with conversation context
    const response = await callLLM(prompt, {
      maxTokens: 200,
      temperature: 0.8,
    });

    return response;
  }

  async postAsync(shared, prepRes, execRes) {
    // Store the conversation
    const conversationHistory = shared.conversationHistory || [];
    conversationHistory.push({
      user: prepRes.message,
      assistant: execRes,
    });

    // Keep only last 5 exchanges to manage context length
    if (conversationHistory.length > 5) {
      conversationHistory.shift();
    }

    shared.conversationHistory = conversationHistory;
    shared.assistantResponse = execRes;

    // Display the response
    console.log(`\n🤖 Assistant: ${execRes}`);

    return 'continue';
  }
}

/**
 * Node that handles conversation continuation
 */
class ContinueConversationNode extends AsyncNode {
  async execAsync(prepRes) {
    // Just pass through
    return 'continue';
  }

  async postAsync(shared, prepRes, execRes) {
    if (shared.shouldExit) {
      return 'exit';
    }
    return 'input';
  }
}

/**
 * Node that handles exit
 */
class ExitNode extends AsyncNode {
  async execAsync(prepRes) {
    console.log('\n👋 Thanks for chatting! Goodbye!');
    return 'exit';
  }

  async postAsync(shared, prepRes, execRes) {
    return 'default';
  }
}

// =============================================================================
// Chat Flow Creation
// =============================================================================

/**
 * Creates the async chat flow
 */
function createAsyncChatFlow() {
  // Create nodes
  const getUserInput = new GetUserInputNode();
  const chatResponse = new ChatResponseNode();
  const continueConversation = new ContinueConversationNode();
  const exitNode = new ExitNode();

  // Connect the flow
  getUserInput.next(chatResponse, 'process');
  getUserInput.next(exitNode, 'exit');

  chatResponse.next(continueConversation, 'continue');

  continueConversation.next(getUserInput, 'input');
  continueConversation.next(exitNode, 'exit');

  // Create and return the async flow
  return new AsyncFlow(getUserInput);
}

// =============================================================================
// Main Application
// =============================================================================

/**
 * Main function to run the async chat application
 */
async function main() {
  console.log('🚀 Welcome to ZeroGraph Async Chat!');
  console.log(
    'This is a complete single-file JavaScript implementation designed for vm2 environments.'
  );
  console.log('Type "exit" or "quit" to end the conversation.\n');

  // Initialize shared state
  const shared = {
    userMessage: '',
    assistantResponse: '',
    conversationHistory: [],
    shouldExit: false,
  };

  try {
    // Create and run the chat flow
    const chatFlow = createAsyncChatFlow();

    console.log('💡 Starting chat session...');
    await chatFlow.runAsync(shared);

    console.log('\n✅ Chat session completed.');
  } catch (error) {
    console.error('\n❌ Error during chat session:', error.message);
    console.log(
      'This might be due to API configuration or vm2 environment limitations.'
    );
  }
}

// =============================================================================
// Export for Module Usage
// =============================================================================

// Export classes and functions for use as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Core framework
    BaseNode,
    Node,
    AsyncNode,
    Flow,
    AsyncFlow,

    // OpenAI integration
    SimpleOpenAI,
    callLLM,
    getUserInput,

    // Chat nodes
    GetUserInputNode,
    ChatResponseNode,
    ContinueConversationNode,
    ExitNode,

    // Flow creation
    createAsyncChatFlow,

    // Main function
    main,
  };
}

// =============================================================================
// Auto-run if executed directly
// =============================================================================

if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}
