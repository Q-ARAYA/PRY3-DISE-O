import React, { useEffect, useState } from 'react';
import './ScrollToTopButton.css';
import logo3 from '../logos/logo3.png';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      className="scroll-top-btn"
      onClick={handleClick}
      aria-label="Ir al inicio"
      title="Ir al inicio"
    >
      <img src={logo3} alt="Inicio" className="scroll-top-logo" />
    </button>
  );
};

export default ScrollToTopButton;
