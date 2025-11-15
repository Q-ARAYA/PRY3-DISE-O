import React from 'react';
import './Categories.css';

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: 'Electrónica',
      icon: '💻',
      link: '/categorias/electronica',
      description: 'Computadoras, celulares y más'
    },
    {
      id: 2,
      name: 'Ropa',
      icon: '👕',
      link: '/categorias/ropa',
      description: 'Moda para toda la familia'
    },
    {
      id: 3,
      name: 'Hogar',
      icon: '🏠',
      link: '/categorias/hogar',
      description: 'Muebles y decoración'
    },
    {
      id: 4,
      name: 'Deportes',
      icon: '⚽',
      link: '/categorias/deportes',
      description: 'Equipo deportivo y fitness'
    },
    {
      id: 5,
      name: 'Libros',
      icon: '📚',
      link: '/categorias/libros',
      description: 'Literatura y más'
    },
    {
      id: 6,
      name: 'Juguetes',
      icon: '🎮',
      link: '/categorias/juguetes',
      description: 'Diversión para todas las edades'
    }
  ];

  return (
    <section className="categories" aria-labelledby="categories-title">
      <div className="categories-container">
        <h2 id="categories-title" className="section-title">
          Explora por Categoría
        </h2>

        <div className="categories-grid">
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.link}
              className="category-card"
              aria-label={`${category.name} - ${category.description}`}
            >
              <div className="category-icon" aria-hidden="true">
                {category.icon}
              </div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
