import type { Ingredient, Recipe } from '../types';
import { createStore, useStore } from './createStore';

export interface ShoppingItem {
  /** Lowercased name + '|' + lowercased unit: items with the same key are one line. */
  key: string;
  name: string;
  quantity: number | null;
  unit: string;
  checked: boolean;
  recipeIds: string[];
}

const STORAGE_KEY = 'recipebook.shoppingList.v1';

function keyOf(ingredient: Ingredient) {
  return `${ingredient.name.toLowerCase()}|${ingredient.unit.toLowerCase()}`;
}

// A quantity of null means "some", and some plus anything is still some.
function addQuantities(a: number | null, b: number | null) {
  return a === null || b === null ? null : a + b;
}

function isShoppingItem(value: unknown): value is ShoppingItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.key === 'string' &&
    typeof item.name === 'string' &&
    (item.quantity === null || typeof item.quantity === 'number') &&
    typeof item.unit === 'string' &&
    typeof item.checked === 'boolean' &&
    Array.isArray(item.recipeIds) &&
    item.recipeIds.every((id) => typeof id === 'string')
  );
}

// Anything can sit under the key (an old shape, a hand edit): a list we cannot trust starts empty.
function loadItems(): ShoppingItem[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isShoppingItem) ? parsed : [];
  } catch (error) {
    if (error instanceof SyntaxError) return [];
    throw error;
  }
}

/** Adds a recipe's ingredients, combining each with the line of the same key. */
function addRecipeToItems(items: ShoppingItem[], recipe: Recipe): ShoppingItem[] {
  const byKey = new Map(items.map((item) => [item.key, item]));
  for (const ingredient of recipe.ingredients) {
    const key = keyOf(ingredient);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...ingredient, key, checked: false, recipeIds: [recipe.id] });
      continue;
    }
    // More is needed now, so a ticked line is to buy again.
    byKey.set(key, {
      ...existing,
      quantity: addQuantities(existing.quantity, ingredient.quantity),
      checked: false,
      recipeIds: existing.recipeIds.includes(recipe.id) ? existing.recipeIds : [...existing.recipeIds, recipe.id],
    });
  }
  return [...byKey.values()];
}

const store = createStore<ShoppingItem[]>(loadItems());
store.subscribe(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(store.get())));

function update(change: (items: ShoppingItem[]) => ShoppingItem[]) {
  store.set(change(store.get()));
}

function listHasRecipe(items: ShoppingItem[], id: string) {
  return items.some((item) => item.recipeIds.includes(id));
}

export function useShoppingList() {
  const items = useStore(store);
  return {
    items,
    hasRecipe: (id: string) => listHasRecipe(items, id),
    addRecipe: (recipe: Recipe) =>
      update((current) => (listHasRecipe(current, recipe.id) ? current : addRecipeToItems(current, recipe))),
    toggle: (key: string) =>
      update((current) => current.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item))),
    remove: (key: string) => update((current) => current.filter((item) => item.key !== key)),
    clearChecked: () => update((current) => current.filter((item) => !item.checked)),
  };
}
