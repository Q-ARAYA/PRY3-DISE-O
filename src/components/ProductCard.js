import React from 'react';
import './ProductCard.css';
import { useCarrito } from '../context/CarritoContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { id, name, price, originalPrice, rating, image, discount } = product;
  const { agregarProducto, productos: productosEnCarrito = [] } = useCarrito();
  
  // Compatibilidad con diferentes estructuras de datos
  const productName = name || product.nombre;
  const productImage = image || product.imagen;

  const handleAgregarCarrito = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Intentando agregar producto:', product);
    const resultado = agregarProducto(product, 1);
    console.log('Resultado:', resultado);
    
    if (resultado.exito) {
      console.log('✅ Producto agregado exitosamente:', productName);
    } else {
      console.error('❌ Error:', resultado.mensaje);
      alert(resultado.mensaje);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? 'star filled' : 'star'}
          aria-hidden="true"
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <article className="product-card">
      {discount && (
        <span className="product-badge" aria-label={`${discount}% de descuento`}>
          -{discount}%
        </span>
      )}

      {/* Badge para indicar decoradores aplicados en el carrito */}
      {(() => {
        const item = productosEnCarrito.find(pi => String(pi.id) === String(id));
        if (item && item.decoratorsApplied && item.decoratorsApplied.length > 0) {
          return (
            <span className="decorator-badge" aria-label="Opciones aplicadas">
              ✨ Opciones
            </span>
          );
        }
        return null;
      })()}

      <Link to={`/producto/${id}`} className="product-image-link">
        <img
          src={productImage}
          alt={productName}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300/27AE60/ffffff?text=Producto';
          }}
        />
      </Link>

      <div className="product-info">
        <Link to={`/producto/${id}`} className="product-name">
          <h3>{productName}</h3>
        </Link>

        <div className="product-rating" role="img" aria-label={`Calificación: ${rating} de 5 estrellas`}>
          {renderStars(rating)}
          <span className="rating-count">({rating})</span>
        </div>

        <div className="product-price">
          {originalPrice && (
            <span className="original-price" aria-label={`Precio original: $${originalPrice}`}>
              ${originalPrice}
            </span>
          )}
          <span className="current-price" aria-label={`Precio actual: $${price}`}>
            ${price}
          </span>
        </div>

        <button className="add-to-cart-btn" aria-label={`Agregar ${productName} al carrito`} onClick={handleAgregarCarrito}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="9" cy="21" r="1" strokeWidth="2"/>
            <circle cx="20" cy="21" r="1" strokeWidth="2"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2"/>
          </svg>
          Agregar al Carrito
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
