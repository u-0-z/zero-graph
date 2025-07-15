#!/usr/bin/env node

/**
 * Stateful Video Generation Workflow - Main Application
 *
 * This example demonstrates a stateful video generation workflow that can:
 * 1. Accept user prompts for video generation
 * 2. Optimize prompts using LLM interfaces
 * 3. Determine if voice narration is needed
 * 4. Generate images using text-to-image models
 * 5. Generate audio using text-to-speech (if needed)
 * 6. Generate final videos using digital character models
 * 7. Persist state to external storage
 * 8. Resume from any step if interrupted or restarted
 *
 * Features:
 * - State persistence with external storage integration
 * - Resumable workflow execution
 * - Comprehensive error handling
 * - Progress tracking
 * - Mock implementations for demo purposes
 *
 * For vm2 environments, external API functions should be injected:
 * - saveState, loadState, clearState functions for persistence
 * - optimizePrompt, generateImage, generateTTS, generateVideo functions
 */

import { SharedStore } from '@u0z/zero-graph';
import { createStateManager, WorkflowState } from './state-persistence';
import { createStatefulVideoWorkflow } from './workflow-flow';

// =============================================================================
// External API Functions (to be injected into vm2 environment)
// =============================================================================

/**
 * External API function types for vm2 injection
 * These functions should be implemented externally and injected into the vm2 environment
 */
interface ExternalAPIs {
  // State persistence functions
  saveState?: (state: WorkflowState) => Promise<void>;
  loadState?: () => Promise<WorkflowState | null>;
  clearState?: () => Promise<void>;

  // AI model functions
  optimizePrompt?: (prompt: string) => Promise<{
    optimizedPrompt: string;
    needsVoice: boolean;
    voiceText?: string;
  }>;

  generateImage?: (prompt: string) => Promise<string>;
  generateTTS?: (text: string) => Promise<string>;
  generateVideo?: (imageUrl: string, audioUrl?: string) => Promise<string>;

  // User interaction functions
  getUserInput?: (prompt: string) => Promise<string>;
}

// =============================================================================
// Demo Functions (Mock implementations for testing)
// =============================================================================

async function mockSaveState(state: WorkflowState): Promise<void> {
  console.log(`[Mock State] Saving state to external storage`);
  console.log(`[Mock State] Current step: ${state.currentStep}`);
  console.log(
    `[Mock State] Completed steps: ${state.completedSteps.join(', ')}`
  );
  console.log(`[Mock State] Data keys: ${Object.keys(state.data).join(', ')}`);

  // In real implementation, this would save to database/file system
  // Example: await database.save('workflow_state', state);
}

async function mockLoadState(): Promise<WorkflowState | null> {
  console.log(`[Mock State] Loading state from external storage`);

  // For demo purposes, return null (no saved state)
  // In real implementation, this would load from database/file system
  // Example: return await database.load('workflow_state');
  return null;
}

async function mockClearState(): Promise<void> {
  console.log(`[Mock State] Clearing state from external storage`);

  // In real implementation, this would delete the saved state
  // Example: await database.delete('workflow_state');
}

async function mockOptimizePrompt(prompt: string): Promise<{
  optimizedPrompt: string;
  needsVoice: boolean;
  voiceText?: string;
}> {
  console.log(`[Mock LLM] Optimizing prompt: ${prompt}`);

  // Simulate LLM processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  const needsVoice =
    prompt.toLowerCase().includes('narration') ||
    prompt.toLowerCase().includes('voice') ||
    prompt.toLowerCase().includes('speak');

  return {
    optimizedPrompt: `Enhanced cinematic prompt: ${prompt} with professional lighting, 4K quality, and artistic composition`,
    needsVoice,
    voiceText: needsVoice
      ? `Professional narration for: ${prompt.replace(/create a video about/i, '').trim()}`
      : undefined,
  };
}

async function mockGenerateImage(prompt: string): Promise<string> {
  console.log(`[Mock Image API] Generating image for: ${prompt}`);

  // Simulate image generation time
  await new Promise(resolve => setTimeout(resolve, 2000));

  return `https://example.com/generated-images/image-${Date.now()}.jpg`;
}

async function mockGenerateTTS(text: string): Promise<string> {
  console.log(`[Mock TTS API] Generating audio for: ${text}`);

  // Simulate TTS processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  return `https://example.com/generated-audio/audio-${Date.now()}.mp3`;
}

async function mockGenerateVideo(
  imageUrl: string,
  audioUrl?: string
): Promise<string> {
  console.log(`[Mock Video API] Generating video with image: ${imageUrl}`);
  if (audioUrl) {
    console.log(`[Mock Video API] Including audio: ${audioUrl}`);
  }

  // Simulate video generation time
  await new Promise(resolve => setTimeout(resolve, 3000));

  return `https://example.com/generated-videos/video-${Date.now()}.mp4`;
}

async function mockGetUserInput(prompt: string): Promise<string> {
  console.log(prompt);

  // For demo purposes, return a mock user input
  // In real implementation, this would get actual user input
  return 'Create a video about a peaceful sunset over mountains with calm narration';
}

// =============================================================================
// Main Application
// =============================================================================

/**
 * Main application function
 */
async function main(): Promise<void> {
  console.log('🎬 Stateful Video Generation Workflow');
  console.log('=====================================');
  console.log(
    'This workflow demonstrates state persistence and resumable execution'
  );
  console.log(
    'Features: LLM optimization, image generation, TTS, video creation\n'
  );

  try {
    // Initialize external APIs (in vm2, these would be injected)
    const externalAPIs: ExternalAPIs = {
      saveState: mockSaveState,
      loadState: mockLoadState,
      clearState: mockClearState,
      optimizePrompt: mockOptimizePrompt,
      generateImage: mockGenerateImage,
      generateTTS: mockGenerateTTS,
      generateVideo: mockGenerateVideo,
      getUserInput: mockGetUserInput,
    };

    // Make external APIs available globally (for vm2 compatibility)
    (global as any).optimizePrompt = externalAPIs.optimizePrompt;
    (global as any).generateImage = externalAPIs.generateImage;
    (global as any).generateTTS = externalAPIs.generateTTS;
    (global as any).generateVideo = externalAPIs.generateVideo;

    // Create state manager with external persistence functions
    const stateManager = createStateManager(
      externalAPIs.saveState,
      externalAPIs.loadState,
      externalAPIs.clearState
    );

    // Create the stateful workflow
    const workflow = createStatefulVideoWorkflow(stateManager);

    // Initialize shared store
    const shared: SharedStore = {
      userPrompt: null,
      optimizedPrompt: null,
      needsVoice: false,
      voiceText: null,
      imageUrl: null,
      audioUrl: null,
      videoUrl: null,
    };

    // Run the workflow
    console.log('🚀 Starting workflow execution...\n');
    const result = await workflow.runWorkflow(shared);

    // Display final results
    console.log('\n🎉 Workflow completed successfully!');
    console.log('===================================');

    const progress = workflow.getWorkflowProgress();
    console.log(
      `📊 Progress: ${progress.progressPercentage}% (${progress.completedSteps.length}/${progress.totalSteps} steps)`
    );

    console.log('\n📋 Generated Content:');
    console.log('---------------------');
    console.log(`📝 Original Prompt: ${shared.userPrompt}`);
    console.log(`✨ Optimized Prompt: ${shared.optimizedPrompt}`);
    console.log(`🖼️  Image URL: ${shared.imageUrl}`);

    if (shared.audioUrl) {
      console.log(`🎵 Audio URL: ${shared.audioUrl}`);
    }

    console.log(`🎬 Video URL: ${shared.videoUrl}`);

    console.log(`\n🏁 Final workflow result: ${result}`);
  } catch (error) {
    console.error('\n❌ Workflow execution failed:', error);
    console.log('💡 This might be due to:');
    console.log('   - Missing external API functions');
    console.log('   - Network connectivity issues');
    console.log('   - State persistence errors');
    console.log('   - vm2 environment configuration');
  }
}

/**
 * Demo function to show workflow resumption
 */
async function demonstrateResumption(): Promise<void> {
  console.log('\n🔄 Demonstrating Workflow Resumption');
  console.log('====================================');
  console.log('This shows how the workflow can resume from a saved state\n');

  // Create a mock saved state
  const mockSavedState: WorkflowState = {
    currentStep: 'image_generation',
    completedSteps: ['user_input', 'prompt_optimization'],
    timestamp: Date.now(),
    data: {
      userPrompt:
        'Create a video about a peaceful sunset over mountains with calm narration',
      optimizedPrompt:
        'Enhanced cinematic prompt: Create a video about a peaceful sunset over mountains with calm narration with professional lighting, 4K quality, and artistic composition',
      needsVoice: true,
      voiceText:
        'Professional narration for: a peaceful sunset over mountains with calm narration',
    },
  };

  // Mock load function that returns saved state
  const mockLoadWithState = async (): Promise<WorkflowState | null> => {
    console.log('[Mock State] Loading saved state...');
    return mockSavedState;
  };

  // Create state manager with mock saved state
  const stateManager = createStateManager(
    mockSaveState,
    mockLoadWithState,
    mockClearState
  );

  // Set up global APIs
  (global as any).optimizePrompt = mockOptimizePrompt;
  (global as any).generateImage = mockGenerateImage;
  (global as any).generateTTS = mockGenerateTTS;
  (global as any).generateVideo = mockGenerateVideo;

  // Create workflow
  const workflow = createStatefulVideoWorkflow(stateManager);

  // Initialize shared store (will be populated from saved state)
  const shared: SharedStore = {};

  // Run workflow (should resume from image generation)
  console.log('🚀 Resuming workflow from saved state...\n');
  const result = await workflow.runWorkflow(shared);

  console.log('\n✅ Workflow resumption completed successfully!');
  console.log(`🏁 Final result: ${result}`);
}

/**
 * Entry point - run main demo or resumption demo
 */
if (require.main === module) {
  // Check command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--demo-resumption')) {
    demonstrateResumption().catch(console.error);
  } else {
    main().catch(console.error);
  }
}

// Export for use in other modules
export { main, demonstrateResumption };
export default main;
