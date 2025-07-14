import { AsyncNode, SharedStore } from '@u0z/zero-graph';
import { callLLM } from './utils/callLLM';
import * as readlineSync from 'readline-sync';

export class GetQuestionNode extends AsyncNode {
  async execAsync(prepRes: any): Promise<string> {
    // Get question directly from user input using readline-sync
    const question = readlineSync.question('Enter your question: ');
    return question;
  }

  async postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: string
  ): Promise<string> {
    // Store the user's question
    shared.question = execRes;
    return 'default'; // Go to the next node
  }
}

export class AnswerNode extends AsyncNode {
  async prepAsync(shared: SharedStore): Promise<string> {
    // Read question from shared
    return shared.question;
  }

  async execAsync(question: string): Promise<string> {
    // Call LLM asynchronously to get the answer
    return await callLLM(question);
  }

  async postAsync(
    shared: SharedStore,
    prepRes: string,
    execRes: string
  ): Promise<string> {
    // Store the answer in shared
    shared.answer = execRes;
    // Display the answer to the user
    console.log('\nAnswer:', execRes);
    console.log(''); // Add a blank line for better readability
    return 'default';
  }
}
export class ContinueNode extends AsyncNode {
  async prepAsync(shared: SharedStore): Promise<SharedStore> {
    // 返回共享存储以便在 execAsync 中使用
    return shared;
  }

  async execAsync(prepRes: SharedStore): Promise<boolean> {
    // 检查是否应该继续
    if (
      prepRes.question &&
      (prepRes.question.toLowerCase() === 'quit' ||
        prepRes.question.toLowerCase() === 'exit')
    ) {
      return false; // 结束循环
    }
    return true; // 继续循环
  }

  async postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: boolean
  ): Promise<string> {
    if (execRes) {
      return 'continue'; // 返回到问题节点
    } else {
      return 'end'; // 结束流程
    }
  }
}
