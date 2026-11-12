import { useFavourites } from '../store/favourites';

export default function FavouriteButton({ recipeId }: { recipeId: string }) {
  const { isFavourite, toggle } = useFavourites();
  const on = isFavourite(recipeId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Remove from favourites' : 'Add to favourites'}
      onClick={() => toggle(recipeId)}
    >
      {on ? '♥' : '♡'}
    </button>
  );
}
