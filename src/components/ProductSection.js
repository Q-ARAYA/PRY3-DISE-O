import React from 'react';
import ProductCard from './ProductCard';
import './ProductSection.css';
import { Link } from 'react-router-dom';

const ProductSection = ({ title, products, categorySlug, isCategoryPage = false }) => {
  const sectionId = `section-${(title || '').replace(/\s+/g, '-').toLowerCase()}`;
  const slugFromTitle = (title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  const targetSlug = categorySlug || slugFromTitle;

  return (
    <section className="product-section" aria-labelledby={sectionId}>
      <div className="product-section-container">
        <h2 id={sectionId} className="section-title">
          {title}
        </h2>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!isCategoryPage && (
          <div className="section-footer">
            <Link to={`/categorias/${encodeURIComponent(targetSlug)}`} className="view-all-btn">
              Ver Todos
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
