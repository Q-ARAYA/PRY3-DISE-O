import React from 'react';
import ProductCard from './ProductCardFixed';
import './ProductSection.css';
import { Link } from 'react-router-dom';

const ProductSection = ({ title, products, categorySlug, isCategoryPage = false, screenReaderEnabled }) => {
  const sectionId = `section-${(title || '').replace(/\s+/g, '-').toLowerCase()}`;
  const slugFromTitle = (title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  const targetSlug = categorySlug || slugFromTitle;

  const speakText = (text) => {
    if (!screenReaderEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  return (
    <section className="product-section" aria-labelledby={sectionId}>
      <div className="product-section-container">
        <h2 id={sectionId} className="section-title">
          {title}
        </h2>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} screenReaderEnabled={screenReaderEnabled} />
          ))}
        </div>

        {!isCategoryPage && (
          <div className="section-footer">
            <Link 
              to={`/categorias/${encodeURIComponent(targetSlug)}`} 
              className="view-all-btn"
              onMouseEnter={() => speakText(`Ver todos los productos de ${title}`)}
              onFocus={() => speakText(`Ver todos los productos de ${title}`)}
            >
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
