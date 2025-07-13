import { AsyncNode, AsyncFlow, SharedStore } from '../../src/index';

// Mock async functions
async function fetchRecipes(ingredient: string): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    `${ingredient} stir fry`,
    `Grilled ${ingredient}`,
    `${ingredient} soup`,
    `${ingredient} curry`
  ];
}

async function callLLMAsync(prompt: string): Promise<string> {
  // Simulate LLM API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (prompt.includes('Choose best recipe')) {
    const recipes = prompt.match(/recipes: \[(.*?)\]/)?.[1] || '';
    const recipeList = recipes.split(',').map(r => r.trim().replace(/"/g, ''));
    return recipeList[Math.floor(Math.random() * recipeList.length)] || 'Unknown recipe';
  }
  
  return `Mock LLM response to: ${prompt}`;
}

async function getUserInput(prompt: string): Promise<string> {
  // In a real app, this would get actual user input
  // For demo purposes, we'll simulate user responses
  console.log(prompt);
  
  // Simulate user thinking time
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Random user response for demo
  return Math.random() > 0.3 ? 'y' : 'n';
}

class FetchRecipesNode extends AsyncNode {
  async prepAsync(shared: SharedStore): Promise<string> {
    // In a real app, you'd get user input here
    const ingredient = shared.ingredient || 'chicken';
    console.log(`\nFetching recipes for: ${ingredient}`);
    return ingredient;
  }

  async execAsync(ingredient: string): Promise<string[]> {
    const recipes = await fetchRecipes(ingredient);
    console.log(`Found ${recipes.length} recipes`);
    return recipes;
  }

  async postAsync(shared: SharedStore, prepRes: string, execRes: string[]): Promise<string> {
    shared.recipes = execRes;
    shared.currentRecipeIndex = 0;
    return 'suggest';
  }
}

class SuggestRecipeNode extends AsyncNode {
  async prepAsync(shared: SharedStore): Promise<string[]> {
    return shared.recipes || [];
  }

  async execAsync(recipes: string[]): Promise<string> {
    if (recipes.length === 0) {
      return 'No recipes available';
    }
    
    const prompt = `Choose best recipe from: [${recipes.map(r => `"${r}"`).join(', ')}]`;
    const suggestion = await callLLMAsync(prompt);
    console.log(`\nSuggesting: ${suggestion}`);
    return suggestion;
  }

  async postAsync(shared: SharedStore, prepRes: string[], execRes: string): Promise<string> {
    shared.currentSuggestion = execRes;
    return 'approve';
  }
}

class GetApprovalNode extends AsyncNode {
  async prepAsync(shared: SharedStore): Promise<string> {
    return shared.currentSuggestion || 'No suggestion';
  }

  async execAsync(suggestion: string): Promise<string> {
    const response = await getUserInput(`Accept "${suggestion}"? (y/n): `);
    return response;
  }

  async postAsync(shared: SharedStore, prepRes: string, execRes: string): Promise<string> {
    if (execRes.toLowerCase() === 'y') {
      shared.finalChoice = prepRes;
      console.log(`✓ Great choice! You selected: ${prepRes}`);
      return 'accept';
    } else {
      console.log(`✗ Let's try another recipe...`);
      // Remove the rejected recipe from the list
      const recipes = shared.recipes || [];
      const rejectedIndex = recipes.indexOf(prepRes);
      if (rejectedIndex > -1) {
        recipes.splice(rejectedIndex, 1);
        shared.recipes = recipes;
      }
      
      if (recipes.length === 0) {
        console.log('No more recipes available!');
        return 'accept';
      }
      
      return 'retry';
    }
  }
}

class NoOpNode extends AsyncNode {
  async execAsync(input: any): Promise<any> {
    return input;
  }
}

// Create the async flow
function createRecipeFlow(): AsyncFlow {
  const fetch = new FetchRecipesNode();
  const suggest = new SuggestRecipeNode();
  const approve = new GetApprovalNode();
  const end = new NoOpNode();

  // Connect nodes
  fetch.next(suggest, 'suggest');
  suggest.next(approve, 'approve');
  approve.next(suggest, 'retry');  // Loop back for another suggestion
  approve.next(end, 'accept');     // End the flow

  return new AsyncFlow(fetch);
}

// Example usage
async function main() {
  const shared: SharedStore = {
    ingredient: 'chicken',
    recipes: [],
    currentSuggestion: null,
    finalChoice: null
  };

  console.log("=== Starting Async Recipe Finder ===");
  console.log(`Looking for recipes with: ${shared.ingredient}`);

  const flow = createRecipeFlow();
  
  const startTime = Date.now();
  await flow.runAsync(shared);
  const endTime = Date.now();

  console.log("\n=== Final Result ===");
  console.log(`Final choice: ${shared.finalChoice || 'None selected'}`);
  console.log(`Total time: ${endTime - startTime}ms`);
}

// Handle both direct execution and module import
if (require.main === module) {
  main().catch(console.error);
}

export { FetchRecipesNode, SuggestRecipeNode, GetApprovalNode, createRecipeFlow, main }; 