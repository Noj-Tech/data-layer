import type { CacheStore } from "../CacheStore";

export class IndexedDBStore implements CacheStore {
  private readonly storeName = "cache";
  
  private dbPromise?: Promise<IDBDatabase>;

  constructor(private readonly dbName = "layer-cache") {}

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);

    return value !== undefined;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async remove(key: string): Promise<boolean> {
    const exists = await this.has(key);

    if (!exists) {
      return false;
    }

    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
