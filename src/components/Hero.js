import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Ofertas Flash',
      subtitle: 'Hasta 50% de descuento en tecnología',
      cta: 'Ver Ofertas',
      image: 'https://plus.unsplash.com/premium_photo-1681702277226-9c8c96573760?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      link: '/ofertas/tecnologia'
    },
    {
      id: 2,
      title: 'Nueva Colección',
      subtitle: 'Las últimas tendencias en moda',
      cta: 'Explorar',
      image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      link: '/categorias/ropa'
    },
    {
      id: 3,
      title: 'Envío Gratis',
      subtitle: 'En compras mayores a $50',
      cta: 'Comprar Ahora',
      image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcdefabcdefabcdefabcdefabcdef',
      link: '/categorias'
    }
  ]; 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="hero" aria-label="Ofertas destacadas">
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: slide.image ? `url(${slide.image})` : undefined, backgroundColor: slide.bgColor || undefined }}
            aria-hidden={index !== currentSlide}
          >
            <div className="hero-content">
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
              <a 
                href={slide.link} 
                className="hero-cta"
                tabIndex={index === currentSlide ? 0 : -1}
              >
                {slide.cta}
              </a>
            </div>
          </div>
        ))}

        {/* Controles */}
        <button
          className="hero-control hero-prev"
          onClick={prevSlide}
          aria-label="Diapositiva anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className="hero-control hero-next"
          onClick={nextSlide}
          aria-label="Siguiente diapositiva"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Indicadores */}
        <div className="hero-indicators" role="group" aria-label="Indicadores de diapositivas">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a diapositiva ${index + 1}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
