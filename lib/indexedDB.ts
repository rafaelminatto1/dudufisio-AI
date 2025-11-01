/**
 * IndexedDB Manager
 * Gerenciamento centralizado de IndexedDB para persistência robusta
 */

const DB_NAME = 'FisioFlowDB';
const DB_VERSION = 1;

export interface DBSchema {
  settings: {
    key: string;
    value: any;
    updatedAt: Date;
  };
  offlineQueue: {
    id: string;
    type: string;
    data: any;
    timestamp: Date;
    retryCount: number;
  };
  cache: {
    key: string;
    value: any;
    expiresAt: Date;
  };
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    // Verificar se IndexedDB está disponível
    if (typeof indexedDB === 'undefined' || !indexedDB || typeof indexedDB.open !== 'function') {
      throw new Error('IndexedDB não está disponível neste navegador');
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para configurações do usuário
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Store para fila de sincronização offline
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('type', 'type', { unique: false });
        }

        // Store para cache geral
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async get<K extends keyof DBSchema>(
    storeName: K,
    key: string
  ): Promise<DBSchema[K] | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set<K extends keyof DBSchema>(
    storeName: K,
    value: DBSchema[K]
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete<K extends keyof DBSchema>(
    storeName: K,
    key: string
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAll<K extends keyof DBSchema>(storeName: K): Promise<DBSchema[K][]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clear<K extends keyof DBSchema>(storeName: K): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cleanExpiredCache(): Promise<void> {
    const db = await this.init();
    const now = new Date();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cache', 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiresAt');
      const request = index.openCursor();

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const value = cursor.value;
          if (value.expiresAt < now) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}

export const indexedDB = new IndexedDBManager();

// Helper functions para settings com tratamento de erro
export const getSettings = async (key: string) => {
  try {
    return await indexedDB.get('settings', key);
  } catch (error) {
    console.warn('Erro ao acessar IndexedDB:', error);
    return undefined;
  }
};

export const setSettings = async (key: string, value: any) => {
  try {
    return await indexedDB.set('settings', { key, value, updatedAt: new Date() });
  } catch (error) {
    console.warn('Erro ao salvar em IndexedDB:', error);
  }
};

export const deleteSettings = async (key: string) => {
  try {
    return await indexedDB.delete('settings', key);
  } catch (error) {
    console.warn('Erro ao deletar de IndexedDB:', error);
  }
};

