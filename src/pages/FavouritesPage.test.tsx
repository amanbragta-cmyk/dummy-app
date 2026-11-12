import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getRecipes } from '../data/recipes';

const KEY = 'recipebook.favourites.v1';
const LIST = 'Favourite recipes';
const [first, second, third] = getRecipes();

// The card's own markup is T2's, so a card is found as one entry of the page's list.
function cards() {
  return Array.from(screen.queryByRole('list', { name: LIST })?.children ?? []) as HTMLElement[];
}

// The page and the button imported fresh share one fresh store, as after a reload.
async function openFresh(saved?: string) {
  if (saved !== undefined) localStorage.setItem(KEY, saved);
  vi.resetModules();
  const { default: FavouritesPage } = await import('./FavouritesPage');
  const { default: FavouriteButton } = await import('../components/FavouriteButton');
  return { FavouritesPage, FavouriteButton };
}

describe('FavouritesPage', () => {
  beforeEach(() => localStorage.clear());

  it('says "No favourites yet" with a link to all recipes when there are none', async () => {
    const { FavouritesPage } = await openFresh();
    render(<FavouritesPage />);

    expect(screen.getByText('No favourites yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse all recipes' })).toHaveAttribute('href', '#/');
  });

  it('lists every favourited recipe as a card', async () => {
    const { FavouritesPage } = await openFresh(JSON.stringify([first.id, third.id]));
    render(<FavouritesPage />);

    const [one, two, ...rest] = cards();
    expect(rest).toEqual([]);
    expect(within(one).getByText(first.title)).toBeInTheDocument();
    expect(within(two).getByText(third.title)).toBeInTheDocument();
    expect(screen.queryByText(second.title)).not.toBeInTheDocument();
    expect(screen.queryByText('No favourites yet')).not.toBeInTheDocument();
  });

  it('skips a saved id that is no longer a recipe', async () => {
    const { FavouritesPage } = await openFresh(JSON.stringify(['gone', first.id]));
    render(<FavouritesPage />);

    expect(cards()).toHaveLength(1);
  });

  it('treats malformed saved favourites as none, without a crash', async () => {
    const { FavouritesPage } = await openFresh('[[[');
    render(<FavouritesPage />);

    expect(screen.getByText('No favourites yet')).toBeInTheDocument();
  });

  it('removes a card when its filled heart is tapped', async () => {
    const user = userEvent.setup();
    const { FavouritesPage } = await openFresh(JSON.stringify([first.id]));
    render(<FavouritesPage />);

    await act(() => user.click(screen.getByRole('button', { name: 'Remove from favourites' })));

    expect(cards()).toEqual([]);
    expect(screen.getByText('No favourites yet')).toBeInTheDocument();
  });
});

describe('FavouriteButton', () => {
  beforeEach(() => localStorage.clear());

  it('favourites the recipe from an empty heart, and its label says so', async () => {
    const user = userEvent.setup();
    const { FavouriteButton } = await openFresh();
    render(<FavouriteButton recipeId={first.id} />);

    await act(() => user.click(screen.getByRole('button', { name: 'Add to favourites' })));

    expect(screen.getByRole('button', { name: 'Remove from favourites' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([first.id]);
  });

  it('keeps every heart for one recipe in step, and leaves other recipes alone', async () => {
    const user = userEvent.setup();
    const { FavouritesPage, FavouriteButton } = await openFresh();
    render(
      <>
        <FavouriteButton recipeId={first.id} />
        <FavouriteButton recipeId={first.id} />
        <FavouriteButton recipeId={second.id} />
        <FavouritesPage />
      </>,
    );

    await act(() => user.click(screen.getAllByRole('button', { name: 'Add to favourites' })[0]));

    // the two hearts above, plus the one on the card that just appeared
    expect(screen.getAllByRole('button', { name: 'Remove from favourites' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Add to favourites' })).toHaveLength(1);
    expect(cards()).toHaveLength(1);
  });
});
