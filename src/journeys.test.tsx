import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The journeys of docs/journeys.md, walked through the whole app. The stores read
// localStorage when first imported, so importing the app again is a page reload.
async function loadApp(hash: string) {
  cleanup();
  vi.resetModules();
  const { default: App } = await import('./App');
  window.location.hash = hash;
  render(<App />);
}

const nav = () => within(screen.getByRole('navigation', { name: 'Main' }));
const listItemNames = () => screen.queryAllByRole('checkbox').map((tick) => tick.closest('label')?.textContent);

describe('journeys', () => {
  beforeEach(() => localStorage.clear());

  it('J01 finds a recipe by an ingredient and opens it', async () => {
    const user = userEvent.setup();
    await loadApp('#/');
    await user.type(screen.getByRole('searchbox', { name: 'Search recipes' }), 'chickpea');
    await act(() => user.click(screen.getAllByRole('link', { name: /chickpea/i })[0]));

    expect(screen.getByRole('heading', { level: 1, name: 'Chickpea and spinach curry' })).toBeInTheDocument();
    expect(document.querySelector('article img')).toHaveAttribute('src', expect.stringContaining('chickpea'));
    expect(within(screen.getByRole('list', { name: 'Ingredients' })).getByText(/800 g/)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Method' }).tagName).toBe('OL');
  });

  it('J02 narrows recipes by two tags and clears them again', async () => {
    const user = userEvent.setup();
    await loadApp('#/');
    const all = screen.getAllByRole('article').length;
    const tags = within(screen.getByRole('group', { name: 'Filter by tag' }));

    await user.click(tags.getByRole('button', { name: 'vegetarian' }));
    await user.click(tags.getByRole('button', { name: 'under 30 min' }));
    expect(screen.getByRole('status')).toHaveTextContent(`6 of ${all} recipes`);

    await user.click(tags.getByRole('button', { name: 'vegetarian' }));
    await user.click(tags.getByRole('button', { name: 'under 30 min' }));
    expect(screen.getAllByRole('article')).toHaveLength(all);
  });

  it('J03 keeps a favourite after a reload', async () => {
    const user = userEvent.setup();
    await loadApp('#/recipe/shakshuka');
    await user.click(screen.getByRole('button', { name: 'Add to favourites' }));
    await act(() => user.click(nav().getByRole('link', { name: 'Favourites' })));
    expect(screen.getByRole('heading', { name: 'Shakshuka' })).toBeInTheDocument();

    await loadApp('#/favourites');
    expect(screen.getByRole('heading', { name: 'Shakshuka' })).toBeInTheDocument();
  });

  it('J04 combines two recipes on the shopping list and counts them in the header', async () => {
    const user = userEvent.setup();
    await loadApp('#/recipe/shakshuka');
    await user.click(screen.getByRole('button', { name: 'Add to shopping list' }));
    await act(() => user.click(nav().getByRole('link', { name: 'Recipes' })));
    await act(() => user.click(screen.getByRole('link', { name: 'Pancakes with berries' })));
    await user.click(screen.getByRole('button', { name: 'Add to shopping list' }));
    await act(() => user.click(nav().getByRole('link', { name: /^Shopping list/ })));

    const names = listItemNames();
    expect(names.filter((name) => name?.endsWith(' eggs'))).toEqual(['6 eggs']);
    expect(names.some((name) => name?.includes('plain flour'))).toBe(true);
    expect(names.some((name) => name?.includes('red pepper'))).toBe(true);
    expect(nav().getByRole('link', { name: `Shopping list, ${names.length} to buy` })).toBeInTheDocument();
  });

  it('J05 clears ticked items and they stay cleared after a reload', async () => {
    const user = userEvent.setup();
    await loadApp('#/recipe/greek-salad');
    await user.click(screen.getByRole('button', { name: 'Add to shopping list' }));
    await act(() => user.click(nav().getByRole('link', { name: /^Shopping list/ })));
    const before = listItemNames().length;

    await user.click(screen.getByRole('checkbox', { name: /tomatoes/ }));
    await user.click(screen.getByRole('checkbox', { name: /cucumber/ }));
    await user.click(screen.getByRole('button', { name: 'Clear ticked' }));
    expect(listItemNames()).toHaveLength(before - 2);

    await loadApp('#/list');
    expect(listItemNames()).toHaveLength(before - 2);
    expect(screen.queryByRole('checkbox', { name: /cucumber/ })).not.toBeInTheDocument();
  });
});
