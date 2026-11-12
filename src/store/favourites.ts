import { createStore, useStore } from './createStore';

const STORAGE_KEY = 'recipebook.favourites.v1';

function isIdList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === 'string');
}

// Saved data can be edited by hand or left by an older build: anything but a string[] means none.
function loadSaved(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return isIdList(parsed) ? parsed : [];
  } catch (error) {
    if (error instanceof SyntaxError) return [];
    throw error;
  }
}

const store = createStore<string[]>(loadSaved());

function toggle(id: string) {
  const current = store.get();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  store.set(next);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function useFavourites() {
  const ids = useStore(store);
  return {
    ids,
    isFavourite: (id: string) => ids.includes(id),
    toggle,
  };
}
