import { describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { getRecipes } from './data/recipes';

function openAt(hash: string) {
  window.location.hash = hash;
  render(<App />);
}

describe('App routes', () => {
  it('shows the recipes page at #/', () => {
    openAt('#/');
    expect(screen.getByRole('heading', { level: 1, name: 'Recipes' })).toBeInTheDocument();
  });

  it('shows a recipe page at #/recipe/<id>', () => {
    const recipe = getRecipes()[0];
    openAt(`#/recipe/${recipe.id}`);
    expect(screen.getByRole('heading', { level: 1, name: recipe.title })).toBeInTheDocument();
  });

  it('shows "Recipe not found" for a malformed recipe address instead of crashing', () => {
    openAt('#/recipe/%E0%A4%A');
    expect(screen.getByRole('heading', { level: 1, name: 'Recipe not found' })).toBeInTheDocument();
  });

  it('shows the favourites page at #/favourites', () => {
    openAt('#/favourites');
    expect(screen.getByRole('heading', { level: 1, name: 'Favourites' })).toBeInTheDocument();
  });

  it('shows the shopping list page at #/list', () => {
    openAt('#/list');
    expect(screen.getByRole('heading', { level: 1, name: 'Shopping list' })).toBeInTheDocument();
  });

  it('falls back to the recipes page for an unknown route', () => {
    openAt('#/nowhere');
    expect(screen.getByRole('heading', { level: 1, name: 'Recipes' })).toBeInTheDocument();
  });

  it('moves between the main pages from the header nav', async () => {
    const user = userEvent.setup();
    openAt('#/');
    const nav = screen.getByRole('navigation', { name: 'Main' });

    for (const name of ['Favourites', 'Shopping list', 'Recipes']) {
      await act(() => user.click(within(nav).getByRole('link', { name })));
      expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
    }
  });

  it('marks the current page in the header nav', () => {
    openAt('#/favourites');
    expect(screen.getByRole('link', { name: 'Favourites' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Recipes' })).not.toHaveAttribute('aria-current');
  });
});

import { beforeEach, vi } from 'vitest';

const LIST_KEY = 'recipebook.shoppingList.v1';

function listItem(name: string, checked: boolean) {
  return { key: `${name}|`, name, quantity: 1, unit: '', checked, recipeIds: ['r'] };
}

// The list store reads localStorage when first imported, so a fresh import is a fresh page load.
async function openWithList(items: ReturnType<typeof listItem>[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(items));
  vi.resetModules();
  const { default: FreshApp } = await import('./App');
  window.location.hash = '#/';
  render(<FreshApp />);
  return within(screen.getByRole('navigation', { name: 'Main' }));
}

describe('App header shopping list count', () => {
  beforeEach(() => localStorage.clear());

  it('shows how many items on the list are still unticked', async () => {
    const nav = await openWithList([listItem('onion', false), listItem('salt', true), listItem('lemon', false)]);
    const link = nav.getByRole('link', { name: 'Shopping list, 2 to buy' });
    expect(link).toHaveTextContent('Shopping list2');
  });

  it('shows no count when every item is ticked', async () => {
    const nav = await openWithList([listItem('salt', true)]);
    expect(nav.getByRole('link', { name: 'Shopping list' })).toHaveTextContent(/^Shopping list$/);
  });

  it('shows no count when the list is empty', async () => {
    const nav = await openWithList([]);
    expect(nav.getByRole('link', { name: 'Shopping list' })).toHaveTextContent(/^Shopping list$/);
  });

  it('updates the count as soon as an item is ticked on the list page', async () => {
    const user = userEvent.setup();
    const nav = await openWithList([listItem('onion', false), listItem('lemon', false)]);
    await act(() => user.click(nav.getByRole('link', { name: 'Shopping list, 2 to buy' })));
    await act(() => user.click(screen.getByRole('checkbox', { name: /onion/ })));
    expect(nav.getByRole('link', { name: 'Shopping list, 1 to buy' })).toBeInTheDocument();
  });
});

describe('App footer', () => {
  it('says favourites and the shopping list are kept in this browser', () => {
    openAt('#/');
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'Your favourites and shopping list are saved in this browser only.',
    );
  });
});
