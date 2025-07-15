import { AsyncFlow, SharedStore } from '@u0z/zero-graph';
import { WorkflowStateManager } from './state-persistence';
import {
  UserInputNode,
  PromptOptimizationNode,
  ImageGenerationNode,
  TTSGenerationNode,
  VideoGenerationNode,
  ResultsSummaryNode,
} from './workflow-nodes';

/**
 * Stateful Video Generation Workflow
 *
 * This workflow creates a video generation pipeline that can:
 * 1. Accept user input prompts
 * 2. Optimize prompts using LLM
 * 3. Determine if voice narration is needed
 * 4. Generate images using text-to-image models
 * 5. Generate audio using text-to-speech (if needed)
 * 6. Generate final video using digital character models
 * 7. Provide comprehensive results
 *
 * The workflow supports state persistence and can resume from any step
 * if interrupted or restarted.
 */
export class StatefulVideoWorkflow extends AsyncFlow {
  private stateManager: WorkflowStateManager;
  private userInputNode!: UserInputNode;
  private promptOptimizationNode!: PromptOptimizationNode;
  private imageGenerationNode!: ImageGenerationNode;
  private ttsGenerationNode!: TTSGenerationNode;
  private videoGenerationNode!: VideoGenerationNode;
  private resultsSummaryNode!: ResultsSummaryNode;

  constructor(stateManager: WorkflowStateManager) {
    // Initialize with null, we'll set the start node after creating all nodes
    super(null);
    this.stateManager = stateManager;
    this.initializeNodes();
    this.connectNodes();
  }

  private initializeNodes(): void {
    // Create all workflow nodes with state manager
    this.userInputNode = new UserInputNode(this.stateManager);
    this.promptOptimizationNode = new PromptOptimizationNode(this.stateManager);
    this.imageGenerationNode = new ImageGenerationNode(this.stateManager);
    this.ttsGenerationNode = new TTSGenerationNode(this.stateManager);
    this.videoGenerationNode = new VideoGenerationNode(this.stateManager);
    this.resultsSummaryNode = new ResultsSummaryNode(this.stateManager);
  }

  private connectNodes(): void {
    // Connect nodes according to the workflow logic

    // User Input → Prompt Optimization
    this.userInputNode.next(this.promptOptimizationNode, 'optimize');

    // Prompt Optimization → Image Generation
    this.promptOptimizationNode.next(
      this.imageGenerationNode,
      'generate_image'
    );

    // Image Generation → TTS Generation (if voice needed) or Video Generation
    this.imageGenerationNode.next(this.ttsGenerationNode, 'generate_tts');
    this.imageGenerationNode.next(this.videoGenerationNode, 'generate_video');

    // TTS Generation → Video Generation
    this.ttsGenerationNode.next(this.videoGenerationNode, 'generate_video');

    // Video Generation → Results Summary
    this.videoGenerationNode.next(this.resultsSummaryNode, 'complete');

    // Set the starting node based on current state
    this.setStartNode();
  }

  private setStartNode(): void {
    // Determine where to start based on current state
    const currentStep = this.stateManager.getCurrentStep();
    const completedSteps = this.stateManager.getCompletedSteps();

    console.log(`🔍 Current step: ${currentStep}`);
    console.log(`✅ Completed steps: ${completedSteps.join(', ')}`);

    // Start from the appropriate node based on current state
    if (!completedSteps.includes('user_input')) {
      this.startNode = this.userInputNode;
      console.log('🚀 Starting from user input');
    } else if (!completedSteps.includes('prompt_optimization')) {
      this.startNode = this.promptOptimizationNode;
      console.log('🚀 Resuming from prompt optimization');
    } else if (!completedSteps.includes('image_generation')) {
      this.startNode = this.imageGenerationNode;
      console.log('🚀 Resuming from image generation');
    } else if (!completedSteps.includes('tts_generation')) {
      // Check if TTS is needed
      const stateData = this.stateManager.getStateData();
      if (stateData.needsVoice && stateData.voiceText) {
        this.startNode = this.ttsGenerationNode;
        console.log('🚀 Resuming from TTS generation');
      } else {
        this.startNode = this.videoGenerationNode;
        console.log('🚀 Resuming from video generation (no TTS needed)');
      }
    } else if (!completedSteps.includes('video_generation')) {
      this.startNode = this.videoGenerationNode;
      console.log('🚀 Resuming from video generation');
    } else {
      this.startNode = this.resultsSummaryNode;
      console.log('🚀 Resuming from results summary');
    }
  }

  /**
   * Initialize the workflow with state management
   */
  async initializeWorkflow(shared: SharedStore): Promise<void> {
    await this.stateManager.initializeState(shared);

    // Reset start node based on loaded state
    this.setStartNode();
  }

  /**
   * Run the workflow with state management
   */
  async runWorkflow(shared: SharedStore): Promise<string> {
    console.log('🎬 Starting Stateful Video Generation Workflow');
    console.log('===============================================');

    // Initialize workflow state
    await this.initializeWorkflow(shared);

    // Run the workflow
    const result = await this.runAsync(shared);

    console.log('\n🏁 Workflow execution completed');
    console.log(`📤 Final result: ${result}`);

    return result;
  }

  /**
   * Get workflow progress information
   */
  getWorkflowProgress(): {
    currentStep: string | null;
    completedSteps: string[];
    totalSteps: number;
    progressPercentage: number;
  } {
    const totalSteps = 6; // Total number of steps in the workflow
    const completedSteps = this.stateManager.getCompletedSteps();
    const currentStep = this.stateManager.getCurrentStep();

    return {
      currentStep,
      completedSteps,
      totalSteps,
      progressPercentage: Math.round(
        (completedSteps.length / totalSteps) * 100
      ),
    };
  }

  /**
   * Reset workflow state (for starting over)
   */
  async resetWorkflow(): Promise<void> {
    await this.stateManager.completeWorkflow(); // This clears the state
    console.log('🔄 Workflow state has been reset');
  }
}

/**
 * Factory function to create a stateful video workflow
 */
export function createStatefulVideoWorkflow(
  stateManager: WorkflowStateManager
): StatefulVideoWorkflow {
  return new StatefulVideoWorkflow(stateManager);
}

/**
 * Workflow step definitions for reference
 */
export const WORKFLOW_STEPS = {
  USER_INPUT: 'user_input',
  PROMPT_OPTIMIZATION: 'prompt_optimization',
  IMAGE_GENERATION: 'image_generation',
  TTS_GENERATION: 'tts_generation',
  VIDEO_GENERATION: 'video_generation',
  RESULTS_SUMMARY: 'results_summary',
} as const;

/**
 * Workflow step descriptions
 */
export const STEP_DESCRIPTIONS = {
  [WORKFLOW_STEPS.USER_INPUT]: 'Collecting user input prompt',
  [WORKFLOW_STEPS.PROMPT_OPTIMIZATION]: 'Optimizing prompt with LLM',
  [WORKFLOW_STEPS.IMAGE_GENERATION]:
    'Generating image with text-to-image model',
  [WORKFLOW_STEPS.TTS_GENERATION]: 'Generating audio with text-to-speech',
  [WORKFLOW_STEPS.VIDEO_GENERATION]:
    'Creating video with digital character model',
  [WORKFLOW_STEPS.RESULTS_SUMMARY]: 'Summarizing and presenting results',
} as const;
