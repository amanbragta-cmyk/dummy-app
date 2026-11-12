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
