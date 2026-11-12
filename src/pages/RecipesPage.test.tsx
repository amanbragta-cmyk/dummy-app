import { describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipesPage from './RecipesPage';
import { getRecipes } from '../data/recipes';

const VEGETARIAN = 'vegetarian';
const QUICK = 'under 30 min';

function openPage() {
  const user = userEvent.setup();
  render(<RecipesPage />);
  return user;
}

const cards = () => screen.queryAllByRole('article');
const cardTitles = () => cards().map((card) => within(card).getByRole('heading').textContent);
const tagChip = (name: string) =>
  within(screen.getByRole('group', { name: 'Filter by tag' })).getByRole('button', { name });
const countWithTags = (...tags: string[]) =>
  getRecipes().filter((recipe) => tags.every((tag) => recipe.tags.includes(tag))).length;

describe('RecipesPage', () => {
  it('shows every recipe as a card with its photo, title, minutes and tags', () => {
    openPage();
    const recipes = getRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(12);
    expect(cards()).toHaveLength(recipes.length);

    for (const recipe of recipes) {
      const card = screen.getByRole('heading', { name: recipe.title }).closest('article')!;
      expect(card.querySelector('img')).toHaveAttribute('src', recipe.image);
      expect(within(card).getByText(`${recipe.minutes} min`)).toBeInTheDocument();
      for (const tag of recipe.tags) expect(within(card).getByText(tag)).toBeInTheDocument();
    }
  });

  it('shows the favourite button on each card', () => {
    openPage();
    for (const card of cards()) {
      expect(within(card).getByRole('button', { name: 'Add to favourites' })).toBeInTheDocument();
    }
  });

  it('filters the cards as you type', async () => {
    const user = openPage();
    const search = screen.getByRole('searchbox', { name: 'Search recipes' });

    await act(() => user.type(search, 'chick'));
    expect(cardTitles()).toContain('Chickpea and spinach curry');
    expect(cardTitles()).not.toContain('Tomato and basil pasta');

    await act(() => user.type(search, 'PEA'));
    expect(cardTitles()).toEqual(['Chickpea and spinach curry']);
  });

  it('shows only recipes that have every chosen tag', async () => {
    const user = openPage();

    await act(() => user.click(tagChip(VEGETARIAN)));
    await act(() => user.click(tagChip(QUICK)));

    expect(tagChip(VEGETARIAN)).toHaveAttribute('aria-pressed', 'true');
    expect(cards()).toHaveLength(countWithTags(VEGETARIAN, QUICK));
    for (const card of cards()) {
      expect(within(card).getByText(VEGETARIAN)).toBeInTheDocument();
      expect(within(card).getByText(QUICK)).toBeInTheDocument();
    }
  });

  it('removes a tag from the filter when its chip is tapped again', async () => {
    const user = openPage();

    await act(() => user.click(tagChip(VEGETARIAN)));
    await act(() => user.click(tagChip(QUICK)));
    await act(() => user.click(tagChip(VEGETARIAN)));

    expect(tagChip(VEGETARIAN)).toHaveAttribute('aria-pressed', 'false');
    expect(cards()).toHaveLength(countWithTags(QUICK));
  });

  it('says "No recipes match" and offers to clear the search and tags', async () => {
    const user = openPage();

    await act(() => user.click(tagChip(VEGETARIAN)));
    await act(() => user.type(screen.getByRole('searchbox', { name: 'Search recipes' }), 'zzz'));

    expect(cards()).toHaveLength(0);
    expect(screen.getByText('No recipes match')).toBeInTheDocument();

    await act(() => user.click(screen.getByRole('button', { name: 'Clear search and tags' })));

    expect(screen.getByRole('searchbox', { name: 'Search recipes' })).toHaveValue('');
    expect(tagChip(VEGETARIAN)).toHaveAttribute('aria-pressed', 'false');
    expect(cards()).toHaveLength(getRecipes().length);
    expect(screen.queryByText('No recipes match')).not.toBeInTheDocument();
  });

  it('links each card to its recipe page', () => {
    openPage();
    const recipe = getRecipes()[0];
    expect(screen.getByRole('link', { name: recipe.title })).toHaveAttribute('href', `#/recipe/${recipe.id}`);
  });
});
