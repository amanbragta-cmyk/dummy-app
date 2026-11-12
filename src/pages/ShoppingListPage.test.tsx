import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Recipe } from '../types';

const STORAGE_KEY = 'recipebook.shoppingList.v1';

function makeRecipe(id: string, ingredients: Recipe['ingredients']): Recipe {
  return { id, title: id, summary: '', image: '', tags: [], minutes: 10, servings: 2, ingredients, steps: [] };
}

const curry = makeRecipe('curry', [
  { name: 'onion', quantity: 1, unit: '' },
  { name: 'coconut milk', quantity: 400, unit: 'ml' },
  { name: 'salt', quantity: null, unit: '' },
]);

const soup = makeRecipe('soup', [
  { name: 'Coconut milk', quantity: 200, unit: 'ml' },
  { name: 'stock', quantity: 1, unit: 'l' },
]);

// The list is read from localStorage when the store is first imported, so loading the
// modules again is what a page reload does.
async function openApp(recipes: Recipe[] = []) {
  vi.resetModules();
  const { default: ShoppingListPage } = await import('./ShoppingListPage');
  const { default: AddToListButton } = await import('../components/AddToListButton');
  render(
    <>
      {recipes.map((recipe) => (
        <section key={recipe.id} aria-label={recipe.title}>
          <AddToListButton recipe={recipe} />
        </section>
      ))}
      <ShoppingListPage />
    </>,
  );
  return userEvent.setup();
}

function addButton(recipe: Recipe) {
  return screen.getByRole('region', { name: recipe.title }).querySelector('button')!;
}

function itemTexts() {
  return screen.queryAllByRole('checkbox').map((box) => box.closest('label')?.textContent);
}

describe('Shopping list', () => {
  beforeEach(() => localStorage.clear());

  it('adds every ingredient of a recipe from "Add to shopping list"', async () => {
    const user = await openApp([curry]);

    await act(() => user.click(screen.getByRole('button', { name: 'Add to shopping list' })));

    expect(itemTexts()).toEqual(['1 onion', '400 ml coconut milk', 'some salt']);
  });

  it('shows "On your list" once the recipe is added, and tapping it adds nothing more', async () => {
    const user = await openApp([curry]);
    await act(() => user.click(addButton(curry)));

    expect(addButton(curry)).toHaveTextContent('On your list');
    await act(() => user.click(addButton(curry)));

    expect(itemTexts()).toHaveLength(3);
    expect(itemTexts()[0]).toBe('1 onion');
  });

  it('shows the same ingredient in the same unit from two recipes as one line, summed', async () => {
    const user = await openApp([curry, soup]);

    await act(() => user.click(addButton(curry)));
    await act(() => user.click(addButton(soup)));

    expect(itemTexts()).toEqual(['1 onion', '600 ml coconut milk', 'some salt', '1 l stock']);
  });

  it('ticks and unticks an item', async () => {
    const user = await openApp([curry]);
    await act(() => user.click(addButton(curry)));
    const onion = screen.getByRole('checkbox', { name: '1 onion' });

    await act(() => user.click(onion));
    expect(onion).toBeChecked();

    await act(() => user.click(onion));
    expect(onion).not.toBeChecked();
  });

  it('removes an item', async () => {
    const user = await openApp([curry]);
    await act(() => user.click(addButton(curry)));

    await act(() => user.click(screen.getByRole('button', { name: 'Remove onion' })));

    expect(itemTexts()).toEqual(['400 ml coconut milk', 'some salt']);
  });

  it('"Clear ticked" removes only the ticked items', async () => {
    const user = await openApp([curry]);
    await act(() => user.click(addButton(curry)));
    await act(() => user.click(screen.getByRole('checkbox', { name: '1 onion' })));
    await act(() => user.click(screen.getByRole('checkbox', { name: 'some salt' })));

    await act(() => user.click(screen.getByRole('button', { name: 'Clear ticked' })));

    expect(itemTexts()).toEqual(['400 ml coconut milk']);
  });

  it('cannot clear when nothing is ticked', async () => {
    const user = await openApp([curry]);
    await act(() => user.click(addButton(curry)));

    expect(screen.getByRole('button', { name: 'Clear ticked' })).toBeDisabled();
  });

  it('is the same after a reload', async () => {
    const user = await openApp([curry]);
    await act(() => user.click(addButton(curry)));
    await act(() => user.click(screen.getByRole('checkbox', { name: 'some salt' })));
    document.body.innerHTML = '';

    await openApp([curry]);

    expect(itemTexts()).toEqual(['1 onion', '400 ml coconut milk', 'some salt']);
    expect(screen.getByRole('checkbox', { name: 'some salt' })).toBeChecked();
    expect(addButton(curry)).toHaveTextContent('On your list');
  });

  it('says "Your list is empty" with a link to all recipes when empty', async () => {
    await openApp();

    expect(screen.getByText('Your list is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All recipes' })).toHaveAttribute('href', '#/');
    expect(screen.queryByRole('button', { name: 'Clear ticked' })).not.toBeInTheDocument();
  });

  it('treats a malformed saved list as an empty list without crashing', async () => {
    localStorage.setItem(STORAGE_KEY, '[{"broken":');

    await openApp();

    expect(screen.getByRole('heading', { level: 1, name: 'Shopping list' })).toBeInTheDocument();
    expect(screen.getByText('Your list is empty')).toBeInTheDocument();
  });
});
