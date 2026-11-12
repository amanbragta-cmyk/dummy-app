import { describe, expect, it } from 'vitest';
import type { Recipe } from '../types';
import { listTags, searchRecipes } from './search';

function recipe(id: string, title: string, tags: string[], ingredients: string[]): Recipe {
  return {
    id,
    title,
    summary: '',
    image: `images/${id}.jpg`,
    tags,
    minutes: 20,
    servings: 2,
    ingredients: ingredients.map((name) => ({ name, quantity: 1, unit: '' })),
    steps: [],
  };
}

const curry = recipe('curry', 'Chickpea curry', ['vegetarian', 'under 30 min'], ['chickpeas', 'onion']);
const chicken = recipe('chicken', 'Roast chicken', ['one tray'], ['chicken thighs', 'lemon']);
const pasta = recipe('pasta', 'Tomato pasta', ['vegetarian'], ['spaghetti', 'basil']);
const recipes = [curry, chicken, pasta];

const ids = (found: Recipe[]) => found.map((r) => r.id);

describe('searchRecipes', () => {
  it('returns every recipe for an empty query and no tags', () => {
    expect(ids(searchRecipes(recipes, '', []))).toEqual(['curry', 'chicken', 'pasta']);
  });

  it('treats a query of only spaces as empty', () => {
    expect(searchRecipes(recipes, '   ', [])).toHaveLength(3);
  });

  it('matches a title', () => {
    expect(ids(searchRecipes(recipes, 'roast', []))).toEqual(['chicken']);
  });

  it('matches an ingredient name', () => {
    expect(ids(searchRecipes(recipes, 'basil', []))).toEqual(['pasta']);
  });

  it('matches a tag', () => {
    expect(ids(searchRecipes(recipes, 'one tray', []))).toEqual(['chicken']);
  });

  it('ignores upper and lower case', () => {
    expect(ids(searchRecipes(recipes, 'CHICKPEA', []))).toEqual(['curry']);
    expect(ids(searchRecipes(recipes, 'Lemon', []))).toEqual(['chicken']);
  });

  it('ignores spaces around the query', () => {
    expect(ids(searchRecipes(recipes, '  pasta ', []))).toEqual(['pasta']);
  });

  it('keeps only recipes that have every chosen tag', () => {
    expect(ids(searchRecipes(recipes, '', ['vegetarian']))).toEqual(['curry', 'pasta']);
    expect(ids(searchRecipes(recipes, '', ['vegetarian', 'under 30 min']))).toEqual(['curry']);
  });

  it('applies the query and the tags together', () => {
    expect(ids(searchRecipes(recipes, 'tomato', ['vegetarian']))).toEqual(['pasta']);
    expect(ids(searchRecipes(recipes, 'chicken', ['vegetarian']))).toEqual([]);
  });

  it('returns nothing when nothing matches', () => {
    expect(searchRecipes(recipes, 'tofu', [])).toEqual([]);
  });
});

describe('listTags', () => {
  it('lists each tag once, in alphabetical order', () => {
    expect(listTags(recipes)).toEqual(['one tray', 'under 30 min', 'vegetarian']);
  });

  it('lists no tags for no recipes', () => {
    expect(listTags([])).toEqual([]);
  });
});
