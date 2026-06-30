// ============================================================
//  Tiny localStorage-backed list store factory.
//  Powers $wishlist, $compare and $recentlyViewed — each is a
//  framework-agnostic nanostore that survives reloads and stays
//  in sync across every React island (separate roots).
// ============================================================
import { atom, type WritableAtom } from 'nanostores';
import type { ProductSummary } from './types';

const isBrowser = typeof window !== 'undefined';

function read(key: string): ProductSummary[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ProductSummary[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: ProductSummary[]): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

export interface ListStore {
  $items: WritableAtom<ProductSummary[]>;
  /** Hydrate from localStorage; call once on first island mount. */
  init(): void;
  has(id: string): boolean;
  add(item: ProductSummary): void;
  remove(id: string): void;
  toggle(item: ProductSummary): boolean;
  clear(): void;
}

/**
 * Build a persistent list store.
 * @param key      localStorage key
 * @param opts.cap optional max length (newest kept, front-inserted)
 */
export function createListStore(key: string, opts: { cap?: number } = {}): ListStore {
  const $items = atom<ProductSummary[]>([]);
  let hydrated = false;

  const commit = (next: ProductSummary[]) => {
    const capped = opts.cap ? next.slice(0, opts.cap) : next;
    $items.set(capped);
    write(key, capped);
  };

  return {
    $items,
    init() {
      if (hydrated || !isBrowser) return;
      hydrated = true;
      $items.set(read(key));
      // Sync across tabs.
      window.addEventListener('storage', (e) => {
        if (e.key === key) $items.set(read(key));
      });
    },
    has(id) {
      return $items.get().some((i) => i.id === id);
    },
    add(item) {
      const rest = $items.get().filter((i) => i.id !== item.id);
      commit([item, ...rest]); // front-insert = most-recent first
    },
    remove(id) {
      commit($items.get().filter((i) => i.id !== id));
    },
    toggle(item) {
      const exists = $items.get().some((i) => i.id === item.id);
      if (exists) {
        commit($items.get().filter((i) => i.id !== item.id));
        return false;
      }
      const rest = $items.get().filter((i) => i.id !== item.id);
      commit([item, ...rest]);
      return true;
    },
    clear() {
      commit([]);
    },
  };
}
