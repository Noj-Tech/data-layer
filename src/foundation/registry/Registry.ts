export class Registry<T extends { name: string }> {
  private readonly items = new Map<string, T>();

  register(item: T): void {
    if (this.items.has(item.name)) {
      return;
    }

    this.items.set(item.name, item);
  }

  has(name: string): boolean {
    return this.items.has(name);
  }

  get(name: string): T | undefined {
    return this.items.get(name);
  }

  getAll(): T[] {
    return [...this.items.values()];
  }

  remove(name: string): boolean {
    return this.items.delete(name);
  }

  clear(): void {
    this.items.clear();
  }

  get size(): number {
    return this.items.size;
  }
}