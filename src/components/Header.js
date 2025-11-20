import React, { useState, useEffect } from 'react';
import './Header.css';
import logo from '../logos/logo2.png';
import { useCarrito } from '../context/CarritoContext';
import { useCuenta } from '../context/CuentaContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [headerLocked, setHeaderLocked] = useState(false);
  const { cantidadTotal } = useCarrito();
  const { currentUser } = useCuenta();
  const navigate = useNavigate();

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
    const q = (searchTerm || '').trim();
    if (!q) return;

    // slugify: remove apostrophes, lower, replace spaces with hyphens
    const slug = q.replace(/'/g, '').toLowerCase().replace(/\s+/g, '-');
    // Navigate to category/search handler which will perform category or text search
    navigate(`/categorias/${encodeURIComponent(slug)}`);
    setSearchTerm('');
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
        <div className="header-logo">
          <Link to="/" aria-label="Ir al inicio">
            <img src={logo} alt="FlashMarket" className="site-logo" />
          </Link>
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
          <Link 
            to={currentUser ? '/cuenta' : '/login'} 
            className="header-icon" 
            aria-label="Mi cuenta"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
            <span>Cuenta</span>
          </Link>

          <Link 
            to="/carrito" 
            className="header-icon" 
            aria-label={`Carrito de compras, ${cantidadTotal} artículos`}
          >
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1" strokeWidth="2"/>
                <circle cx="20" cy="21" r="1" strokeWidth="2"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2"/>
              </svg>
              <span className="cart-badge" aria-label="cantidad de artículos">{cantidadTotal}</span>
            </div>
            <span>Carrito</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
