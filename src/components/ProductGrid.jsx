import { useMemo, useState } from 'react';
import products from '../data/products';
import storeConfig from '../config/storeConfig';
import ProductCard from './ProductCard';

export default function ProductGrid({ onAddToCart }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter products by category and search term.
  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' ||
        product.category === activeCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  // Reset search and category filters.
  const resetFilters = () => {
    setSearch('');
    setActiveCategory('All');
  };

  return (
    <section className="products-section" id="products">
      {/* Section heading */}
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURATED FOR YOU</p>

          <h2>Explore our collection</h2>

          <p className="section-description">
            Thoughtfully selected essentials for everyday life.
          </p>
        </div>

        <span className="product-result-count">
          {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {/* Search and category filters */}
      <div className="product-toolbar">
        <div className="category-filters">
          {storeConfig.categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-button ${
                activeCategory === category ? 'active' : ''
              }`}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <label className="search-box">
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products"
          />
        </label>
      </div>

      {/* Product list */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        /* Empty search results */
        <div className="empty-search">
          <h3>No products found</h3>

          <p>
            We couldn't find any products matching your search.
            Try another search term or category.
          </p>

          <button
            type="button"
            className="reset-filters-button"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}