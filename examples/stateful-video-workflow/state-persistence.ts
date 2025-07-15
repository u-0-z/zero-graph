import { SharedStore } from '../../src/index';

// Type definitions for state persistence
export interface WorkflowState {
  currentStep: string;
  completedSteps: string[];
  timestamp: number;
  data: SharedStore;
}

export interface StatePersistenceConfig {
  saveState: (state: WorkflowState) => Promise<void>;
  loadState: () => Promise<WorkflowState | null>;
  clearState: () => Promise<void>;
}

// Default file-based state persistence (for demo purposes)
// In production, this would be replaced with database or external storage
export class FileStatePersistence implements StatePersistenceConfig {
  private stateFile: string;

  constructor(stateFile: string = 'workflow-state.json') {
    this.stateFile = stateFile;
  }

  async saveState(state: WorkflowState): Promise<void> {
    // NOTE: In vm2 environment, this function should be provided externally
    // This is a placeholder implementation
    console.log(`[State Persistence] Saving state to ${this.stateFile}`);
    console.log(`[State Persistence] Current step: ${state.currentStep}`);
    console.log(
      `[State Persistence] Completed steps: ${state.completedSteps.join(', ')}`
    );

    // In real implementation, this would save to external storage
    // Example: await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }

  async loadState(): Promise<WorkflowState | null> {
    // NOTE: In vm2 environment, this function should be provided externally
    // This is a placeholder implementation
    console.log(`[State Persistence] Loading state from ${this.stateFile}`);

    // In real implementation, this would load from external storage
    // Example: const data = await fs.readFile(this.stateFile, 'utf8');
    // return JSON.parse(data);

    return null; // No saved state for demo
  }

  async clearState(): Promise<void> {
    // NOTE: In vm2 environment, this function should be provided externally
    console.log(`[State Persistence] Clearing state file ${this.stateFile}`);

    // In real implementation, this would delete the state file
    // Example: await fs.unlink(this.stateFile);
  }
}

// State manager class to handle workflow state operations
export class WorkflowStateManager {
  private persistence: StatePersistenceConfig;
  private currentState: WorkflowState | null = null;

  constructor(persistence: StatePersistenceConfig) {
    this.persistence = persistence;
  }

  async initializeState(shared: SharedStore): Promise<void> {
    // Try to load existing state
    this.currentState = await this.persistence.loadState();

    if (this.currentState) {
      console.log(
        `🔄 Restoring workflow state from step: ${this.currentState.currentStep}`
      );
      console.log(
        `✅ Completed steps: ${this.currentState.completedSteps.join(', ')}`
      );

      // Restore shared store data
      Object.assign(shared, this.currentState.data);
    } else {
      console.log('🆕 Starting new workflow session');
      this.currentState = {
        currentStep: 'start',
        completedSteps: [],
        timestamp: Date.now(),
        data: {},
      };
    }
  }

  async updateState(step: string, shared: SharedStore): Promise<void> {
    if (!this.currentState) {
      throw new Error('State not initialized');
    }

    // Update current step
    if (this.currentState.currentStep !== step) {
      this.currentState.completedSteps.push(this.currentState.currentStep);
      this.currentState.currentStep = step;
    }

    // Update timestamp and data
    this.currentState.timestamp = Date.now();
    this.currentState.data = { ...shared };

    // Save to persistence
    await this.persistence.saveState(this.currentState);
    console.log(`💾 State saved at step: ${step}`);
  }

  async completeWorkflow(): Promise<void> {
    if (!this.currentState) {
      return;
    }

    console.log('🎉 Workflow completed successfully');
    console.log(
      `📊 Total steps completed: ${this.currentState.completedSteps.length + 1}`
    );

    // Clear the state after successful completion
    await this.persistence.clearState();
    this.currentState = null;
  }

  getCurrentStep(): string | null {
    return this.currentState?.currentStep || null;
  }

  getCompletedSteps(): string[] {
    return this.currentState?.completedSteps || [];
  }

  isStepCompleted(step: string): boolean {
    return this.getCompletedSteps().includes(step);
  }

  getStateData(): SharedStore {
    return this.currentState?.data || {};
  }
}

// Helper function to create state manager with external persistence functions
export function createStateManager(
  saveStateFn?: (state: WorkflowState) => Promise<void>,
  loadStateFn?: () => Promise<WorkflowState | null>,
  clearStateFn?: () => Promise<void>
): WorkflowStateManager {
  const persistence: StatePersistenceConfig = {
    saveState:
      saveStateFn ||
      new FileStatePersistence().saveState.bind(new FileStatePersistence()),
    loadState:
      loadStateFn ||
      new FileStatePersistence().loadState.bind(new FileStatePersistence()),
    clearState:
      clearStateFn ||
      new FileStatePersistence().clearState.bind(new FileStatePersistence()),
  };

  return new WorkflowStateManager(persistence);
}
