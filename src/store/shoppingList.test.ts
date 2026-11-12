import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { Recipe } from '../types';

const STORAGE_KEY = 'recipebook.shoppingList.v1';

function makeRecipe(id: string, ingredients: Recipe['ingredients']): Recipe {
  return { id, title: id, summary: '', image: '', tags: [], minutes: 10, servings: 2, ingredients, steps: [] };
}

const curry = makeRecipe('curry', [
  { name: 'Onion', quantity: 1, unit: '' },
  { name: 'coconut milk', quantity: 400, unit: 'ml' },
  { name: 'salt', quantity: null, unit: '' },
]);

const soup = makeRecipe('soup', [
  { name: 'onion', quantity: 2, unit: '' },
  { name: 'coconut milk', quantity: 1, unit: 'tin' },
  { name: 'Salt', quantity: 1, unit: '' },
]);

// The store reads localStorage when it is first imported, so each test loads a fresh copy:
// importing again is what a page reload does.
async function openList() {
  vi.resetModules();
  const { useShoppingList } = await import('./shoppingList');
  return renderHook(() => useShoppingList()).result;
}

describe('useShoppingList', () => {
  beforeEach(() => localStorage.clear());

  it('adds every ingredient of a recipe, unticked, under its key', async () => {
    const list = await openList();

    act(() => list.current.addRecipe(curry));

    expect(list.current.items).toEqual([
      { key: 'onion|', name: 'Onion', quantity: 1, unit: '', checked: false, recipeIds: ['curry'] },
      { key: 'coconut milk|ml', name: 'coconut milk', quantity: 400, unit: 'ml', checked: false, recipeIds: ['curry'] },
      { key: 'salt|', name: 'salt', quantity: null, unit: '', checked: false, recipeIds: ['curry'] },
    ]);
    expect(list.current.hasRecipe('curry')).toBe(true);
    expect(list.current.hasRecipe('soup')).toBe(false);
  });

  it('adds nothing more when the recipe is already on the list', async () => {
    const list = await openList();

    act(() => list.current.addRecipe(curry));
    act(() => list.current.addRecipe(curry));

    expect(list.current.items).toHaveLength(3);
    expect(list.current.items[0].quantity).toBe(1);
  });

  it('combines the same ingredient in the same unit, summing quantities', async () => {
    const list = await openList();

    act(() => list.current.addRecipe(curry));
    act(() => list.current.addRecipe(soup));

    const onion = list.current.items.find((item) => item.key === 'onion|');
    expect(onion).toMatchObject({ name: 'Onion', quantity: 3, recipeIds: ['curry', 'soup'] });
    expect(list.current.items.map((item) => item.key)).toEqual([
      'onion|',
      'coconut milk|ml',
      'salt|',
      'coconut milk|tin',
    ]);
  });

  it('keeps a combined quantity as "some" (null) when either side has none', async () => {
    const list = await openList();

    act(() => list.current.addRecipe(curry));
    act(() => list.current.addRecipe(soup));

    expect(list.current.items.find((item) => item.key === 'salt|')?.quantity).toBeNull();
  });

  it('combines repeats within one recipe too', async () => {
    const list = await openList();
    const twice = makeRecipe('twice', [
      { name: 'egg', quantity: 2, unit: '' },
      { name: 'Egg', quantity: 1, unit: '' },
    ]);

    act(() => list.current.addRecipe(twice));

    expect(list.current.items).toEqual([
      { key: 'egg|', name: 'egg', quantity: 3, unit: '', checked: false, recipeIds: ['twice'] },
    ]);
  });

  it('unticks a ticked item when another recipe needs more of it', async () => {
    const list = await openList();
    act(() => list.current.addRecipe(curry));
    act(() => list.current.toggle('onion|'));

    act(() => list.current.addRecipe(soup));

    expect(list.current.items[0]).toMatchObject({ key: 'onion|', checked: false });
  });

  it('ticks and unticks an item', async () => {
    const list = await openList();
    act(() => list.current.addRecipe(curry));

    act(() => list.current.toggle('onion|'));
    expect(list.current.items[0].checked).toBe(true);

    act(() => list.current.toggle('onion|'));
    expect(list.current.items[0].checked).toBe(false);
  });

  it('removes one item', async () => {
    const list = await openList();
    act(() => list.current.addRecipe(curry));

    act(() => list.current.remove('salt|'));

    expect(list.current.items.map((item) => item.key)).toEqual(['onion|', 'coconut milk|ml']);
  });

  it('clears only the ticked items', async () => {
    const list = await openList();
    act(() => list.current.addRecipe(curry));
    act(() => list.current.toggle('onion|'));
    act(() => list.current.toggle('salt|'));

    act(() => list.current.clearChecked());

    expect(list.current.items.map((item) => item.key)).toEqual(['coconut milk|ml']);
  });

  it('leaves a recipe off the list once all its items are removed', async () => {
    const list = await openList();
    act(() => list.current.addRecipe(makeRecipe('toast', [{ name: 'bread', quantity: 1, unit: 'slice' }])));

    act(() => list.current.remove('bread|slice'));

    expect(list.current.hasRecipe('toast')).toBe(false);
  });

  it('keeps the list after a reload', async () => {
    const before = await openList();
    act(() => before.current.addRecipe(curry));
    act(() => before.current.toggle('salt|'));

    const after = await openList();

    expect(after.current.items).toEqual(before.current.items);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(before.current.items);
  });

  it.each([
    ['not JSON', '{not json'],
    ['not a list', '{"key":"onion|"}'],
    ['a list with a malformed item', '[{"key":"onion|","name":"onion"}]'],
    ['a list with a wrong-typed quantity', '[{"key":"a|","name":"a","quantity":"2","unit":"","checked":false,"recipeIds":[]}]'],
    ['null', 'null'],
  ])('treats a saved list that is %s as empty', async (_, saved) => {
    localStorage.setItem(STORAGE_KEY, saved);

    const list = await openList();

    expect(list.current.items).toEqual([]);
  });

  it('starts empty when nothing is saved', async () => {
    const list = await openList();

    expect(list.current.items).toEqual([]);
  });
});
