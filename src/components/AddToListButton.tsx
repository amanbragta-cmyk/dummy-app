import type { Recipe } from '../types';
import { useShoppingList } from '../store/shoppingList';
import styles from './AddToListButton.module.css';

export default function AddToListButton({ recipe }: { recipe: Recipe }) {
  const { hasRecipe, addRecipe } = useShoppingList();
  const added = hasRecipe(recipe.id);
  return (
    <button type="button" className={styles.button} disabled={added} onClick={() => addRecipe(recipe)}>
      {added ? 'On your list' : 'Add to shopping list'}
    </button>
  );
}
