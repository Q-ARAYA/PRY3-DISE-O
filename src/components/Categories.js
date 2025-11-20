import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';
import { ProductosAPI } from '../services/ProductosAPI';

const displayMap = {
  electronics: 'Electrónica',
  jewelery: 'Joyería',
  "men's clothing": 'Ropa de Hombre',
  "women's clothing": 'Ropa de Mujer'
};

const iconMap = {
  electronics: '💻',
  jewelery: '💍',
  "men's clothing": '👔',
  "women's clothing": '👗'
};

const imageMap = {
  electronics: 'https://plus.unsplash.com/premium_photo-1706545209825-c7dbdded8b3a?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGRldmljZXN8ZW58MHx8MHx8fDA%3D',
  jewelery: 'https://plus.unsplash.com/premium_photo-1661645473770-90d750452fa0?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8amV3ZWxyeXxlbnwwfHwwfHx8MA%3D%3D',
  "men's clothing": 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  "women's clothing": 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cm9wYSUyMG11amVyfGVufDB8fDB8fHww'
};

const slugifyApiCategory = (apiCategory) => {
  // remove apostrophes, lower, replace spaces with hyphens
  return apiCategory.replace(/'/g, '').toLowerCase().replace(/\s+/g, '-');
};

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const cats = await ProductosAPI.obtenerCategorias();
        setCategories(cats || []);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategories([]);
      }
    };

    cargar();
  }, []);

  return (
    <section className="categories" aria-labelledby="categories-title">
      <div className="categories-container">
        <h2 id="categories-title" className="section-title">Explora por Categoría</h2>

        <div className="categories-grid">
          {categories.map((cat) => {
            const name = displayMap[cat] || cat.replace(/\b\w/g, l => l.toUpperCase());
            const icon = iconMap[cat] || '📦';
            const slug = slugifyApiCategory(cat);

            const img = imageMap[cat];
            return (
              <Link
                key={cat}
                to={`/categorias/${encodeURIComponent(slug)}`}
                className={`category-card ${img ? 'has-image' : ''}`}
                style={img ? { backgroundImage: `url(${img})` } : undefined}
                aria-label={`${name}`}
              >
                {!img && (
                  <div className="category-icon" aria-hidden="true">
                    {icon}
                  </div>
                )}

                <div className="category-card-body">
                  <h3>{name}</h3>
                  <p className="category-sub">{cat}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
