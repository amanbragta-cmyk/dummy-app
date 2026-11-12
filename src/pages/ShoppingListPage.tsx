import { useShoppingList, type ShoppingItem } from '../store/shoppingList';
import styles from './ShoppingListPage.module.css';

// "800 g", "2" for "2 eggs", or "some" when a recipe gave no quantity.
function formatAmount({ quantity, unit }: ShoppingItem) {
  if (quantity === null) return 'some';
  return unit ? `${quantity} ${unit}` : `${quantity}`;
}

export default function ShoppingListPage() {
  const { items, toggle, remove, clearChecked } = useShoppingList();
  const tickedCount = items.filter((item) => item.checked).length;

  if (items.length === 0) {
    return (
      <section className={styles.page}>
        <h1>Shopping list</h1>
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Your list is empty</p>
          <p>Open a recipe and add its ingredients to start a list.</p>
          <a href="#/">All recipes</a>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <h1>Shopping list</h1>
        <p className={styles.count}>
          {items.length - tickedCount} of {items.length} to buy
        </p>
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.key} className={styles.item} data-checked={item.checked}>
            <label className={styles.label}>
              <input
                type="checkbox"
                className={styles.tick}
                checked={item.checked}
                onChange={() => toggle(item.key)}
              />
              <span className={styles.amount}>{formatAmount(item)}</span> <span className={styles.name}>{item.name}</span>
            </label>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${item.name}`}
              onClick={() => remove(item.key)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.clear} disabled={tickedCount === 0} onClick={clearChecked}>
        Clear ticked
      </button>
    </section>
  );
}
