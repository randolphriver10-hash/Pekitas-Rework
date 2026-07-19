const STORAGE_KEY = "pekitas-recently-viewed";
const MAX_ITEMS = 8;

let slugs: string[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

function notify() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  if (!hydrated) {
    slugs = readFromStorage();
    hydrated = true;
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): string[] {
  return slugs;
}

export function getServerSnapshot(): string[] {
  return [];
}

export function recordView(slug: string) {
  const next = [slug, ...slugs.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
  slugs = next;
  persist();
  notify();
}
