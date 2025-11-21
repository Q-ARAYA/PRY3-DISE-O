import React from 'react';
import './ProductCard.css';
import { useCarrito } from '../context/CarritoContext';
import { Link } from 'react-router-dom';
import Notifier from '../services/Notifier';

const ProductCard = ({ product, screenReaderEnabled }) => {
  const { id, name, price, originalPrice, rating, image, discount } = product;
  const { agregarProducto, productos: productosEnCarrito = [] } = useCarrito();

  const productName = name || product.nombre;
  const productImage = image || product.imagen;

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

  const handleAgregarCarrito = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const resultado = agregarProducto(product, 1);
    if (!resultado?.exito) {
      Notifier.error(resultado?.mensaje || 'No se pudo agregar el producto');
    } else {
      speakText(`${productName} agregado al carrito`);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star'} aria-hidden="true">★</span>
    ));
  };

  const decorated = (() => {
    const item = productosEnCarrito.find(pi => String(pi.id) === String(id));
    return item && item.decoratorsApplied && item.decoratorsApplied.length > 0;
  })();

  return (
    <article className="product-card">
      {discount && <span className="product-badge">-{discount}%</span>}
      {decorated && <span className="decorator-badge">✨ Opciones</span>}

      <Link 
        to={`/producto/${id}`} 
        className="product-image-link"
        onMouseEnter={() => speakText(`Producto: ${productName}, Precio: ${price} dólares`)}
        onFocus={() => speakText(`Producto: ${productName}, Precio: ${price} dólares`)}
      >
        <img
          src={productImage}
          alt={productName}
          className="product-image"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300/27AE60/ffffff?text=Producto'; }}
        />
      </Link>

      <div className="product-info">
        <Link 
          to={`/producto/${id}`} 
          className="product-name"
          onMouseEnter={() => speakText(productName)}
          onFocus={() => speakText(productName)}
        >
          <h3>{productName}</h3>
        </Link>
        <div className="product-rating" aria-label={`Calificación: ${rating} de 5 estrellas`}>
          {renderStars(rating)} <span className="rating-count">({rating})</span>
        </div>

        <div className="product-price">
          {originalPrice && <span className="original-price">${originalPrice}</span>}
          <span className="current-price">${price}</span>
        </div>

        <button 
          className="add-to-cart-btn" 
          onClick={handleAgregarCarrito} 
          aria-label={`Agregar ${productName} al carrito`}
          onMouseEnter={() => speakText(`Agregar ${productName} al carrito`)}
          onFocus={() => speakText(`Agregar ${productName} al carrito`)}
        >
          Agregar al Carrito
        </button>
      </div>
    </article>
  );
};

export default ProductCard;

