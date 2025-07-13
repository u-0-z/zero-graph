import { BatchNode, Flow, SharedStore } from '../../src/index';

// Mock translation function
function translateText(text: string, language: string): string {
  return `[${language}] ${text}`;
}

class TranslateTextNode extends BatchNode {
  prep(shared: SharedStore): Array<{ text: string; language: string }> {
    const text = shared.text || '(No text provided)';
    const languages = shared.languages || [
      'Chinese',
      'Spanish',
      'Japanese',
      'German',
      'Russian',
      'Portuguese',
      'French',
      'Korean',
    ];

    // Create batches for each language translation
    return languages.map((lang: string) => ({ text, language: lang }));
  }

  exec(data: { text: string; language: string }): {
    language: string;
    translation: string;
  } {
    const { text, language } = data;

    console.log(`Translating to ${language}...`);
    const translation = translateText(text, language);

    return { language, translation };
  }

  post(
    shared: SharedStore,
    prepRes: any,
    execRes: Array<{ language: string; translation: string }>
  ): string {
    // Store translations in shared store
    shared.translations = {};

    for (const result of execRes) {
      shared.translations[result.language] = result.translation;
      console.log(`✓ ${result.language} translation completed`);
    }

    console.log(`\nAll ${execRes.length} translations completed!`);
    return 'default';
  }
}

// Example usage
function main() {
  const shared: SharedStore = {
    text: 'ZeroGraph is a 100-line minimalist LLM framework',
    languages: ['Chinese', 'Spanish', 'Japanese', 'French'],
    translations: {},
  };

  console.log('=== Starting Batch Translation ===');
  console.log(`Original text: ${shared.text}`);
  console.log(`Target languages: ${shared.languages.join(', ')}`);
  console.log();

  const translateNode = new TranslateTextNode(3, 0); // max 3 retries, no wait
  const flow = new Flow(translateNode);

  const startTime = Date.now();
  flow.run(shared);
  const endTime = Date.now();

  console.log();
  console.log('=== Translation Results ===');
  for (const [lang, translation] of Object.entries(shared.translations)) {
    console.log(`${lang}: ${translation}`);
  }

  console.log();
  console.log(`Total time: ${endTime - startTime}ms`);
}

if (require.main === module) {
  main();
}

export { TranslateTextNode, main };
