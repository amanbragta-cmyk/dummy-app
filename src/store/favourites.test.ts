import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const KEY = 'recipebook.favourites.v1';

// The store reads localStorage once, when the module loads: a fresh import is a reload.
async function load() {
  vi.resetModules();
  const { useFavourites } = await import('./favourites');
  return renderHook(() => useFavourites()).result;
}

describe('useFavourites', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no favourites when nothing is saved', async () => {
    const favourites = await load();
    expect(favourites.current.ids).toEqual([]);
  });

  it('favourites a recipe, then removes it on the second toggle', async () => {
    const favourites = await load();

    act(() => favourites.current.toggle('pesto-pasta'));
    expect(favourites.current.isFavourite('pesto-pasta')).toBe(true);

    act(() => favourites.current.toggle('pesto-pasta'));
    expect(favourites.current.isFavourite('pesto-pasta')).toBe(false);
    expect(favourites.current.ids).toEqual([]);
  });

  it('saves every change as a JSON list of ids', async () => {
    const favourites = await load();

    act(() => favourites.current.toggle('a'));
    act(() => favourites.current.toggle('b'));
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['a', 'b']);

    act(() => favourites.current.toggle('a'));
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['b']);
  });

  it('keeps favourites across a reload', async () => {
    const before = await load();
    act(() => before.current.toggle('pesto-pasta'));

    const after = await load();
    expect(after.current.ids).toEqual(['pesto-pasta']);
  });

  it.each([
    ['broken JSON', '{not json'],
    ['an object', '{"ids":["a"]}'],
    ['a string', '"a"'],
    ['null', 'null'],
    ['a list with a non-string', '["a", 2]'],
  ])('treats %s as no favourites', async (_, saved) => {
    localStorage.setItem(KEY, saved);
    const favourites = await load();
    expect(favourites.current.ids).toEqual([]);
  });
});
