import { getRecipe } from '../data/recipes';
import { useFavourites } from '../store/favourites';
import RecipeCard from '../components/RecipeCard';

export default function FavouritesPage() {
  const { ids } = useFavourites();
  return (
    <>
      <h1>Favourites</h1>
      {ids.map((id) => {
        const recipe = getRecipe(id);
        return recipe && <RecipeCard key={id} recipe={recipe} />;
      })}
    </>
  );
}
