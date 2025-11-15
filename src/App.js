import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductSection from './components/ProductSection';
import Footer from './components/Footer';
import Carrito from './components/Carrito';
import { CarritoProvider } from './context/CarritoContext';
import carritoFachada from './services/CarritoFachada';
import { ProductosAPI } from './services/ProductosAPI';

function App() {
  const [vistaActual, setVistaActual] = useState('home');
  const [productosAPI, setProductosAPI] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Manejar cambios de vista
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href') === '/carrito') {
        e.preventDefault();
        setVistaActual('carrito');
        window.scrollTo(0, 0);
      } else if (link && link.getAttribute('href') === '/') {
        e.preventDefault();
        setVistaActual('home');
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  // Cargar productos desde la API
  useEffect(() => {
    const cargarProductos = async () => {
      setCargando(true);
      try {
        const productos = await ProductosAPI.obtenerTodos();
        
        // Convertir estructura de API a estructura del frontend
        const productosFormateados = productos.map(p => ({
          id: p.id,
          name: p.nombre,
          price: p.precio,
          originalPrice: null,
          rating: p.rating?.rate || 5,
          discount: null,
          image: p.imagen,
          categoria: p.categoria,
          stock: p.stock,
          descripcion: p.descripcion
        }));
        
        setProductosAPI(productosFormateados);
        carritoFachada.inicializarInventario(productosFormateados);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  // Dividir productos por categorías
  const electronics = productosAPI.filter(p => p.categoria === 'electronics').slice(0, 4);
  const jewelery = productosAPI.filter(p => p.categoria === 'jewelery').slice(0, 4);
  const mensClothing = productosAPI.filter(p => p.categoria === "men's clothing").slice(0, 4);
  const womensClothing = productosAPI.filter(p => p.categoria === "women's clothing").slice(0, 4);

  return (
    <CarritoProvider>
      {vistaActual === 'carrito' ? (
        <Carrito />
      ) : (
        <div className="App">
          <Header />
          <main>
            <Hero />
            <Categories />
            {cargando ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>Cargando productos...</p>
              </div>
            ) : (
              <>
                {electronics.length > 0 && <ProductSection title="Electrónicos" products={electronics} />}
                {jewelery.length > 0 && <ProductSection title="Joyería" products={jewelery} />}
                {mensClothing.length > 0 && <ProductSection title="Ropa de Hombre" products={mensClothing} />}
                {womensClothing.length > 0 && <ProductSection title="Ropa de Mujer" products={womensClothing} />}
              </>
            )}
          </main>
          <Footer />
        </div>
      )}
    </CarritoProvider>
  );
}

export default App;
