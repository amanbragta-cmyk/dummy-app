import type { Recipe } from '../types';

export function searchRecipes(recipes: Recipe[], _query: string, _tags: string[]): Recipe[] {
  return recipes;
}

export function listTags(_recipes: Recipe[]): string[] {
  return [];
}
