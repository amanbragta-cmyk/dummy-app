import type { Recipe, ShoppingItem } from '../types';
import { createStore, useStore } from './createStore';

// Stub from T1: kept in memory, one line per ingredient. T5 combines repeats and saves it
// under recipebook.shoppingList.v1.
const store = createStore<ShoppingItem[]>([]);

function update(change: (items: ShoppingItem[]) => ShoppingItem[]) {
  store.set(change(store.get()));
}

export function useShoppingList() {
  const items = useStore(store);
  return {
    items,
    hasRecipe: (id: string) => items.some((item) => item.recipeIds.includes(id)),
    addRecipe(recipe: Recipe) {
      const added = recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        key: `${ingredient.name.toLowerCase()}|${ingredient.unit.toLowerCase()}`,
        checked: false,
        recipeIds: [recipe.id],
      }));
      update((current) => [...current, ...added]);
    },
    toggle: (key: string) =>
      update((current) => current.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item))),
    remove: (key: string) => update((current) => current.filter((item) => item.key !== key)),
    clearChecked: () => update((current) => current.filter((item) => !item.checked)),
  };
}
