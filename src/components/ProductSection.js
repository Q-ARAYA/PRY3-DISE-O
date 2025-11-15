import React from 'react';
import ProductCard from './ProductCard';
import './ProductSection.css';

const ProductSection = ({ title, products }) => {
  return (
    <section className="product-section" aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="product-section-container">
        <h2 id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`} className="section-title">
          {title}
        </h2>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="section-footer">
          <a href={`/productos/${title.toLowerCase().replace(/\s+/g, '-')}`} className="view-all-btn">
            Ver Todos
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
