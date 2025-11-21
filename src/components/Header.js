import React, { useState, useEffect } from 'react';
import './Header.css';
import logo from '../logos/logo2.png';
import { useCarrito } from '../context/CarritoContext';
import { useCuenta } from '../context/CuentaContext';
import { Link, useNavigate } from 'react-router-dom';
import Notifier from '../services/Notifier';

const Header = ({ darkMode, setDarkMode, screenReaderEnabled, setScreenReaderEnabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [headerLocked, setHeaderLocked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cantidadTotal } = useCarrito();
  const { currentUser, logout } = useCuenta();
  const navigate = useNavigate();

  useEffect(() => {
    if (screenReaderEnabled) {
      document.documentElement.classList.add('screen-reader-mode');
    } else {
      document.documentElement.classList.remove('screen-reader-mode');
    }
    localStorage.setItem('screenReaderEnabled', JSON.stringify(screenReaderEnabled));
  }, [screenReaderEnabled]);

  const speakText = (text) => {
    if (!screenReaderEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    // Pequeño delay para asegurar que la cancelación se complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

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

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      Notifier.error('Lo sentimos, tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
      
      // Auto-buscar después de reconocimiento
      setTimeout(() => {
        const slug = transcript.replace(/'/g, '').toLowerCase().replace(/\s+/g, '-');
        navigate(`/categorias/${encodeURIComponent(slug)}`);
      }, 500);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error('Error en reconocimiento de voz:', event.error);
      if (event.error === 'no-speech') {
        Notifier.error('No se detectó ningún audio. Por favor, intenta de nuevo.');
      } else if (event.error === 'not-allowed') {
        Notifier.error('Permiso denegado. Por favor, habilita el micrófono en tu navegador.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
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
          <Link 
            to="/" 
            aria-label="Ir al inicio"
            onMouseEnter={() => speakText('Ir al inicio, FlashMarket')}
            onFocus={() => speakText('Ir al inicio, FlashMarket')}
          >
            <img src={logo} alt="FlashMarket" className="site-logo" />
          </Link>
        </div>

        {/* Barra de búsqueda y botón de voz */}
        <div className="header-search-wrapper">
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
              onFocus={() => speakText('Campo de búsqueda de productos')}
            />
            <button 
              type="submit" 
              aria-label="Buscar" 
              className={isScrolled && !headerLocked && !searchExpanded ? 'icon-mode' : ''}
              onMouseEnter={() => speakText('Buscar productos')}
              onFocus={() => speakText('Buscar productos')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2"/>
              </svg>
              <span className="search-label">Buscar</span>
            </button>
          </form>

          {/* Botón de búsqueda por voz */}
          <button 
            type="button" 
            onClick={handleVoiceSearch}
            className={`voice-search-btn-external ${isListening ? 'listening' : ''}`}
            aria-label="Búsqueda por voz"
            title="Búsqueda por voz"
            onMouseEnter={() => speakText('Búsqueda por voz')}
            onFocus={() => speakText('Búsqueda por voz')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeWidth="2"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeWidth="2"/>
              <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2"/>
              <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Navegación de usuario */}
        <nav className="header-nav" aria-label="Navegación principal">
          <Link 
            to={currentUser ? '/cuenta' : '/login'} 
            className="header-icon" 
            aria-label="Mi cuenta"
            onMouseEnter={() => speakText('Mi cuenta')}
            onFocus={() => speakText('Mi cuenta')}
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
            onMouseEnter={() => speakText(`Carrito de compras, ${cantidadTotal} artículos`)}
            onFocus={() => speakText(`Carrito de compras, ${cantidadTotal} artículos`)}
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

          {/* Menú hamburguesa */}
          <button 
            className="header-icon menu-button" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú de configuración"
            aria-expanded={menuOpen}
            onMouseEnter={() => speakText('Menú de configuración')}
            onFocus={() => speakText('Menú de configuración')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2"/>
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2"/>
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2"/>
            </svg>
            <span>Menú</span>
          </button>
        </nav>

        {/* Menú desplegable */}
        {menuOpen && (
          <>
            <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
            <div className="settings-menu">
              <div className="menu-header">
                <h3>Configuración</h3>
                <button 
                  className="menu-close" 
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              <div className="menu-content">
                {currentUser && (
                  <div className="menu-section">
                    <p className="menu-user-info">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                      </svg>
                      {currentUser.nombre || currentUser.email}
                    </p>
                  </div>
                )}

                <div className="menu-section">
                  <button 
                    className="menu-item"
                    onClick={() => { navigate('/cuenta'); setMenuOpen(false); }}
                    onMouseEnter={() => speakText('Mi Cuenta')}
                    onFocus={() => speakText('Mi Cuenta')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                      <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                    </svg>
                    Mi Cuenta
                  </button>

                  <button 
                    className="menu-item"
                    onClick={() => { navigate('/historial'); setMenuOpen(false); }}
                    onMouseEnter={() => speakText('Historial de Pedidos')}
                    onFocus={() => speakText('Historial de Pedidos')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                      <line x1="9" y1="3" x2="9" y2="21" strokeWidth="2"/>
                    </svg>
                    Historial de Pedidos
                  </button>

                  <button 
                    className="menu-item"
                    onClick={() => { navigate('/carrito'); setMenuOpen(false); }}
                    onMouseEnter={() => speakText('Carrito de Compras')}
                    onFocus={() => speakText('Carrito de Compras')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="9" cy="21" r="1" strokeWidth="2"/>
                      <circle cx="20" cy="21" r="1" strokeWidth="2"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2"/>
                    </svg>
                    Carrito de Compras
                  </button>
                </div>

                <div className="menu-section">
                  <button 
                    className="menu-item"
                    onClick={() => setDarkMode(!darkMode)}
                    onMouseEnter={() => speakText(darkMode ? 'Modo Claro' : 'Modo Oscuro')}
                    onFocus={() => speakText(darkMode ? 'Modo Claro' : 'Modo Oscuro')}
                  >
                    {darkMode ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="5" strokeWidth="2"/>
                        <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2"/>
                        <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2"/>
                        <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2"/>
                        <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2"/>
                      </svg>
                    )}
                    {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                  </button>

                  <button 
                    className="menu-item"
                    onClick={() => {
                      const newState = !screenReaderEnabled;
                      setScreenReaderEnabled(newState);
                      // Esperar a que el estado se actualice antes de hablar
                      setTimeout(() => {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(
                            newState ? 'Lector de pantalla activado' : 'Lector de pantalla desactivado'
                          );
                          utterance.lang = 'es-ES';
                          utterance.rate = 1.1;
                          window.speechSynthesis.speak(utterance);
                        }
                      }, 100);
                    }}
                    onMouseEnter={() => speakText(screenReaderEnabled ? 'Desactivar Lector de Pantalla' : 'Activar Lector de Pantalla')}
                    onFocus={() => speakText(screenReaderEnabled ? 'Desactivar Lector de Pantalla' : 'Activar Lector de Pantalla')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth="2"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth="2"/>
                    </svg>
                    {screenReaderEnabled ? 'Desactivar Lector' : 'Activar Lector'}
                  </button>

                  <button 
                    className="menu-item"
                    onMouseEnter={() => speakText('Idioma')}
                    onFocus={() => speakText('Idioma')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2v20M2 12h20" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    </svg>
                    Idioma
                  </button>

                  <button 
                    className="menu-item"
                    onMouseEnter={() => speakText('Configuración')}
                    onFocus={() => speakText('Configuración')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                      <path d="M12 1v6m0 6v6M5.2 5.2l4.2 4.2m5.2 5.2l4.2 4.2M1 12h6m6 0h6M5.2 18.8l4.2-4.2m5.2-5.2l4.2-4.2" strokeWidth="2"/>
                    </svg>
                    Configuración
                  </button>
                </div>

                {currentUser && (
                  <div className="menu-section">
                    <button 
                      className="menu-item logout"
                      onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2"/>
                        <polyline points="16 17 21 12 16 7" strokeWidth="2"/>
                        <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
