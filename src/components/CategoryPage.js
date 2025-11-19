import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductosAPI } from '../services/ProductosAPI';
import ProductSection from './ProductSection';

const slugToApi = (slug, availableCategories = []) => {
  // Try direct match first (categories may be slugified api names)
  const candidate = slug.replace(/-/g, '');

  // Build map of slug -> apiCategory from availableCategories
  const map = {};
  availableCategories.forEach(cat => {
    const s = cat.replace(/'/g, '').toLowerCase().replace(/\s+/g, '-');
    map[s] = cat;
  });

  if (map[slug]) return map[slug];
  // Fallback heuristics based on keywords
  const lower = slug.toLowerCase();
  if (lower.includes('ropa')) return 'ropa'; // special token -> combine men's + women's
  if (lower.includes('hombre') || lower.includes('men')) return "men's clothing";
  if (lower.includes('mujer') || lower.includes('women') || lower.includes('woman')) return "women's clothing";
  if (lower.includes('electron') || lower.includes('electro')) return 'electronics';
  if (lower.includes('joy') || lower.includes('jewel') || lower.includes('joya')) return 'jewelery';

  // try replacing hyphens with spaces and apostrophes
  const maybe = slug.replace(/-/g, ' ');
  const found = availableCategories.find(c => c.toLowerCase() === maybe.toLowerCase() || c.replace(/'/g,'').toLowerCase() === maybe.toLowerCase());
  return found || null;
};

const mapApiToApp = (productos) => productos.map(p => ({
  id: p.id,
  name: p.nombre || p.title,
  price: p.precio || parseFloat(p.price || 0),
  originalPrice: null,
  rating: p.rating?.rate || (p.rating || 5),
  discount: null,
  image: p.imagen || p.image,
  categoria: p.categoria || p.category,
  stock: p.stock || Math.floor(Math.random() * 50) + 10,
  descripcion: p.descripcion || p.description || ''
}));

const CategoryPage = () => {
  const { slug } = useParams();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [title, setTitle] = useState('Categoría');

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const available = await ProductosAPI.obtenerCategorias();
        const apiCategory = slugToApi(slug, available);

        if (!apiCategory) {
          // fallback: search by slug text in all products
          const todos = await ProductosAPI.obtenerTodos();
          const s = slug.replace(/-/g, ' ').toLowerCase();
          const filtrados = todos.filter(p => {
            // exclude cloned variants from search results
            if (p.variantOf) return false;
            const nombre = (p.nombre || p.title || '').toLowerCase();
            const categoria = (p.categoria || p.category || '').toLowerCase();
            return nombre.includes(s) || categoria.includes(s);
          });

          // deduplicate by normalized name (prefer originals over variants)
          const unique = {};
          filtrados.forEach(p => {
            const key = (p.nombre || p.title || '').trim().toLowerCase();
            if (!key) return;
            if (!unique[key]) unique[key] = p;
            else {
              // prefer one without variantOf
              if (!unique[key].variantOf && p.variantOf) return;
              if (unique[key].variantOf && !p.variantOf) unique[key] = p;
            }
          });

          setProductos(mapApiToApp(Object.values(unique)));
          setTitle(slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
          return;
        }

        // Handle special combined 'ropa' token -> combine men's + women's
        if (apiCategory === 'ropa') {
          const todos = await ProductosAPI.obtenerTodos();
          const filtrados = todos.filter(p => {
            // exclude cloned variants when combining
            if (p.variantOf) return false;
            return p.categoria === "men's clothing" || p.categoria === "women's clothing";
          });

          // dedupe by name
          const unique = {};
          filtrados.forEach(p => {
            const key = (p.nombre || p.title || '').trim().toLowerCase();
            if (!key) return;
            if (!unique[key]) unique[key] = p;
            else {
              if (!unique[key].variantOf && p.variantOf) return;
              if (unique[key].variantOf && !p.variantOf) unique[key] = p;
            }
          });

          setProductos(mapApiToApp(Object.values(unique)));
          setTitle('Ropa');
        } else {
          // Respect the exact apiCategory
          const porCat = await ProductosAPI.obtenerPorCategoria(apiCategory);

          // dedupe results by name (prefer originals)
          const unique = {};
          porCat.forEach(p => {
            const key = (p.title || p.nombre || '').trim().toLowerCase();
            if (!key) return;
            if (!unique[key]) unique[key] = p;
            else {
              if (!unique[key].variantOf && p.variantOf) return;
              if (unique[key].variantOf && !p.variantOf) unique[key] = p;
            }
          });

          setProductos(mapApiToApp(Object.values(unique)));
          // Friendly titles for clothing
          if (apiCategory === "men's clothing") setTitle('Ropa de Hombre');
          else if (apiCategory === "women's clothing") setTitle('Ropa de Mujer');
          else setTitle(apiCategory.replace(/\b\w/g, l => l.toUpperCase()));
        }
      } catch (error) {
        console.error('Error al cargar productos por categoría:', error);
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [slug]);

  return (
    <main>
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Cargando productos...</p>
        </div>
      ) : (
        <>
          {productos.length > 0 ? (
            <ProductSection title={title} products={productos} categorySlug={slug} isCategoryPage={true} />
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>No se encontraron productos para "{title}".</p>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default CategoryPage;
