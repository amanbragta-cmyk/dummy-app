import type { Recipe } from '../types';
import FavouriteButton from './FavouriteButton';
import styles from './RecipeCard.module.css';

// Every photo is cropped to 4:3 (public/images/CREDITS.md); the size stops the grid jumping as photos load.
const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 900;

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className={styles.card}>
      <img
        className={styles.photo}
        src={recipe.image}
        alt=""
        width={PHOTO_WIDTH}
        height={PHOTO_HEIGHT}
        loading="lazy"
      />
      <div className={styles.heading}>
        <h2 className={styles.title}>
          <a className={styles.link} href={`#/recipe/${recipe.id}`}>
            {recipe.title}
          </a>
        </h2>
        <div className={styles.favourite}>
          <FavouriteButton recipeId={recipe.id} />
        </div>
      </div>
      <p className={styles.minutes}>{recipe.minutes} min</p>
      <ul className={styles.tags} aria-label="Tags">
        {recipe.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </article>
  );
}
