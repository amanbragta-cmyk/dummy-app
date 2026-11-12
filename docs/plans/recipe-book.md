# Recipe book with search, favourites and a shopping list
Plan id: recipe-book
Type: story

## Done means
- A cook can browse every recipe, search by title, ingredient or tag, and filter by tag on a phone, tablet or desktop.
- A cook can open a recipe and see its photo, time, servings, ingredients with quantities and numbered steps.
- A cook can heart a recipe and find it on the Favourites page, still there after a reload.
- A cook can add a recipe's ingredients to a shopping list that combines repeats, tick items off and clear the ticked ones, still there after a reload.
- `npm test` passes and every journey in docs/journeys.md walks cleanly at 390, 820 and 1280 wide.
- The app is live on GitHub Pages.

## Architecture
- database: none; recipes ship in src/data/recipes.json; favourites and the shopping list are kept in the browser's localStorage under versioned keys (recipebook.favourites.v1, recipebook.shoppingList.v1)
- server: not needed, because it is a static site built by Vite
- hosting: GitHub Pages, built and published by a GitHub Actions workflow
- accounts: not needed, because each browser keeps its own favourites and list; nobody signs in
- services: none
- devices: phone first (390 wide), tablet (820) and desktop (1280); current Chrome, Safari, Firefox and Edge
- look: for home cooks; clean and minimal; white background, generous space, one green accent; photo-led recipe cards; system font stack; no pop-ups, modals or dark patterns
- security: no trust boundary: no sign-in, no server, no other person's data; localStorage is parsed defensively (anything malformed is treated as empty, never a crash); no dangerouslySetInnerHTML; images are our own files under public/images
- scale: one person per browser; up to about 100 recipes, searched in memory
- testing: Vitest with Testing Library and jsdom (`npm test`); screens proved with `engine journey prove` at 390, 820 and 1280 wide
- release: a version tag on main runs the GitHub Actions workflow, which builds and publishes to GitHub Pages; rollback is re-running the workflow on the previous tag
- queues: not needed, because there is no background work
- monitoring: not needed for v1, because it is a static site with no server; console errors are checked in every journey proof
- backups: not needed, because recipes live in git and the only user data is each browser's own localStorage (clearing site data loses it; said in the app's footer)

## Decisions
- D1 Browser only: recipes bundled as JSON, favourites and shopping list in localStorage, no server and no sign-in. (by aman)
- D2 React + Vite + TypeScript. New packages: react, react-dom, vite, @vitejs/plugin-react, typescript, vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom. (by aman)
- D3 Published on GitHub Pages by a GitHub Actions workflow. (by aman)
- D4 Clean minimal look: white, generous space, one green accent, photo-led cards. (by aman)
- D5 Hash routes (#/, #/recipe/:id, #/favourites, #/list) handled in App.tsx, no router package: they work on GitHub Pages with no 404 tricks. (by builder-1a5113)
- D6 One CSS Module per component or page, next to it, plus global tokens in src/index.css, so parallel tasks never share a stylesheet. (by builder-1a5113)
- D7 The split: aman takes the recipes lane (T1 scaffold, T2 browse and search, T3 recipe page, T7 release); kamal takes the favourites and shopping list lane (T4, T5) and joins it all up (T6). (by aman)

## Joins
- J1 Recipe data, in src/types.ts and read only through src/data/recipes.ts: `Recipe { id: string (url slug), title: string, summary: string, image: string (path under public/images), tags: string[], minutes: number, servings: number, ingredients: Ingredient[], steps: string[] }`, `Ingredient { name: string, quantity: number | null, unit: string }` ('' unit for "2 eggs"). Functions: `getRecipes(): Recipe[]`, `getRecipe(id: string): Recipe | undefined`.
- J2 Favourites, in src/store/favourites.ts: `useFavourites(): { ids: string[], isFavourite(id: string): boolean, toggle(id: string): void }`, backed by one module-level store read with useSyncExternalStore so every heart on screen agrees at once; localStorage key recipebook.favourites.v1 holds a JSON string[]. Component `<FavouriteButton recipeId={string} />` (src/components/FavouriteButton.tsx).
- J3 Shopping list, in src/store/shoppingList.ts: `ShoppingItem { key: string (lowercased name + '|' + lowercased unit), name: string, quantity: number | null, unit: string, checked: boolean, recipeIds: string[] }`; `useShoppingList(): { items: ShoppingItem[], hasRecipe(id: string): boolean, addRecipe(recipe: Recipe): void, toggle(key: string): void, remove(key: string): void, clearChecked(): void }`, same store pattern as J2; localStorage key recipebook.shoppingList.v1 holds a JSON ShoppingItem[]. Component `<AddToListButton recipe={Recipe} />` (src/components/AddToListButton.tsx).
- J4 Screens, routed in src/App.tsx by hash: `#/` -> default export of src/pages/RecipesPage.tsx (no props), `#/recipe/:id` -> src/pages/RecipePage.tsx `({ id: string })`, `#/favourites` -> src/pages/FavouritesPage.tsx (no props), `#/list` -> src/pages/ShoppingListPage.tsx (no props). Header nav links: Recipes, Favourites, Shopping list.
- J5 Recipe card: `<RecipeCard recipe={Recipe} />` (src/components/RecipeCard.tsx) links to #/recipe/:id and shows a FavouriteButton; RecipesPage and FavouritesPage both render it.

## Tasks
- T1 Scaffold the app and stub every join | 1d | type: task | points: 3 | files: package.json, package-lock.json, index.html, vite.config.ts, tsconfig.json, tsconfig.node.json, vitest.setup.ts, .gitignore, .github/workflows/deploy.yml, docs/joins.md, src/main.tsx, src/App.tsx, src/App.test.tsx, src/index.css, src/types.ts, src/data/recipes.ts, src/data/recipes.json, src/store/, src/components/, src/pages/ | rests on: D1, D2, D3, D5, D6, J1, J2, J3, J4, J5 | check: `npm run build && npm test`
  Lane: aman. Vite + React + TS app with Vitest (jsdom, Testing Library) and `npm test` = `vitest run`; vite base set for GitHub Pages.
  Write docs/joins.md from J1-J5. Create src/types.ts and src/data/recipes.ts exactly as J1 with 3 seed recipes in recipes.json.
  Create every J2-J5 file as a working stub with the agreed signature (pages show their title, buttons render a plain button, stores keep state in memory), so both lanes build against real imports from day one.
  App.tsx does the hash routing and header nav of J4; index.css holds the colour, space and type tokens of the look. Add the Pages deploy workflow (runs on a v* tag).
  accept: `npm run build` passes on a fresh clone after `npm ci`
  accept: `npm test` passes on a fresh clone after `npm ci`
  accept: #/ shows the recipes page
  accept: #/recipe/<a seed id> shows the recipe page
  accept: #/favourites shows the favourites page
  accept: #/list shows the shopping list page
  accept: the header nav moves between the three main pages
  accept: docs/joins.md states J1-J5 as written in this plan
- T2 Browse and search recipes | 2d | type: story | points: 5 | needs: T1 | files: src/data/recipes.json, public/images/, src/lib/search.ts, src/lib/search.test.ts, src/components/RecipeCard.tsx, src/components/RecipeCard.module.css, src/pages/RecipesPage.tsx, src/pages/RecipesPage.module.css, src/pages/RecipesPage.test.tsx | rests on: J1, J4, J5, D4, D6 | check: `npx vitest run src/lib src/pages/RecipesPage.test.tsx`
  Lane: aman. At least 12 real recipes with photos. search.ts is a pure function (recipes, query, tags) -> recipes. The card shows the FavouriteButton from J2 without changing it.
  accept: the home page shows every recipe as a card with its photo, title, minutes and tags
  accept: typing in search filters the cards as you type
  accept: search matches a recipe's title
  accept: search matches an ingredient name
  accept: search matches a tag
  accept: search ignores upper and lower case
  accept: choosing tag chips shows only recipes that have every chosen tag
  accept: tapping a chosen tag chip again removes that tag from the filter
  accept: when nothing matches, the page says "No recipes match" with a button that clears the search and tags
  accept: tapping a card opens that recipe's page
- T3 Recipe page | 1d | type: story | points: 3 | needs: T1 | files: src/pages/RecipePage.tsx, src/pages/RecipePage.module.css, src/pages/RecipePage.test.tsx | rests on: J1, J2, J3, J4, D4, D6 | check: `npx vitest run src/pages/RecipePage.test.tsx`
  Lane: aman. Uses FavouriteButton (J2) and AddToListButton (J3) as they are, without changing them.
  accept: a recipe's page shows its photo
  accept: a recipe's page shows its title
  accept: a recipe's page shows how many minutes it takes
  accept: a recipe's page shows how many it serves
  accept: a recipe's page lists every ingredient with its quantity and unit
  accept: a recipe's page shows the steps as a numbered list
  accept: a recipe's page shows the heart for that recipe
  accept: a recipe's page shows the "Add to shopping list" button for that recipe
  accept: an unknown recipe id shows "Recipe not found" with a link back to all recipes
  accept: a "All recipes" link goes back to the home page
- T4 Favourites | 1d | type: story | points: 3 | needs: T1 | files: src/store/favourites.ts, src/store/favourites.test.ts, src/components/FavouriteButton.tsx, src/components/FavouriteButton.module.css, src/pages/FavouritesPage.tsx, src/pages/FavouritesPage.module.css, src/pages/FavouritesPage.test.tsx | rests on: J1, J2, J5, D1, D4, D6 | check: `npx vitest run src/store/favourites.test.ts src/pages/FavouritesPage.test.tsx`
  Lane: kamal. Replace the T1 stubs with the real store and screens; keep the J2 signature. FavouritesPage renders RecipeCard (J5) as it is.
  accept: tapping an empty heart favourites the recipe
  accept: tapping a filled heart removes the recipe from favourites
  accept: every heart for one recipe on screen agrees at once
  accept: the heart has an accessible label that says whether the recipe is a favourite
  accept: the Favourites page lists every favourited recipe as a card
  accept: favourites are still there after a reload
  accept: with no favourites, the page says "No favourites yet" with a link to all recipes
  accept: malformed saved favourites are treated as no favourites without a crash
- T5 Shopping list | 2d | type: story | points: 5 | needs: T1 | files: src/store/shoppingList.ts, src/store/shoppingList.test.ts, src/components/AddToListButton.tsx, src/components/AddToListButton.module.css, src/pages/ShoppingListPage.tsx, src/pages/ShoppingListPage.module.css, src/pages/ShoppingListPage.test.tsx | rests on: J1, J3, D1, D4, D6 | check: `npx vitest run src/store/shoppingList.test.ts src/pages/ShoppingListPage.test.tsx`
  Lane: kamal. Replace the T1 stubs; keep the J3 signature. Items with the same key are combined: quantities summed, or kept as "some" when either is null.
  accept: "Add to shopping list" adds every ingredient of the recipe to the list
  accept: once a recipe is on the list its button reads "On your list"
  accept: tapping "On your list" adds nothing more
  accept: the same ingredient in the same unit from two recipes shows as one line with the quantities added up
  accept: each item shows its quantity with its unit before its name
  accept: an item can be ticked
  accept: a ticked item can be unticked
  accept: an item can be removed
  accept: "Clear ticked" removes only the ticked items
  accept: the list is the same after a reload
  accept: an empty list says "Your list is empty" with a link to all recipes
  accept: a malformed saved list is treated as an empty list without a crash
- T6 Join it all up and walk every journey | 1d | type: task | points: 2 | needs: T2, T3, T4, T5 | files: src/App.tsx, src/App.test.tsx, src/index.css | rests on: J4, D4 | check: `npm run build && npm test`
  Lane: kamal. Walk J01-J05 in docs/journeys.md at 390, 820 and 1280 wide and fix the seams between lanes. Add the shopping list count to the header nav, and the footer line that says favourites and the list live in this browser.
  accept: every journey J01-J05 walks cleanly at 390, 820 and 1280 wide
  accept: no console errors appear while walking the journeys
  accept: the header shows how many unticked items are on the shopping list
  accept: `npm run build && npm test` pass
- T7 Publish to GitHub Pages | 4h | type: task | points: 1 | needs: T6 | kind: release | files: CHANGELOG.md | rests on: D3
  Lane: aman. Tag v1.0.0 on main and let the workflow publish it; the owner pushes.
  accept: the app is live at the repo's GitHub Pages address
  accept: journeys J01-J05 walk on the live site
  accept: CHANGELOG.md has the v1.0.0 notes
  accept: CHANGELOG.md says how to roll back
