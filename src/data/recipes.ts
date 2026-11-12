import type { Recipe } from '../types';
import recipes from './recipes.json';

const all: Recipe[] = recipes;

export function getRecipes(): Recipe[] {
  return all;
}

export function getRecipe(id: string): Recipe | undefined {
  return all.find((recipe) => recipe.id === id);
}
