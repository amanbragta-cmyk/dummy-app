# Changelog

## v1.0.0 (2026-11-13)

The first release of the recipe book, published on GitHub Pages at
https://amanbragta-cmyk.github.io/dummy-app/.

- Browse all 12 recipes, each with a photo, and search them by title, ingredient or tag.
- Filter the list by tag, such as "vegetarian" or "under 30 min".
- Open a recipe to see its photo, time, servings, ingredients with quantities and numbered steps.
- Heart a recipe to keep it on the Favourites page.
- Add a recipe's ingredients to a shopping list that combines repeated ingredients; tick items off and clear the ticked ones.
- Favourites and the shopping list are saved in this browser only, and survive a reload.
- Works on a phone, tablet or desktop (checked at 390, 820 and 1280 wide).

Recipe photos are from Wikimedia Commons, credited in `public/images/CREDITS.md`.

### Rolling back

The site is static and keeps no data on a server: favourites and shopping lists
live in each visitor's browser and are not touched by a rollback.

- To go back to an earlier version, run the deploy workflow on that version's tag:
  `gh workflow run deploy.yml --ref v<earlier version>` (or Actions → Deploy to
  GitHub Pages → Run workflow, and pick the tag).
- v1.0.0 is the first release, so there is no earlier version. To take it down,
  use Settings → Pages → Unpublish site, or turn Pages off.
