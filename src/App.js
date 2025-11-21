import React, { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductSection from './components/ProductSection';
import CategoryPage from './components/CategoryPage';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import SellerPublish from './components/SellerPublish';
import Notifications from './components/Notifications';
import Carrito from './components/Carrito';
import ProductDetails from './components/ProductDetails';
import Checkout from './components/Checkout';
import HistorialPedidos from './components/HistorialPedidos';
import Account from './components/Account';
import DebugCuenta from './components/DebugCuenta';
import Login from './components/Login';
import Register from './components/Register';
import carritoFachada from './services/fachada/CarritoFachada';
import { ProductosAPI } from './services/ProductosAPI';

function App() {
  const [productosAPI, setProductosAPI] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(() => {
    const saved = localStorage.getItem('screenReaderEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const cargarProductos = async () => {
      setCargando(true);
      try {
        const productos = await ProductosAPI.obtenerTodos();
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
          descripcion: p.descripcion,
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

  const electronics = productosAPI.filter(p => p.categoria === 'electronics').slice(0, 4);
  const jewelery = productosAPI.filter(p => p.categoria === 'jewelery').slice(0, 4);
  const mensClothing = productosAPI.filter(p => p.categoria === "men's clothing").slice(0, 4);
  const womensClothing = productosAPI.filter(p => p.categoria === "women's clothing").slice(0, 4);

  return (
    <div className="App">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} screenReaderEnabled={screenReaderEnabled} setScreenReaderEnabled={setScreenReaderEnabled} />
      <main>
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <Hero screenReaderEnabled={screenReaderEnabled} />
                <Categories screenReaderEnabled={screenReaderEnabled} />
                {cargando ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>
                      Cargando productos...
                    </p>
                  </div>
                ) : (
                  <>
                    {electronics.length > 0 && (
                      <ProductSection title="Electrónicos" products={electronics} categorySlug="electronics" screenReaderEnabled={screenReaderEnabled} />
                    )}
                    {jewelery.length > 0 && (
                      <ProductSection title="Joyería" products={jewelery} categorySlug="jewelery" screenReaderEnabled={screenReaderEnabled} />
                    )}
                    {mensClothing.length > 0 && (
                      <ProductSection title="Ropa de Hombre" products={mensClothing} categorySlug={"mens-clothing"} screenReaderEnabled={screenReaderEnabled} />
                    )}
                    {womensClothing.length > 0 && (
                      <ProductSection title="Ropa de Mujer" products={womensClothing} categorySlug={"womens-clothing"} screenReaderEnabled={screenReaderEnabled} />
                    )}
                  </>
                )}
              </>
            )}
          />

          <Route path="/categorias/:slug" element={<CategoryPage />} />
          <Route path="/vendedor/publicar" element={<SellerPublish />} />

          <Route path="/carrito" element={<Carrito />} />
          <Route path="/producto/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/historial" element={<HistorialPedidos />} />
          <Route path="/cuenta" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/debug-cuenta" element={<DebugCuenta />} />
        </Routes>
      </main>
      <Footer />
      <Notifications />
      <ScrollToTopButton />
    </div>
  );
}

export default App;
