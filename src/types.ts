export interface Ingredient {
  name: string;
  /** null for amounts like "a pinch" or "to taste". */
  quantity: number | null;
  /** '' when the ingredient is counted, as in "2 eggs". */
  unit: string;
}

export interface Recipe {
  /** URL slug, used in #/recipe/:id. */
  id: string;
  title: string;
  summary: string;
  /** Path under public/images. */
  image: string;
  tags: string[];
  minutes: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
}
