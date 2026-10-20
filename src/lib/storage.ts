import type { AppSettings, MediaKitProject } from "@/types";

const DB_NAME = "sponsorsnap";
const DB_VERSION = 1;
const STORE = "projects";
const SETTINGS_KEY = "sponsorsnap.settings";
const LAST_ID_KEY = "sponsorsnap.lastProjectId";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "en",
  defaultCurrency: "EUR",
  autosave: true,
  pdfPageSize: "a4",
  lastProjectId: null,
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export async function listProjects(): Promise<MediaKitProject[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const rows = await requestToPromise(store.getAll());
    return (rows as MediaKitProject[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } finally {
    db.close();
  }
}

export async function getProject(id: string): Promise<MediaKitProject | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const row = await requestToPromise(tx.objectStore(STORE).get(id));
    return (row as MediaKitProject | undefined) ?? null;
  } finally {
    db.close();
  }
}

export async function saveProject(project: MediaKitProject): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    await requestToPromise(tx.objectStore(STORE).put(project));
  } catch (error) {
    const maybe = error as { name?: string };
    if (maybe?.name === "QuotaExceededError") {
      throw new Error("quota");
    }
    throw error;
  } finally {
    db.close();
  }
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    await requestToPromise(tx.objectStore(STORE).delete(id));
  } finally {
    db.close();
  }
}

export async function replaceAllProjects(projects: MediaKitProject[]): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    await requestToPromise(store.clear());
    for (const project of projects) {
      await requestToPromise(store.put(project));
    }
  } finally {
    db.close();
  }
}

export async function clearAllProjects(): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    await requestToPromise(tx.objectStore(STORE).clear());
  } finally {
    db.close();
  }
}

export function loadSettings(): AppSettings {
  if (typeof localStorage === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if (settings.lastProjectId) {
    localStorage.setItem(LAST_ID_KEY, settings.lastProjectId);
  }
}

export function clearAllLocalData(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LAST_ID_KEY);
}

export { DEFAULT_SETTINGS };
