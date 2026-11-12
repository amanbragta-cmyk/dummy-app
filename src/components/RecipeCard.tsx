import type { Recipe } from '../types';
import FavouriteButton from './FavouriteButton';

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article>
      <h2>
        <a href={`#/recipe/${recipe.id}`}>{recipe.title}</a>
      </h2>
      <p>{recipe.minutes} min</p>
      <FavouriteButton recipeId={recipe.id} />
    </article>
  );
}
