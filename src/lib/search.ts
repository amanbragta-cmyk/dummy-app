import type { Recipe } from '../types';

function searchableText(recipe: Recipe): string {
  return [recipe.title, ...recipe.tags, ...recipe.ingredients.map((ingredient) => ingredient.name)]
    .join('\n')
    .toLowerCase();
}

/** Recipes whose title, an ingredient or a tag contains the query, and that have every chosen tag. */
export function searchRecipes(recipes: Recipe[], query: string, tags: string[]): Recipe[] {
  const needle = query.trim().toLowerCase();
  return recipes.filter(
    (recipe) =>
      tags.every((tag) => recipe.tags.includes(tag)) && (!needle || searchableText(recipe).includes(needle)),
  );
}

export function listTags(recipes: Recipe[]): string[] {
  return [...new Set(recipes.flatMap((recipe) => recipe.tags))].sort();
}
