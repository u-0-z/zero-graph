import { AsyncNode, SharedStore } from '@u0z/zero-graph';
import { WorkflowStateManager } from './state-persistence';

// External API function types (to be injected into vm2 environment)
declare global {
  var optimizePrompt: (prompt: string) => Promise<{
    optimizedPrompt: string;
    needsVoice: boolean;
    voiceText?: string;
  }>;

  var generateImage: (prompt: string) => Promise<string>; // returns image URL
  var generateTTS: (text: string) => Promise<string>; // returns audio URL
  var generateVideo: (imageUrl: string, audioUrl?: string) => Promise<string>; // returns video URL
}

// Base class for stateful workflow nodes
abstract class StatefulWorkflowNode extends AsyncNode {
  protected stateManager: WorkflowStateManager;
  protected stepName: string;

  constructor(stateManager: WorkflowStateManager, stepName: string) {
    super();
    this.stateManager = stateManager;
    this.stepName = stepName;
  }

  async postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: any
  ): Promise<string> {
    // Save state after each step
    await this.stateManager.updateState(this.stepName, shared);
    return await this.handlePostAsync(shared, prepRes, execRes);
  }

  // Abstract method for subclasses to implement
  protected abstract handlePostAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: any
  ): Promise<string>;
}

// 1. User Input Node - Get user prompt
export class UserInputNode extends StatefulWorkflowNode {
  constructor(stateManager: WorkflowStateManager) {
    super(stateManager, 'user_input');
  }

  async execAsync(): Promise<string> {
    // Check if step is already completed
    if (this.stateManager.isStepCompleted(this.stepName)) {
      console.log('⏭️  User input already completed, skipping...');
      return 'User input already provided';
    }

    console.log('💬 Please enter your prompt for video generation:');

    // NOTE: In vm2 environment, this should be provided externally
    // For demo purposes, we'll use a mock prompt
    const userPrompt =
      'Create a video about a peaceful sunset over mountains with calm narration';
    console.log(`📝 User prompt: ${userPrompt}`);

    return userPrompt;
  }

  protected async handlePostAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: string
  ): Promise<string> {
    shared.userPrompt = execRes;
    console.log(`✅ User input saved: ${execRes}`);
    return 'optimize';
  }
}

// 2. Prompt Optimization Node - Optimize prompt using LLM
export class PromptOptimizationNode extends StatefulWorkflowNode {
  constructor(stateManager: WorkflowStateManager) {
    super(stateManager, 'prompt_optimization');
  }

  async prepAsync(shared: SharedStore): Promise<string> {
    return shared.userPrompt;
  }

  async execAsync(userPrompt: string): Promise<{
    optimizedPrompt: string;
    needsVoice: boolean;
    voiceText?: string;
  }> {
    // Check if step is already completed
    if (this.stateManager.isStepCompleted(this.stepName)) {
      console.log('⏭️  Prompt optimization already completed, skipping...');
      return {
        optimizedPrompt: 'Optimized prompt already generated',
        needsVoice: true,
        voiceText: 'Voice text already generated',
      };
    }

    console.log('🔄 Optimizing prompt using LLM...');

    // NOTE: In vm2 environment, this function should be provided externally
    if (typeof optimizePrompt !== 'undefined') {
      return await optimizePrompt(userPrompt);
    }

    // Mock implementation for demo
    const mockResult = {
      optimizedPrompt: `Enhanced visual prompt: ${userPrompt} with cinematic lighting and professional composition`,
      needsVoice:
        userPrompt.toLowerCase().includes('narration') ||
        userPrompt.toLowerCase().includes('voice'),
      voiceText: userPrompt.toLowerCase().includes('narration')
        ? 'This is a peaceful sunset over majestic mountains, creating a serene and calming atmosphere.'
        : undefined,
    };

    console.log(`✨ Optimized prompt: ${mockResult.optimizedPrompt}`);
    console.log(`🎤 Needs voice: ${mockResult.needsVoice}`);
    if (mockResult.voiceText) {
      console.log(`📢 Voice text: ${mockResult.voiceText}`);
    }

    return mockResult;
  }

  protected async handlePostAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: any
  ): Promise<string> {
    shared.optimizedPrompt = execRes.optimizedPrompt;
    shared.needsVoice = execRes.needsVoice;
    shared.voiceText = execRes.voiceText;

    console.log(`✅ Prompt optimization completed`);
    return 'generate_image';
  }
}

// 3. Image Generation Node - Generate image using text-to-image model
export class ImageGenerationNode extends StatefulWorkflowNode {
  constructor(stateManager: WorkflowStateManager) {
    super(stateManager, 'image_generation');
  }

  async prepAsync(shared: SharedStore): Promise<string> {
    return shared.optimizedPrompt;
  }

  async execAsync(optimizedPrompt: string): Promise<string> {
    // Check if step is already completed
    if (this.stateManager.isStepCompleted(this.stepName)) {
      console.log('⏭️  Image generation already completed, skipping...');
      return 'https://example.com/generated-image.jpg';
    }

    console.log('🎨 Generating image using text-to-image model...');

    // NOTE: In vm2 environment, this function should be provided externally
    if (typeof generateImage !== 'undefined') {
      return await generateImage(optimizedPrompt);
    }

    // Mock implementation for demo
    const mockImageUrl = `https://example.com/generated-image-${Date.now()}.jpg`;
    console.log(`🖼️  Generated image URL: ${mockImageUrl}`);

    return mockImageUrl;
  }

  protected async handlePostAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: string
  ): Promise<string> {
    shared.imageUrl = execRes;
    console.log(`✅ Image generation completed: ${execRes}`);

    // Check if we need to generate voice
    if (shared.needsVoice && shared.voiceText) {
      return 'generate_tts';
    } else {
      return 'generate_video';
    }
  }
}

// 4. TTS Generation Node - Generate audio using text-to-speech
export class TTSGenerationNode extends StatefulWorkflowNode {
  constructor(stateManager: WorkflowStateManager) {
    super(stateManager, 'tts_generation');
  }

  async prepAsync(shared: SharedStore): Promise<string> {
    return shared.voiceText;
  }

  async execAsync(voiceText: string): Promise<string> {
    // Check if step is already completed
    if (this.stateManager.isStepCompleted(this.stepName)) {
      console.log('⏭️  TTS generation already completed, skipping...');
      return 'https://example.com/generated-audio.mp3';
    }

    console.log('🎵 Generating audio using TTS model...');

    // NOTE: In vm2 environment, this function should be provided externally
    if (typeof generateTTS !== 'undefined') {
      return await generateTTS(voiceText);
    }

    // Mock implementation for demo
    const mockAudioUrl = `https://example.com/generated-audio-${Date.now()}.mp3`;
    console.log(`🔊 Generated audio URL: ${mockAudioUrl}`);

    return mockAudioUrl;
  }

  protected async handlePostAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: string
  ): Promise<string> {
    shared.audioUrl = execRes;
    console.log(`✅ TTS generation completed: ${execRes}`);
    return 'generate_video';
  }
}

// 5. Video Generation Node - Generate final video using digital character model
export class VideoGenerationNode extends StatefulWorkflowNode {
  constructor(stateManager: WorkflowStateManager) {
    super(stateManager, 'video_generation');
  }

  async prepAsync(shared: SharedStore): Promise<{
    imageUrl: string;
    audioUrl?: string;
  }> {
    return {
      imageUrl: shared.imageUrl,
      audioUrl: shared.audioUrl,
    };
  }

  async execAsync(input: {
    imageUrl: string;
    audioUrl?: string;
  }): Promise<string> {
    // Check if step is already completed
    if (this.stateManager.isStepCompleted(this.stepName)) {
      console.log('⏭️  Video generation already completed, skipping...');
      return 'https://example.com/generated-video.mp4';
    }

    console.log('🎬 Generating video using digital character model...');
    console.log(`🖼️  Input image: ${input.imageUrl}`);
    if (input.audioUrl) {
      console.log(`🔊 Input audio: ${input.audioUrl}`);
    }

    // NOTE: In vm2 environment, this function should be provided externally
    if (typeof generateVideo !== 'undefined') {
      return await generateVideo(input.imageUrl, input.audioUrl);
    }

    // Mock implementation for demo
    const mockVideoUrl = `https://example.com/generated-video-${Date.now()}.mp4`;
    console.log(`🎥 Generated video URL: ${mockVideoUrl}`);

    return mockVideoUrl;
  }

  protected async handlePostAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: string
  ): Promise<string> {
    shared.videoUrl = execRes;
    console.log(`✅ Video generation completed: ${execRes}`);
    return 'complete';
  }
}

// 6. Results Summary Node - Display final results
export class ResultsSummaryNode extends StatefulWorkflowNode {
  constructor(stateManager: WorkflowStateManager) {
    super(stateManager, 'results_summary');
  }

  async execAsync(): Promise<void> {
    console.log('\n🎉 Video Generation Workflow Completed!');
    console.log('==========================================');
  }

  protected async handlePostAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: any
  ): Promise<string> {
    // Display all results
    console.log('\n📋 Final Results:');
    console.log('------------------');
    console.log(`📝 Original Prompt: ${shared.userPrompt}`);
    console.log(`✨ Optimized Prompt: ${shared.optimizedPrompt}`);
    console.log(`🖼️  Generated Image: ${shared.imageUrl}`);

    if (shared.audioUrl) {
      console.log(`🎵 Generated Audio: ${shared.audioUrl}`);
    }

    console.log(`🎬 Generated Video: ${shared.videoUrl}`);

    // Mark workflow as complete
    await this.stateManager.completeWorkflow();

    return 'finished';
  }
}
