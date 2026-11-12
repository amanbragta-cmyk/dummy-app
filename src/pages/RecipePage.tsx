import { getRecipe } from '../data/recipes';
import FavouriteButton from '../components/FavouriteButton';
import AddToListButton from '../components/AddToListButton';

export default function RecipePage({ id }: { id: string }) {
  const recipe = getRecipe(id);
  if (!recipe) {
    return (
      <>
        <h1>Recipe not found</h1>
        <a href="#/">All recipes</a>
      </>
    );
  }
  return (
    <>
      <h1>{recipe.title}</h1>
      <FavouriteButton recipeId={recipe.id} />
      <AddToListButton recipe={recipe} />
    </>
  );
}
