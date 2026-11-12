import { useState } from 'react';
import { getRecipes } from '../data/recipes';
import { listTags, searchRecipes } from '../lib/search';
import RecipeCard from '../components/RecipeCard';
import styles from './RecipesPage.module.css';

const recipes = getRecipes();
const tags = listTags(recipes);

function describeCount(shown: number) {
  if (shown === recipes.length) return `${shown} recipes`;
  return `${shown} of ${recipes.length} recipes`;
}

export default function RecipesPage() {
  const [query, setQuery] = useState('');
  const [chosenTags, setChosenTags] = useState<string[]>([]);
  const found = searchRecipes(recipes, query, chosenTags);

  function toggleTag(tag: string) {
    setChosenTags((chosen) => (chosen.includes(tag) ? chosen.filter((t) => t !== tag) : [...chosen, tag]));
  }

  function clearFilters() {
    setQuery('');
    setChosenTags([]);
  }

  return (
    <>
      <h1>Recipes</h1>
      <div className={styles.filters}>
        <input
          className={styles.search}
          type="search"
          aria-label="Search recipes"
          placeholder="Search by dish, ingredient or tag"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles.chips} role="group" aria-label="Filter by tag">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.chip}
              aria-pressed={chosenTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count} role="status">
        {found.length > 0 && describeCount(found.length)}
      </p>

      {found.length > 0 ? (
        <div className={styles.grid}>
          {found.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No recipes match</p>
          <p>Try another word, or fewer tags.</p>
          <button type="button" className={styles.clear} onClick={clearFilters}>
            Clear search and tags
          </button>
        </div>
      )}
    </>
  );
}
