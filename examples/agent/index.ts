import { Node, Flow, SharedStore } from '../../src/index';

// Mock functions (replace with actual implementations)
function callLLM(prompt: string): string {
  // Mock LLM response based on prompt content
  if (prompt.includes('decide')) {
    return Math.random() > 0.5 ? 'search' : 'answer';
  }
  return `Mock LLM response to: ${prompt}`;
}

function searchWeb(query: string): string[] {
  // Mock web search results
  return [
    `Search result 1 for: ${query}`,
    `Search result 2 for: ${query}`,
    `Search result 3 for: ${query}`
  ];
}

class DecideActionNode extends Node {
  prep(shared: SharedStore): string {
    const question = shared.question;
    const searchResults = shared.searchResults || [];
    return `Question: ${question}\nSearch results so far: ${searchResults.length} results`;
  }

  exec(context: string): string {
    const prompt = `Based on the following context, decide whether to "search" for more information or "answer" the question:
${context}

Respond with either "search" or "answer".`;
    
    const decision = callLLM(prompt);
    return decision.includes('search') ? 'search' : 'answer';
  }

  post(shared: SharedStore, prepRes: string, execRes: string): string {
    console.log(`Decision: ${execRes}`);
    return execRes;
  }
}

class SearchWebNode extends Node {
  prep(shared: SharedStore): string {
    return shared.question;
  }

  exec(question: string): string[] {
    console.log(`Searching web for: ${question}`);
    return searchWeb(question);
  }

  post(shared: SharedStore, prepRes: string, execRes: string[]): string {
    // Accumulate search results
    shared.searchResults = (shared.searchResults || []).concat(execRes);
    console.log(`Found ${execRes.length} new results`);
    return 'decide';
  }
}

class AnswerQuestionNode extends Node {
  prep(shared: SharedStore): { question: string; results: string[] } {
    return {
      question: shared.question,
      results: shared.searchResults || []
    };
  }

  exec(input: { question: string; results: string[] }): string {
    const prompt = `Based on the following search results, answer the question:

Question: ${input.question}

Search Results:
${input.results.join('\n')}

Answer:`;
    
    return callLLM(prompt);
  }

  post(shared: SharedStore, prepRes: any, execRes: string): string {
    shared.answer = execRes;
    console.log(`Final answer generated`);
    return 'default';
  }
}

// Create the agent flow
function createAgentFlow(): Flow {
  const decide = new DecideActionNode();
  const search = new SearchWebNode();
  const answer = new AnswerQuestionNode();

  // Connect the nodes
  decide.next(search, 'search');
  decide.next(answer, 'answer');
  search.next(decide, 'decide');

  return new Flow(decide);
}

// Example usage
function main() {
  const shared: SharedStore = {
    question: "What are the recent developments in quantum computing?",
    searchResults: [],
    answer: null
  };

  console.log("=== Starting Research Agent ===");
  console.log(`Question: ${shared.question}`);
  console.log();

  const agentFlow = createAgentFlow();
  agentFlow.run(shared);

  console.log();
  console.log("=== Final Result ===");
  console.log(`Answer: ${shared.answer}`);
}

if (require.main === module) {
  main();
}

export { DecideActionNode, SearchWebNode, AnswerQuestionNode, createAgentFlow, main }; 