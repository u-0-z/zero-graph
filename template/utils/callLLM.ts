import OpenAI from 'openai';

// Learn more about calling the LLM: https://the-pocket.github.io/PocketFlow/utility_function/llm.html
export async function callLLM(prompt: string): Promise<string> {
  const client = new OpenAI({
    baseURL: 'https://api.opensota.ai/openai/v1',
    apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
  });

  const response = await client.chat.completions.create({
    model: 'opensota/os-v1',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content || '';
}

// For synchronous usage (mock implementation)
export function callLLMSync(prompt: string): string {
  // This is a mock implementation for synchronous usage
  // In real usage, you should use the async version above
  return `Mock LLM response to: ${prompt}`;
}

// Example usage
if (require.main === module) {
  const prompt = 'What is the meaning of life?';
  callLLM(prompt).then(console.log).catch(console.error);
}
