/** localStorage seguro: si no está disponible (modo privado, bloqueo), guarda en memoria. */
const memory = new Map<string, string>();
let persistent: boolean | null = null;

function probe(): boolean {
  if (persistent !== null) return persistent;
  try {
    const k = '__ultima_senal_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    persistent = true;
  } catch {
    persistent = false;
  }
  return persistent;
}

export function isPersistent(): boolean {
  return probe();
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (probe()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        /* cae a memoria */
      }
    }
    return memory.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (probe()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        /* cae a memoria */
      }
    }
    memory.set(key, value);
  },
  removeItem(key: string): void {
    if (probe()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignorar */
      }
    }
    memory.delete(key);
  },
};

export function readJSON<T>(key: string, fallback: T): T {
  const raw = safeStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  safeStorage.setItem(key, JSON.stringify(value));
}

/** Solo para pruebas. */
export function __resetStorageProbe(): void {
  persistent = null;
  memory.clear();
}
