import React, { useState, useEffect } from 'react';
import './Header.css';
import { useCarrito } from '../context/CarritoContext';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [headerLocked, setHeaderLocked] = useState(false);
  const { cantidadTotal } = useCarrito();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
        setHeaderLocked(false); // Reset lock cuando se hace scroll
      } else {
        setIsScrolled(false);
        setSearchExpanded(false);
        setHeaderLocked(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHeaderClick = (e) => {
    if (isScrolled) {
      e.preventDefault();
      setHeaderLocked(true);
    }
  };

  const handleMouseEnter = () => {
    if (isScrolled) {
      setHeaderLocked(true);
    }
  };

  const handleMouseLeave = () => {
    if (isScrolled) {
      setHeaderLocked(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Buscando:', searchTerm);
    // Aquí implementaremos la búsqueda más adelante
  };

  return (
    <header 
      className={`header ${isScrolled && !headerLocked ? 'scrolled' : ''}`} 
      role="banner"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" style={{ cursor: 'pointer' }}>
          <h1>⚡ FlashMarket</h1>
        </div>

        {/* Barra de búsqueda */}
        <form 
          className={`header-search ${isScrolled && !headerLocked && !searchExpanded ? 'collapsed' : ''}`}
          onSubmit={handleSearch} 
          role="search"
          onMouseEnter={() => isScrolled && !headerLocked && setSearchExpanded(true)}
          onMouseLeave={() => isScrolled && !headerLocked && setSearchExpanded(false)}
        >
          <label htmlFor="search-input" className="sr-only">
            Buscar productos
          </label>
          <input
            id="search-input"
            type="search"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Campo de búsqueda"
          />
          <button type="submit" aria-label="Buscar" className={isScrolled && !headerLocked && !searchExpanded ? 'icon-mode' : ''}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" strokeWidth="2"/>
            </svg>
            <span className="search-label">Buscar</span>
          </button>
        </form>

        {/* Navegación de usuario */}
        <nav className="header-nav" aria-label="Navegación principal">
          <a href="/cuenta" className="header-icon" aria-label="Mi cuenta" onClick={handleHeaderClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
            <span>Cuenta</span>
          </a>

          <a href="/carrito" className="header-icon" aria-label={`Carrito de compras, ${cantidadTotal} artículos`} onClick={handleHeaderClick}>
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1" strokeWidth="2"/>
                <circle cx="20" cy="21" r="1" strokeWidth="2"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2"/>
              </svg>
              <span className="cart-badge" aria-label="cantidad de artículos">{cantidadTotal}</span>
            </div>
            <span>Carrito</span>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
