import { useShoppingList } from '../store/shoppingList';

export default function ShoppingListPage() {
  const { items } = useShoppingList();
  return (
    <>
      <h1>Shopping list</h1>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.quantity} {item.unit} {item.name}
          </li>
        ))}
      </ul>
    </>
  );
}
