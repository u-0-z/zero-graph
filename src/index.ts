// ZeroGraph TypeScript - Minimalist LLM framework for Agentic Coding

export type SharedStore = Record<string, any>;
export type ActionType = string;

class ConditionalTransition {
  constructor(
    public src: BaseNode,
    public action: ActionType
  ) {}

  next(target: BaseNode): BaseNode {
    return this.src.next(target, this.action);
  }
}

export abstract class BaseNode {
  protected params: Record<string, any> = {};
  public successors: Record<ActionType, BaseNode> = {};

  setParams(params: Record<string, any>): void {
    this.params = params;
  }

  next(node: BaseNode, action: ActionType = 'default'): BaseNode {
    if (action in this.successors) {
      console.warn(`Overwriting successor for action '${action}'`);
    }
    this.successors[action] = node;
    return node;
  }

  prep(shared: SharedStore): any {
    return undefined;
  }

  exec(prepRes: any): any {
    return undefined;
  }

  post(shared: SharedStore, prepRes: any, execRes: any): ActionType {
    return 'default';
  }

  protected _exec(prepRes: any): any {
    return this.exec(prepRes);
  }

  protected _run(shared: SharedStore): ActionType {
    const p = this.prep(shared);
    const e = this._exec(p);
    return this.post(shared, p, e);
  }

  run(shared: SharedStore): ActionType {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Node won't run successors. Use Flow.");
    }
    return this._run(shared);
  }

  // Operator overloading equivalents
  pipe(other: BaseNode): BaseNode {
    return this.next(other);
  }

  action(action: ActionType): ConditionalTransition {
    return new ConditionalTransition(this, action);
  }
}

export class Node extends BaseNode {
  protected maxRetries: number;
  protected wait: number;
  protected curRetry: number = 0;

  constructor(maxRetries: number = 1, wait: number = 0) {
    super();
    this.maxRetries = maxRetries;
    this.wait = wait;
  }

  execFallback(prepRes: any, exc: Error): any {
    throw exc;
  }

  protected _exec(prepRes: any): any {
    for (this.curRetry = 0; this.curRetry < this.maxRetries; this.curRetry++) {
      try {
        return this.exec(prepRes);
      } catch (e) {
        if (this.curRetry === this.maxRetries - 1) {
          return this.execFallback(prepRes, e as Error);
        }
        if (this.wait > 0) {
          // Simple blocking wait (in real implementation, use setTimeout for async)
          const start = Date.now();
          while (Date.now() - start < this.wait * 1000) {}
        }
      }
    }
  }
}

export class BatchNode extends Node {
  protected _exec(items: any[]): any[] {
    return (items || []).map(item => super._exec(item));
  }
}

export class Flow extends BaseNode {
  protected startNode: BaseNode | null;

  constructor(start: BaseNode | null = null) {
    super();
    this.startNode = start;
  }

  start(start: BaseNode): BaseNode {
    this.startNode = start;
    return start;
  }

  protected getNextNode(
    curr: BaseNode,
    action: ActionType | null
  ): BaseNode | null {
    const next = curr.successors[action || 'default'];
    if (!next && Object.keys(curr.successors).length > 0) {
      console.warn(
        `Flow ends: '${action}' not found in [${Object.keys(curr.successors).join(', ')}]`
      );
    }
    return next || null;
  }

  protected _orch(
    shared: SharedStore,
    params?: Record<string, any>
  ): ActionType {
    let curr = this.startNode
      ? Object.assign(
          Object.create(Object.getPrototypeOf(this.startNode)),
          this.startNode
        )
      : null;
    const p = params || { ...this.params };
    let lastAction: ActionType = 'default';

    while (curr) {
      curr.setParams(p);
      lastAction = curr._run(shared);
      curr = this.getNextNode(curr, lastAction);
      if (curr) {
        curr = Object.assign(Object.create(Object.getPrototypeOf(curr)), curr);
      }
    }
    return lastAction;
  }

  protected _run(shared: SharedStore): ActionType {
    const p = this.prep(shared);
    const o = this._orch(shared);
    return this.post(shared, p, o);
  }

  post(shared: SharedStore, prepRes: any, execRes: any): ActionType {
    return execRes;
  }
}

export class BatchFlow extends Flow {
  protected _run(shared: SharedStore): ActionType {
    const pr = this.prep(shared) || [];
    for (const bp of pr) {
      this._orch(shared, { ...this.params, ...bp });
    }
    return this.post(shared, pr, null);
  }
}

export class AsyncNode extends Node {
  async prepAsync(shared: SharedStore): Promise<any> {
    return undefined;
  }

  async execAsync(prepRes: any): Promise<any> {
    return undefined;
  }

  async execFallbackAsync(prepRes: any, exc: Error): Promise<any> {
    throw exc;
  }

  async postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: any
  ): Promise<ActionType> {
    return 'default';
  }

  protected async _exec(prepRes: any): Promise<any> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.execAsync(prepRes);
      } catch (e) {
        if (i === this.maxRetries - 1) {
          return await this.execFallbackAsync(prepRes, e as Error);
        }
        if (this.wait > 0) {
          await new Promise(resolve => setTimeout(resolve, this.wait * 1000));
        }
      }
    }
  }

  async runAsync(shared: SharedStore): Promise<ActionType> {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Node won't run successors. Use AsyncFlow.");
    }
    return await this._runAsync(shared);
  }

  protected async _runAsync(shared: SharedStore): Promise<ActionType> {
    const p = await this.prepAsync(shared);
    const e = await this._exec(p);
    return await this.postAsync(shared, p, e);
  }

  protected _run(shared: SharedStore): ActionType {
    throw new Error('Use runAsync.');
  }
}

export class AsyncBatchNode extends AsyncNode {
  protected async _exec(items: any[]): Promise<any[]> {
    const results = [];
    for (const item of items) {
      results.push(await super._exec(item));
    }
    return results;
  }
}

export class AsyncParallelBatchNode extends AsyncNode {
  protected async _exec(items: any[]): Promise<any[]> {
    return await Promise.all(items.map(item => super._exec(item)));
  }
}

export class AsyncFlow extends Flow {
  protected async _orchAsync(
    shared: SharedStore,
    params?: Record<string, any>
  ): Promise<ActionType> {
    let curr = this.startNode
      ? Object.assign(
          Object.create(Object.getPrototypeOf(this.startNode)),
          this.startNode
        )
      : null;
    const p = params || { ...this.params };
    let lastAction: ActionType = 'default';

    while (curr) {
      curr.setParams(p);
      lastAction =
        curr instanceof AsyncNode
          ? await (curr as any)._runAsync(shared)
          : curr._run(shared);
      curr = this.getNextNode(curr, lastAction);
      if (curr) {
        curr = Object.assign(Object.create(Object.getPrototypeOf(curr)), curr);
      }
    }
    return lastAction;
  }

  protected async _runAsync(shared: SharedStore): Promise<ActionType> {
    const p = await this.prepAsync(shared);
    const o = await this._orchAsync(shared);
    return await this.postAsync(shared, p, o);
  }

  async prepAsync(shared: SharedStore): Promise<any> {
    return undefined;
  }

  async postAsync(
    shared: SharedStore,
    prepRes: any,
    execRes: any
  ): Promise<ActionType> {
    return execRes;
  }

  async runAsync(shared: SharedStore): Promise<ActionType> {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Flow won't run successors. Use parent AsyncFlow.");
    }
    return await this._runAsync(shared);
  }
}

export class AsyncBatchFlow extends AsyncFlow {
  protected async _runAsync(shared: SharedStore): Promise<ActionType> {
    const pr = (await this.prepAsync(shared)) || [];
    for (const bp of pr) {
      await this._orchAsync(shared, { ...this.params, ...bp });
    }
    return await this.postAsync(shared, pr, null);
  }
}

export class AsyncParallelBatchFlow extends AsyncFlow {
  protected async _runAsync(shared: SharedStore): Promise<ActionType> {
    const pr = (await this.prepAsync(shared)) || [];
    await Promise.all(
      pr.map((bp: any) => this._orchAsync(shared, { ...this.params, ...bp }))
    );
    return await this.postAsync(shared, pr, null);
  }
}
