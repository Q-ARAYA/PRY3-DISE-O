import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductCard.css';
import './ProductDetails.css';
import { ProductosAPI } from '../services/ProductosAPI';
import { useCarrito } from '../context/CarritoContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [decoratorSelection, setDecoratorSelection] = useState('');
  const [decoratorChecks, setDecoratorChecks] = useState({ envio: false, garantia: false, envoltura: false });
  const [selectedCartItem, setSelectedCartItem] = useState('');
  const { agregarProducto, decorarProducto, productos } = useCarrito();

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const p = await ProductosAPI.obtenerPorId(id);
        if (p) {
          setProducto({
            id: p.id,
            name: p.nombre,
            price: p.precio,
            image: p.imagen,
            descripcion: p.descripcion,
            categoria: p.categoria,
            stock: p.stock
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (!producto) return <div style={{ padding: '2rem' }}>Producto no encontrado</div>;

  const handleAgregar = () => {
    const res = agregarProducto(producto, 1);
    if (res.exito) {
      alert('Producto agregado al carrito');
      navigate('/carrito');
    } else {
      alert(res.mensaje);
    }
  };

  const handleDecorar = () => {
    // Construir array de decoradores seleccionados
    const seleccionados = Object.keys(decoratorChecks).filter(k => decoratorChecks[k]);
    if (seleccionados.length === 0 && !decoratorSelection) return alert('Selecciona al menos una opción de decoración');

    const tiposToApply = seleccionados.length > 0 ? seleccionados : [decoratorSelection];

    const cartItems = productos.filter(p => String(p.baseId) === String(producto.id));
    if (cartItems.length === 0) return alert('Agrega el producto al carrito antes de decorarlo');

    // Si no se seleccionó una línea específica y hay varias, tomar la primera
    const targetId = selectedCartItem || (cartItems[0] && (cartItems[0].cartItemId || cartItems[0].id));
    if (!targetId) return alert('Selecciona la línea del carrito a decorar');

    const res = decorarProducto(targetId, tiposToApply);
    if (!res.exito) {
      alert(res.mensaje);
    } else {
      alert('Decoradores aplicados: ' + tiposToApply.join(', '));
      // limpiar selección
      setDecoratorChecks({ envio: false, garantia: false, envoltura: false });
      setDecoratorSelection('');
    }
  };

  return (
    <div className="product-details">
      <div className="product-details-inner">
        <div className="product-image-large">
          <img src={producto.image} alt={producto.name} />
        </div>
        <div className="product-details-info">
          <h2>{producto.name}</h2>
          <p className="product-price">${producto.price}</p>
          <p>{producto.descripcion}</p>
          <div style={{ marginTop: '1rem' }}>
            <button className="add-to-cart-btn" onClick={handleAgregar}>Agregar al carrito</button>
            <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginLeft: '0.5rem' }}>Volver</button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <h4>Opciones adicionales</h4>
            {(() => {
              const cartItems = productos.filter(p => String(p.baseId) === String(producto.id));
              if (cartItems.length === 0) {
                return <p style={{ color: '#666' }}>Agrega el producto al carrito para ver y aplicar opciones adicionales.</p>;
              }

              return (
                <>
                  <div style={{ marginBottom: '0.5rem' }}>
                    {cartItems.length > 1 && (
                      <select value={selectedCartItem} onChange={(e) => setSelectedCartItem(e.target.value)}>
                        <option value="">-- Selecciona la línea --</option>
                        {cartItems.map(ci => (
                          <option key={ci.cartItemId || ci.id} value={ci.cartItemId || ci.id}>
                            Línea: {ci.cartItemId ? ci.cartItemId.slice(-6) : ci.id} — Cantidad: {ci.cantidad}
                          </option>
                        ))}
                      </select>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={decoratorChecks.envio} onChange={(e) => setDecoratorChecks(prev => ({ ...prev, envio: e.target.checked }))} />
                        Envío rápido
                      </label>
                      <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={decoratorChecks.garantia} onChange={(e) => setDecoratorChecks(prev => ({ ...prev, garantia: e.target.checked }))} />
                        Garantía
                      </label>
                      <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={decoratorChecks.envoltura} onChange={(e) => setDecoratorChecks(prev => ({ ...prev, envoltura: e.target.checked }))} />
                        Envoltura
                      </label>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <button onClick={handleDecorar}>Aplicar opciones seleccionadas</button>
                    </div>
                  </div>

                  <div>
                    <strong>Decoradores aplicados por línea:</strong>
                    <div>
                      {cartItems.map((ci) => (
                        <div key={ci.cartItemId || ci.id} style={{ marginBottom: '0.25rem' }}>
                          <small style={{ color: '#333' }}>Línea {ci.cartItemId ? ci.cartItemId.slice(-6) : ci.id} — Cant: {ci.cantidad}</small>
                          <div>
                            {(ci.decoratorsApplied || []).length === 0 ? (
                              <span style={{ color: '#888', marginLeft: '0.5rem' }}>Sin opciones</span>
                            ) : (
                              (ci.decoratorsApplied || []).map((d, i) => (
                                <span key={i} style={{ marginRight: '0.5rem' }} className="badge">{d.tipo}</span>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
