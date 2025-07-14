import { Node, AsyncNode, AsyncFlow, Flow, SharedStore } from '../../src/index';

// =============================================================================
// External API Functions (to be injected into vm2 environment)
// =============================================================================

// NOTE: These functions should be implemented externally and injected into vm2
// They represent the external API capabilities needed by the agent

/**
 * Validates if a URL is properly formatted and accessible
 * @param url - The URL to validate
 * @returns true if URL is valid, false otherwise
 */
function validateURL(url: string): boolean {
  // Mock implementation - replace with actual URL validation
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

/**
 * Fetches content from a URL and extracts article text
 * @param url - The URL to fetch content from
 * @returns extracted article content or null if failed
 */
async function fetchArticleContent(url: string): Promise<string | null> {
  // Mock implementation - replace with actual web scraping
  // In real implementation, use libraries like puppeteer, cheerio, or readability
  console.log(`[External API] Fetching content from: ${url}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock article content
  return `This is mock article content extracted from ${url}. 
  The article discusses important topics about technology and innovation.
  It covers key points about artificial intelligence, machine learning, 
  and the future of software development.`;
}

/**
 * Calls LLM to process text and generate responses
 * @param prompt - The prompt to send to LLM
 * @returns LLM response
 */
async function callLLM(prompt: string): Promise<string> {
  // Mock implementation - replace with actual LLM API call
  console.log(
    `[External API] Calling LLM with prompt length: ${prompt.length}`
  );

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock LLM response based on prompt content
  if (prompt.includes('extract key points')) {
    return `Key Points:
1. Artificial intelligence is transforming software development
2. Machine learning enables more intelligent applications
3. Automation reduces manual development tasks
4. Future trends point toward AI-assisted coding`;
  }

  if (prompt.includes('Twitter')) {
    return `🚀 Exciting developments in AI and software development! The future of coding is here with intelligent automation and ML-powered tools. #AI #TechTrends #Innovation`;
  }

  if (prompt.includes('Medium')) {
    return `# The Future of Software Development: AI and Automation

The landscape of software development is rapidly evolving with artificial intelligence and machine learning at the forefront. This transformation is not just about tools, but about fundamentally changing how we approach problem-solving in technology.

## Key Insights
- AI-assisted coding is becoming mainstream
- Automation reduces repetitive tasks
- Machine learning enables smarter applications

The future belongs to developers who embrace these technologies while maintaining their creative problem-solving skills.`;
  }

  if (prompt.includes('Reddit')) {
    return `**TIL: AI is revolutionizing software development**

Just read an interesting article about how AI and ML are changing the way we write code. Some key takeaways:

* AI-assisted coding tools are getting really good
* Automation is handling more routine tasks
* ML is making applications smarter

What are your thoughts on AI in development? Are you using any AI coding tools?

Edit: Thanks for the gold, kind stranger!`;
  }

  return `Mock LLM response to: ${prompt.substring(0, 100)}...`;
}

/**
 * Publishes content to a specific social media platform
 * @param platform - The platform to publish to (twitter, medium, reddit)
 * @param content - The content to publish
 * @returns true if successful, false otherwise
 */
async function publishToSocialMedia(
  platform: string,
  content: string
): Promise<boolean> {
  // Mock implementation - replace with actual social media API calls
  console.log(`[External API] Publishing to ${platform}:`);
  console.log(`Content: ${content.substring(0, 100)}...`);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock success/failure (90% success rate)
  return Math.random() > 0.1;
}

// =============================================================================
// Agent Nodes Implementation
// =============================================================================

/**
 * Validates the input URL format and accessibility
 */
class URLValidationNode extends Node {
  prep(shared: SharedStore): string {
    return shared.articleURL || '';
  }

  exec(url: string): { valid: boolean; error?: string } {
    console.log(`🔍 Validating URL: ${url}`);

    if (!url) {
      return { valid: false, error: 'No URL provided' };
    }

    if (!validateURL(url)) {
      return { valid: false, error: 'Invalid URL format' };
    }

    return { valid: true };
  }

  post(
    shared: SharedStore,
    prepRes: string,
    execRes: { valid: boolean; error?: string }
  ): string {
    if (!execRes.valid) {
      shared.error = execRes.error;
      console.log(`❌ URL validation failed: ${execRes.error}`);
      return 'error';
    }

    console.log(`✅ URL validation passed`);
    return 'valid';
  }
}

/**
 * Fetches and extracts content from the article URL
 */
class ContentExtractionNode extends AsyncNode {
  prepAsync(shared: SharedStore): Promise<string> {
    return Promise.resolve(shared.articleURL);
  }

  async execAsync(url: string): Promise<string | null> {
    console.log(`📄 Extracting content from article...`);
    return await fetchArticleContent(url);
  }

  postAsync(
    shared: SharedStore,
    prepRes: string,
    execRes: string | null
  ): Promise<string> {
    if (!execRes) {
      shared.error = 'Failed to extract article content';
      console.log(`❌ Content extraction failed`);
      return Promise.resolve('error');
    }

    shared.articleContent = execRes;
    console.log(
      `✅ Content extracted successfully (${execRes.length} characters)`
    );
    return Promise.resolve('success');
  }
}

/**
 * Extracts key points from the article content
 */
class KeyPointsExtractionNode extends AsyncNode {
  prepAsync(shared: SharedStore): Promise<string> {
    return Promise.resolve(shared.articleContent || '');
  }

  async execAsync(content: string): Promise<string> {
    const prompt = `Please extract key points from the following article content:

${content}

Extract the main ideas and important points that would be suitable for social media posts. Focus on the most engaging and shareable insights.`;

    return await callLLM(prompt);
  }

  postAsync(
    shared: SharedStore,
    prepRes: string,
    execRes: string
  ): Promise<string> {
    if (!execRes || execRes.length < 50) {
      shared.error = 'Insufficient key points extracted';
      console.log(`❌ Key points extraction insufficient`);
      return Promise.resolve('insufficient');
    }

    shared.keyPoints = execRes;
    console.log(`✅ Key points extracted successfully`);
    return Promise.resolve('sufficient');
  }
}

/**
 * Generates social media posts for different platforms
 */
class SocialPostsGenerationNode extends AsyncNode {
  prepAsync(
    shared: SharedStore
  ): Promise<{ keyPoints: string; articleURL: string }> {
    return Promise.resolve({
      keyPoints: shared.keyPoints || '',
      articleURL: shared.articleURL || '',
    });
  }

  async execAsync(input: {
    keyPoints: string;
    articleURL: string;
  }): Promise<Record<string, string>> {
    console.log(`📝 Generating social media posts...`);

    const posts: Record<string, string> = {};

    // Generate Twitter post
    const twitterPrompt = `Create a Twitter post based on these key points:
${input.keyPoints}

Requirements:
- Under 280 characters
- Include relevant hashtags
- Engaging and shareable
- Include link reference: ${input.articleURL}`;

    posts.twitter = await callLLM(twitterPrompt);

    // Generate Medium post
    const mediumPrompt = `Create a Medium article based on these key points:
${input.keyPoints}

Requirements:
- Professional tone
- Well-structured with headers
- Engaging introduction
- Include source reference: ${input.articleURL}`;

    posts.medium = await callLLM(mediumPrompt);

    // Generate Reddit post
    const redditPrompt = `Create a Reddit post based on these key points:
${input.keyPoints}

Requirements:
- Casual, conversational tone
- Engaging title
- Include discussion points
- Reference source: ${input.articleURL}`;

    posts.reddit = await callLLM(redditPrompt);

    return posts;
  }

  postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: Record<string, string>
  ): Promise<string> {
    shared.socialPosts = execRes;
    console.log(
      `✅ Generated posts for ${Object.keys(execRes).length} platforms`
    );
    return Promise.resolve('generated');
  }
}

/**
 * Checks if generated posts meet quality standards
 */
class QualityCheckNode extends Node {
  prep(shared: SharedStore): Record<string, string> {
    return shared.socialPosts || {};
  }

  exec(posts: Record<string, string>): { passed: boolean; issues: string[] } {
    console.log(`🔍 Checking post quality...`);

    const issues: string[] = [];

    // Check Twitter post
    if (posts.twitter) {
      if (posts.twitter.length > 280) {
        issues.push('Twitter post exceeds 280 characters');
      }
      if (!posts.twitter.includes('#')) {
        issues.push('Twitter post missing hashtags');
      }
    }

    // Check Medium post
    if (posts.medium) {
      if (posts.medium.length < 200) {
        issues.push('Medium post too short');
      }
      if (!posts.medium.includes('#')) {
        issues.push('Medium post missing headers');
      }
    }

    // Check Reddit post
    if (posts.reddit) {
      if (posts.reddit.length < 100) {
        issues.push('Reddit post too short');
      }
    }

    // General checks
    for (const [platform, content] of Object.entries(posts)) {
      if (!content || content.trim().length === 0) {
        issues.push(`${platform} post is empty`);
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  post(
    shared: SharedStore,
    prepRes: any,
    execRes: { passed: boolean; issues: string[] }
  ): string {
    if (!execRes.passed) {
      shared.qualityIssues = execRes.issues;
      console.log(`❌ Quality check failed: ${execRes.issues.join(', ')}`);
      return 'revision_needed';
    }

    console.log(`✅ Quality check passed`);
    return 'approved';
  }
}

/**
 * Handles content revision when quality check fails
 */
class ContentRevisionNode extends AsyncNode {
  prepAsync(shared: SharedStore): Promise<{
    posts: Record<string, string>;
    issues: string[];
  }> {
    return Promise.resolve({
      posts: shared.socialPosts || {},
      issues: shared.qualityIssues || [],
    });
  }

  async execAsync(input: {
    posts: Record<string, string>;
    issues: string[];
  }): Promise<Record<string, string>> {
    console.log(`🔄 Revising content based on quality issues...`);

    const revisedPosts: Record<string, string> = {};

    for (const [platform, content] of Object.entries(input.posts)) {
      const revisionPrompt = `Please revise this ${platform} post to address these issues:
Issues: ${input.issues.join(', ')}

Original post:
${content}

Please provide a revised version that addresses all the issues.`;

      revisedPosts[platform] = await callLLM(revisionPrompt);
    }

    return revisedPosts;
  }

  postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: Record<string, string>
  ): Promise<string> {
    shared.socialPosts = execRes;
    console.log(`✅ Content revised`);
    return Promise.resolve('revised');
  }
}

/**
 * Final approval check before publishing
 */
class ApprovalNode extends Node {
  prep(shared: SharedStore): Record<string, string> {
    return shared.socialPosts || {};
  }

  exec(posts: Record<string, string>): boolean {
    console.log(`👀 Final approval check...`);

    // In a real implementation, this might involve human review
    // For now, we'll simulate automatic approval
    const hasContent = Object.values(posts).every(
      post => post && post.trim().length > 0
    );

    return hasContent;
  }

  post(shared: SharedStore, prepRes: any, execRes: boolean): string {
    if (!execRes) {
      shared.error = 'Final approval failed';
      console.log(`❌ Final approval failed`);
      return 'rejected';
    }

    console.log(`✅ Final approval granted`);
    return 'approved';
  }
}

/**
 * Publishes posts to social media platforms
 */
class PublishingNode extends AsyncNode {
  prepAsync(shared: SharedStore): Promise<Record<string, string>> {
    return Promise.resolve(shared.socialPosts || {});
  }

  async execAsync(
    posts: Record<string, string>
  ): Promise<{ success: string[]; failed: string[] }> {
    console.log(`🚀 Publishing posts to social media...`);

    const success: string[] = [];
    const failed: string[] = [];

    for (const [platform, content] of Object.entries(posts)) {
      try {
        const result = await publishToSocialMedia(platform, content);
        if (result) {
          success.push(platform);
          console.log(`✅ Published to ${platform} successfully`);
        } else {
          failed.push(platform);
          console.log(`❌ Failed to publish to ${platform}`);
        }
      } catch (error) {
        failed.push(platform);
        console.log(`❌ Error publishing to ${platform}: ${error}`);
      }
    }

    return { success, failed };
  }

  postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: { success: string[]; failed: string[] }
  ): Promise<string> {
    shared.publishResults = execRes;

    if (execRes.failed.length > 0) {
      console.log(`⚠️  Some publications failed: ${execRes.failed.join(', ')}`);
      return Promise.resolve('partial_failure');
    }

    console.log(`🎉 All posts published successfully!`);
    return Promise.resolve('success');
  }
}

/**
 * Handles retry logic for failed publications
 */
class RetryPublishingNode extends AsyncNode {
  prepAsync(shared: SharedStore): Promise<{
    posts: Record<string, string>;
    failed: string[];
  }> {
    const publishResults = shared.publishResults || { failed: [] };
    return Promise.resolve({
      posts: shared.socialPosts || {},
      failed: publishResults.failed,
    });
  }

  async execAsync(input: {
    posts: Record<string, string>;
    failed: string[];
  }): Promise<{ success: string[]; failed: string[] }> {
    console.log(`🔄 Retrying failed publications...`);

    const success: string[] = [];
    const failed: string[] = [];

    for (const platform of input.failed) {
      if (input.posts[platform]) {
        try {
          const result = await publishToSocialMedia(
            platform,
            input.posts[platform]
          );
          if (result) {
            success.push(platform);
            console.log(`✅ Retry successful for ${platform}`);
          } else {
            failed.push(platform);
            console.log(`❌ Retry failed for ${platform}`);
          }
        } catch (error) {
          failed.push(platform);
          console.log(`❌ Retry error for ${platform}: ${error}`);
        }
      }
    }

    return { success, failed };
  }

  postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: { success: string[]; failed: string[] }
  ): Promise<string> {
    // Update the overall results
    const originalResults = shared.publishResults || {
      success: [],
      failed: [],
    };
    shared.publishResults = {
      success: [...originalResults.success, ...execRes.success],
      failed: execRes.failed,
    };

    if (execRes.failed.length > 0) {
      console.log(`❌ Final failures: ${execRes.failed.join(', ')}`);
      return Promise.resolve('final_failure');
    }

    console.log(`🎉 All retries successful!`);
    return Promise.resolve('success');
  }
}

/**
 * Error handling node for various failure scenarios
 */
class ErrorHandlingNode extends Node {
  prep(shared: SharedStore): string {
    return shared.error || 'Unknown error';
  }

  exec(error: string): void {
    console.log(`💥 Error encountered: ${error}`);
  }

  post(shared: SharedStore, prepRes: string, execRes: void): string {
    shared.finalStatus = 'error';
    return 'error';
  }
}

// =============================================================================
// Flow Creation
// =============================================================================

/**
 * Creates the main social media agent flow
 */
function createSocialMediaAgentFlow(): AsyncFlow {
  // Create all nodes
  const urlValidation = new URLValidationNode();
  const contentExtraction = new ContentExtractionNode();
  const keyPointsExtraction = new KeyPointsExtractionNode();
  const socialPostsGeneration = new SocialPostsGenerationNode();
  const qualityCheck = new QualityCheckNode();
  const contentRevision = new ContentRevisionNode();
  const approval = new ApprovalNode();
  const publishing = new PublishingNode();
  const retryPublishing = new RetryPublishingNode();
  const errorHandling = new ErrorHandlingNode();

  // Connect nodes according to the workflow diagram

  // URL validation flow
  urlValidation.next(contentExtraction, 'valid');
  urlValidation.next(errorHandling, 'error');

  // Content extraction flow
  contentExtraction.next(keyPointsExtraction, 'success');
  contentExtraction.next(errorHandling, 'error');

  // Key points extraction flow
  keyPointsExtraction.next(socialPostsGeneration, 'sufficient');
  keyPointsExtraction.next(errorHandling, 'insufficient');

  // Social posts generation flow
  socialPostsGeneration.next(qualityCheck, 'generated');

  // Quality check flow with revision loop
  qualityCheck.next(approval, 'approved');
  qualityCheck.next(contentRevision, 'revision_needed');
  contentRevision.next(qualityCheck, 'revised'); // Loop back for re-check

  // Approval flow
  approval.next(publishing, 'approved');
  approval.next(contentRevision, 'rejected'); // Loop back for revision

  // Publishing flow with retry mechanism
  publishing.next(retryPublishing, 'partial_failure');
  // publishing 'success' action leads to flow termination

  // Retry publishing flow
  retryPublishing.next(errorHandling, 'final_failure');
  // retryPublishing 'success' action leads to flow termination

  // Start the flow with URL validation
  return new AsyncFlow(urlValidation);
}

// =============================================================================
// Example Usage
// =============================================================================

/**
 * Example usage of the social media agent
 */
async function main() {
  console.log('🚀 Starting Social Media Agent');
  console.log('=====================================');

  // Initialize shared store with article URL
  const shared: SharedStore = {
    articleURL: 'https://example.com/article-about-ai-development',
    articleContent: null,
    keyPoints: null,
    socialPosts: null,
    publishResults: null,
    error: null,
    finalStatus: null,
  };

  console.log(`📰 Processing article: ${shared.articleURL}`);
  console.log();

  // Create and run the agent flow
  const agentFlow = createSocialMediaAgentFlow();

  try {
    const finalAction = await agentFlow.runAsync(shared);

    console.log();
    console.log('=====================================');
    console.log('🏁 Agent Execution Complete');
    console.log(`Final action: ${finalAction}`);

    // Display results
    if (shared.error) {
      console.log(`❌ Error: ${shared.error}`);
    } else if (shared.publishResults) {
      console.log(
        `✅ Successfully published to: ${shared.publishResults.success.join(', ')}`
      );
      if (shared.publishResults.failed.length > 0) {
        console.log(
          `❌ Failed to publish to: ${shared.publishResults.failed.join(', ')}`
        );
      }
    }

    // Show generated content
    if (shared.socialPosts) {
      console.log('\n📝 Generated Social Media Posts:');
      console.log('-----------------------------------');
      for (const [platform, content] of Object.entries(shared.socialPosts)) {
        console.log(`\n${platform.toUpperCase()}:`);
        console.log(content);
      }
    }
  } catch (error) {
    console.error('💥 Agent execution failed:', error);
  }
}

// Export for use in other modules
export {
  URLValidationNode,
  ContentExtractionNode,
  KeyPointsExtractionNode,
  SocialPostsGenerationNode,
  QualityCheckNode,
  ContentRevisionNode,
  ApprovalNode,
  PublishingNode,
  RetryPublishingNode,
  ErrorHandlingNode,
  createSocialMediaAgentFlow,
  main,
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
