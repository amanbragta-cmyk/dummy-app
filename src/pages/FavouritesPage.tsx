import { getRecipe } from '../data/recipes';
import { useFavourites } from '../store/favourites';
import RecipeCard from '../components/RecipeCard';
import type { Recipe } from '../types';
import styles from './FavouritesPage.module.css';

const ALL_RECIPES = '#/';

function EmptyFavourites() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No favourites yet</p>
      <p className={styles.emptyHint}>Tap the heart on any recipe and it will wait for you here.</p>
      <a className={styles.browse} href={ALL_RECIPES}>
        Browse all recipes
      </a>
    </div>
  );
}

export default function FavouritesPage() {
  const { ids } = useFavourites();
  // A saved id whose recipe was since removed from the book is skipped, not shown broken.
  const recipes = ids.map(getRecipe).filter((recipe): recipe is Recipe => recipe !== undefined);
  return (
    <>
      <h1>Favourites</h1>
      {recipes.length === 0 ? (
        <EmptyFavourites />
      ) : (
        <ul className={styles.grid} aria-label="Favourite recipes">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
