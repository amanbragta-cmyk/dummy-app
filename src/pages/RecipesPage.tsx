import { getRecipes } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';

export default function RecipesPage() {
  return (
    <>
      <h1>Recipes</h1>
      {getRecipes().map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </>
  );
}
