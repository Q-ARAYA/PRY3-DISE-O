import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';
import { ProductosAPI } from '../services/ProductosAPI';
import carritoFachada from '../services/fachada/CarritoFachada';

const SellerPublish = () => {
  const { currentUser } = useCuenta();
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', imagen: '', descripcion: '' });
  const [categories, setCategories] = useState([]);
  const [useOtherCategory, setUseOtherCategory] = useState(false);
  const [msg, setMsg] = useState(null);

  const navigate = useNavigate();

  // Redirect if not authenticated or not seller (do not show the intermediate message)
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser && currentUser.role !== 'seller') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || (currentUser && currentUser.role !== 'seller')) return null;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      precio: parseFloat(form.precio) || 0,
      categoria: (useOtherCategory ? (form.categoria || 'otros') : (form.categoria || 'otros')),
      imagen: form.imagen || '',
      descripcion: form.descripcion || '',
      sellerId: currentUser.id
    };

    const res = await ProductosAPI.publicarProducto(payload);
    if (res?.exito) {
      setMsg({ type: 'success', text: 'Producto publicado correctamente' });
      // add published product to inventory so other users can add to cart
      try {
        carritoFachada.inicializarInventario([res.producto]);
      } catch (e) {}
      setTimeout(() => navigate(`/producto/${res.producto.id}`), 800);
    } else {
      setMsg({ type: 'error', text: res.mensaje || 'Error al publicar' });
    }
  };

  useEffect(() => {
    const cargarCats = async () => {
      try {
        const cats = await ProductosAPI.obtenerCategorias();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) { setCategories([]); }
    };
    cargarCats();
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h2>Publicar Producto</h2>
      {msg && (
        <div style={{ padding: 8, background: msg.type === 'success' ? '#e6ffed' : '#ffecec', color: msg.type === 'success' ? '#064e2a' : '#b00000' }}>{msg.text}</div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
        <input name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={handleChange} required />
        <input name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} required />

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Categoría
          <select name="categoria" value={form.categoria} onChange={(e) => { handleChange(e); setUseOtherCategory(e.target.value === '__other'); }}>
            <option value="">-- Selecciona --</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__other">Otra...</option>
          </select>
        </label>

        {useOtherCategory && (
          <input name="categoria" placeholder="Ingrese nueva categoría" value={form.categoria} onChange={handleChange} />
        )}

        <input name="imagen" placeholder="URL de imagen" value={form.imagen} onChange={handleChange} />
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} rows={6} />
        <div>
          <button type="submit">Publicar</button>
          <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      </form>
    </main>
  );
};

export default SellerPublish;
