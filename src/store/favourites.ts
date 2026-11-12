import { createStore, useStore } from './createStore';

// Stub from T1: kept in memory only. T4 saves it under recipebook.favourites.v1.
const store = createStore<string[]>([]);

export function useFavourites() {
  const ids = useStore(store);
  return {
    ids,
    isFavourite: (id: string) => ids.includes(id),
    toggle(id: string) {
      const current = store.get();
      store.set(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    },
  };
}
