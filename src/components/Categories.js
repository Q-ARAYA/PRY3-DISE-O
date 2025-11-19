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

            return (
              <Link key={cat} to={`/categorias/${encodeURIComponent(slug)}`} className="category-card" aria-label={`${name}`}>
                <div className="category-icon" aria-hidden="true">
                  {icon}
                </div>
                <h3>{name}</h3>
                <p className="category-sub">{cat}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
