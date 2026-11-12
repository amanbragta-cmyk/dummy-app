import { useFavourites } from '../store/favourites';
import styles from './FavouriteButton.module.css';

const HEART =
  'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z';

export default function FavouriteButton({ recipeId }: { recipeId: string }) {
  const { isFavourite, toggle } = useFavourites();
  const on = isFavourite(recipeId);
  return (
    <button
      type="button"
      className={on ? `${styles.button} ${styles.on}` : styles.button}
      aria-label={on ? 'Remove from favourites' : 'Add to favourites'}
      onClick={() => toggle(recipeId)}
    >
      <svg className={styles.heart} viewBox="0 0 24 24" aria-hidden="true">
        <path d={HEART} />
      </svg>
    </button>
  );
}
