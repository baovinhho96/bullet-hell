import { Node, Prefab, instantiate } from 'cc';

/**
 * Generic object pool with a factory function.
 */
export class ObjectPool<T> {
    private _items: T[] = [];
    private _factory: () => T;

    constructor(factory: () => T) {
        this._factory = factory;
    }

    get(): T {
        return this._items.pop() ?? this._factory();
    }

    put(item: T): void {
        this._items.push(item);
    }

    get size(): number {
        return this._items.length;
    }
}

/**
 * Node pool with automatic activate/deactivate and removeFromParent.
 * Accepts a Prefab or a factory function.
 */
export class NodePool {
    private _items: Node[] = [];
    private _factory: () => Node;

    constructor(factory: (() => Node) | Prefab) {
        this._factory = factory instanceof Prefab
            ? () => instantiate(factory as Prefab)
            : factory;
    }

    get(): Node {
        const node = this._items.pop();
        if (node) {
            node.active = true;
            return node;
        }
        return this._factory();
    }

    put(node: Node): void {
        node.active = false;
        node.removeFromParent();
        this._items.push(node);
    }

    /** Bound put — pass directly as a recycle callback. */
    recycle = (node: Node): void => {
        this.put(node);
    };

    get size(): number {
        return this._items.length;
    }

    clear(): void {
        for (const node of this._items) {
            node.destroy();
        }
        this._items.length = 0;
    }
}
