import { useSyncExternalStore } from 'react';
import RecipesPage from './pages/RecipesPage';
import RecipePage from './pages/RecipePage';
import FavouritesPage from './pages/FavouritesPage';
import ShoppingListPage from './pages/ShoppingListPage';

const NAV = [
  { href: '#/', label: 'Recipes' },
  { href: '#/favourites', label: 'Favourites' },
  { href: '#/list', label: 'Shopping list' },
];

const RECIPE_ROUTE = /^#\/recipe\/([^/]+)$/;

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function useHash() {
  return useSyncExternalStore(subscribe, () => window.location.hash || '#/');
}

// Anyone can type or link any hash: a malformed escape must not take the whole app down.
function decodeId(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return '';
  }
}

function Page({ hash }: { hash: string }) {
  const recipe = RECIPE_ROUTE.exec(hash);
  if (recipe) return <RecipePage id={decodeId(recipe[1])} />;
  if (hash === '#/favourites') return <FavouritesPage />;
  if (hash === '#/list') return <ShoppingListPage />;
  return <RecipesPage />;
}

export default function App() {
  const hash = useHash();
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#/">
          Recipe book
        </a>
        <nav aria-label="Main">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href} aria-current={hash === href ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
      </header>
      <main className="site-main">
        <Page hash={hash} />
      </main>
    </>
  );
}
