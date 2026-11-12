import type { Recipe } from '../types';
import { useShoppingList } from '../store/shoppingList';

export default function AddToListButton({ recipe }: { recipe: Recipe }) {
  const { hasRecipe, addRecipe } = useShoppingList();
  const added = hasRecipe(recipe.id);
  return (
    <button type="button" disabled={added} onClick={() => addRecipe(recipe)}>
      {added ? 'On your list' : 'Add to shopping list'}
    </button>
  );
}
