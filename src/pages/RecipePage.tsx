import { getRecipe } from '../data/recipes';
import type { Ingredient } from '../types';
import FavouriteButton from '../components/FavouriteButton';
import AddToListButton from '../components/AddToListButton';
import styles from './RecipePage.module.css';

const ALL_RECIPES_HREF = '#/';
const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 900;

function formatAmount({ quantity, unit }: Ingredient): string {
  if (quantity === null) return '';
  return unit ? `${quantity} ${unit}` : String(quantity);
}

function AllRecipesLink() {
  return (
    <a className={styles.back} href={ALL_RECIPES_HREF}>
      All recipes
    </a>
  );
}

export default function RecipePage({ id }: { id: string }) {
  const recipe = getRecipe(id);
  if (!recipe) {
    return (
      <div className={styles.missing}>
        <h1>Recipe not found</h1>
        <p>This recipe may have been renamed or removed.</p>
        <AllRecipesLink />
      </div>
    );
  }

  return (
    <article>
      <AllRecipesLink />

      <header className={styles.intro}>
        <img
          className={styles.photo}
          src={recipe.image}
          alt=""
          width={PHOTO_WIDTH}
          height={PHOTO_HEIGHT}
        />
        <div className={styles.summary}>
          <h1>{recipe.title}</h1>
          <p className={styles.lede}>{recipe.summary}</p>
          <p className={styles.facts}>
            <span>{recipe.minutes} min</span>
            <span>Serves {recipe.servings}</span>
          </p>
          <div className={styles.actions}>
            <AddToListButton recipe={recipe} />
            <FavouriteButton recipeId={recipe.id} />
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <section aria-labelledby="ingredients">
          <h2 id="ingredients">Ingredients</h2>
          <ul className={styles.ingredients} role="list" aria-labelledby="ingredients">
            {recipe.ingredients.map((ingredient) => {
              const amount = formatAmount(ingredient);
              return (
                <li key={ingredient.name}>
                  {amount && <span className={styles.amount}>{amount} </span>}
                  {ingredient.name}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="method">
          <h2 id="method">Method</h2>
          <ol className={styles.steps} role="list" aria-labelledby="method">
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
