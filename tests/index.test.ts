import {
  Node,
  Flow,
  BatchNode,
  AsyncNode,
  AsyncFlow,
  SharedStore,
} from '../src/index';

describe('ZeroGraph TypeScript', () => {
  describe('Node', () => {
    it('should execute basic node lifecycle', () => {
      class TestNode extends Node {
        prep(shared: SharedStore): string {
          return shared.input;
        }

        exec(input: string): string {
          return `processed: ${input}`;
        }

        post(shared: SharedStore, prepRes: string, execRes: string): string {
          shared.output = execRes;
          return 'default';
        }
      }

      const node = new TestNode();
      const shared: SharedStore = { input: 'test' };

      const action = node.run(shared);

      expect(action).toBe('default');
      expect(shared.output).toBe('processed: test');
    });

    it('should handle retry logic', () => {
      let attempts = 0;

      class RetryNode extends Node {
        constructor() {
          super(3, 0); // 3 retries, no wait
        }

        exec(input: any): string {
          attempts++;
          if (attempts < 3) {
            throw new Error('Simulated failure');
          }
          return 'success';
        }
      }

      const node = new RetryNode();
      const shared: SharedStore = { input: 'test' };

      node.run(shared);

      expect(attempts).toBe(3);
    });
  });

  describe('Flow', () => {
    it('should execute simple flow', () => {
      class FirstNode extends Node {
        exec(input: any): string {
          return 'first';
        }

        post(shared: SharedStore, prepRes: any, execRes: string): string {
          shared.first = execRes;
          return 'next';
        }
      }

      class SecondNode extends Node {
        exec(input: any): string {
          return 'second';
        }

        post(shared: SharedStore, prepRes: any, execRes: string): string {
          shared.second = execRes;
          return 'default';
        }
      }

      const first = new FirstNode();
      const second = new SecondNode();

      first.next(second, 'next');

      const flow = new Flow(first);
      const shared: SharedStore = {};

      flow.run(shared);

      expect(shared).toEqual({
        first: 'first',
        second: 'second',
      });
    });

    it('should handle conditional flow', () => {
      class ConditionalNode extends Node {
        prep(shared: SharedStore): any {
          return shared;
        }

        exec(input: any): any {
          return { success: input.shouldSucceed };
        }

        post(shared: SharedStore, prepRes: any, execRes: any): string {
          return execRes.success ? 'success' : 'failure';
        }
      }

      class SuccessNode extends Node {
        exec(input: any): string {
          return 'success path';
        }

        post(shared: SharedStore, prepRes: any, execRes: string): string {
          shared.result = execRes;
          return 'default';
        }
      }

      class FailureNode extends Node {
        exec(input: any): string {
          return 'failure path';
        }

        post(shared: SharedStore, prepRes: any, execRes: string): string {
          shared.result = execRes;
          return 'default';
        }
      }

      const conditional = new ConditionalNode();
      const success = new SuccessNode();
      const failure = new FailureNode();

      conditional.next(success, 'success');
      conditional.next(failure, 'failure');

      const flow = new Flow(conditional);

      // Test success path
      const shared1: SharedStore = { shouldSucceed: true };
      flow.run(shared1);
      expect(shared1.result).toBe('success path');

      // Test failure path
      const shared2: SharedStore = { shouldSucceed: false };
      flow.run(shared2);
      expect(shared2.result).toBe('failure path');
    });
  });

  describe('BatchNode', () => {
    it('should process multiple items', () => {
      class BatchProcessor extends BatchNode {
        prep(shared: SharedStore): string[] {
          return shared.items;
        }

        exec(item: string): string {
          return `processed: ${item}`;
        }

        post(
          shared: SharedStore,
          prepRes: string[],
          execRes: string[]
        ): string {
          shared.results = execRes;
          return 'default';
        }
      }

      const batchNode = new BatchProcessor();
      const shared: SharedStore = { items: ['a', 'b', 'c'] };

      batchNode.run(shared);

      expect(shared.results).toEqual([
        'processed: a',
        'processed: b',
        'processed: c',
      ]);
    });
  });

  describe('AsyncNode', () => {
    it('should handle async operations', async () => {
      class AsyncProcessor extends AsyncNode {
        async prepAsync(shared: SharedStore): Promise<string> {
          return shared.input;
        }

        async execAsync(input: string): Promise<string> {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 10));
          return `async: ${input}`;
        }

        async postAsync(
          shared: SharedStore,
          prepRes: string,
          execRes: string
        ): Promise<string> {
          shared.output = execRes;
          return 'default';
        }
      }

      const asyncNode = new AsyncProcessor();
      const shared: SharedStore = { input: 'test' };

      const action = await asyncNode.runAsync(shared);

      expect(action).toBe('default');
      expect(shared.output).toBe('async: test');
    });
  });

  describe('AsyncFlow', () => {
    it('should execute async flow', async () => {
      class AsyncFirstNode extends AsyncNode {
        async execAsync(input: any): Promise<string> {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'async first';
        }

        async postAsync(
          shared: SharedStore,
          prepRes: any,
          execRes: string
        ): Promise<string> {
          shared.first = execRes;
          return 'next';
        }
      }

      class AsyncSecondNode extends AsyncNode {
        async execAsync(input: any): Promise<string> {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'async second';
        }

        async postAsync(
          shared: SharedStore,
          prepRes: any,
          execRes: string
        ): Promise<string> {
          shared.second = execRes;
          return 'default';
        }
      }

      const first = new AsyncFirstNode();
      const second = new AsyncSecondNode();

      first.next(second, 'next');

      const flow = new AsyncFlow(first);
      const shared: SharedStore = {};

      await flow.runAsync(shared);

      expect(shared).toEqual({
        first: 'async first',
        second: 'async second',
      });
    });
  });
});
