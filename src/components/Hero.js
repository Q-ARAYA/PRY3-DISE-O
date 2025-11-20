import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

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

  const SLIDE_DURATION = 5000; // 5 segundos
  const PROGRESS_INTERVAL = 50; // Actualizar cada 50ms

  useEffect(() => {
    // Reiniciar progreso
    setProgress(0);
    
    // Timer para cambiar de slide
    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    // Interval para actualizar barra de progreso
    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += PROGRESS_INTERVAL;
      setProgress((elapsed / SLIDE_DURATION) * 100);
    }, PROGRESS_INTERVAL);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentSlide, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const handleClickArea = (e) => {
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Si hace clic en el tercio izquierdo, ir atrás
    if (x < width * 0.3) {
      prevSlide();
    } 
    // Si hace clic en el tercio derecho, ir adelante
    else if (x > width * 0.7) {
      nextSlide();
    }
  };

  return (
    <section className="hero" aria-label="Ofertas destacadas">
      <div 
        className="hero-slider"
        onClick={handleClickArea}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''} ${index === (currentSlide - 1 + slides.length) % slides.length ? 'prev' : ''} ${index === (currentSlide + 1) % slides.length ? 'next' : ''}`}
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
                onClick={(e) => e.stopPropagation()}
              >
                {slide.cta}
              </a>
            </div>
          </div>
        ))}

        {/* Áreas de navegación invisibles */}
        <div className="hero-nav-area hero-nav-left" aria-label="Anterior">
          <div className="hero-nav-hint">‹</div>
        </div>
        <div className="hero-nav-area hero-nav-right" aria-label="Siguiente">
          <div className="hero-nav-hint">›</div>
        </div>

        {/* Indicadores con barra de progreso */}
        <div className="hero-indicators" role="group" aria-label="Indicadores de diapositivas">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              aria-label={`Ir a diapositiva ${index + 1}`}
              aria-current={index === currentSlide}
            >
              {index === currentSlide && (
                <div 
                  className="hero-indicator-progress" 
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
