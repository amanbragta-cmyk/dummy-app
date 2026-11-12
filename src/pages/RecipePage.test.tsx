import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import RecipePage from './RecipePage';
import { getRecipe } from '../data/recipes';

const CURRY_ID = 'chickpea-spinach-curry';
const curry = getRecipe(CURRY_ID)!;

function openCurry() {
  render(<RecipePage id={CURRY_ID} />);
}

describe('RecipePage', () => {
  it("shows the recipe's photo and title", () => {
    openCurry();
    expect(screen.getByRole('heading', { level: 1, name: curry.title })).toBeInTheDocument();
    expect(document.querySelector('img')).toHaveAttribute('src', curry.image);
  });

  it('shows how many minutes it takes and how many it serves', () => {
    openCurry();
    expect(screen.getByText(`${curry.minutes} min`)).toBeInTheDocument();
    expect(screen.getByText(`Serves ${curry.servings}`)).toBeInTheDocument();
  });

  it('lists every ingredient with its quantity and unit', () => {
    openCurry();
    const list = screen.getByRole('list', { name: 'Ingredients' });
    const items = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent);

    expect(items).toHaveLength(curry.ingredients.length);
    expect(items).toContain('800 g chickpeas, drained');
    expect(items).toContain('2 tbsp curry powder');
  });

  it('shows a counted ingredient without a unit, and one with no quantity by name alone', () => {
    openCurry();
    const items = within(screen.getByRole('list', { name: 'Ingredients' }))
      .getAllByRole('listitem')
      .map((item) => item.textContent);

    expect(items).toContain('1 onion');
    expect(items).toContain('salt');
  });

  it('shows the steps as a numbered list, in order', () => {
    openCurry();
    const list = screen.getByRole('list', { name: 'Method' });
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(curry.steps);
  });

  it('shows the heart and the "Add to shopping list" button for this recipe', () => {
    openCurry();
    expect(screen.getByRole('button', { name: 'Add to favourites' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to shopping list' })).toBeInTheDocument();
  });

  it('links back to all recipes', () => {
    openCurry();
    expect(screen.getByRole('link', { name: 'All recipes' })).toHaveAttribute('href', '#/');
  });

  it('shows "Recipe not found" with a link back to all recipes for an unknown id', () => {
    render(<RecipePage id="no-such-recipe" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Recipe not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All recipes' })).toHaveAttribute('href', '#/');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
