import { useState } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import ProductGrid from './ProductGrid';
import { CATEGORIES } from '../lib/format';

export default function Catalog({ filter, onFilter, limit, title, titleAs: Title = 'h2' }) {
  const [search, setSearch] = useState('');

  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="catalog-head">
        <Title id="catalog-title" className="display catalog-title">{title}</Title>
        <div className="catalog-tools">
          <div className="tabs" role="group" aria-label="Filter by category">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                className={`tab${filter === key ? ' is-active' : ''}`}
                aria-pressed={filter === key}
                onClick={() => onFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="search">
            <MagnifyingGlass size={16} aria-hidden="true" />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              placeholder="Search products"
              value={search}
              maxLength={60}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </label>
        </div>
      </div>
      <ProductGrid filter={filter} limit={limit} search={search} />
    </section>
  );
}
