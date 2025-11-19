import React, { useState } from 'react';
import './Carrito.css';
import { useCarrito } from '../context/CarritoContext';
import { Link, useNavigate } from 'react-router-dom';

const Carrito = () => {
  const navigate = useNavigate();
  const {
    productos,
    subtotal,
    descuentos,
    impuestos,
    total,
    cantidadTotal,
    eliminarProducto,
    actualizarCantidad,
    aplicarDescuento,
    undo,
    redo,
    estaVacio,
    quitarDecorador
  } = useCarrito();

  const [codigoDescuento, setCodigoDescuento] = useState('');
  const [mensajeDescuento, setMensajeDescuento] = useState('');

  const handleEliminar = (productoId) => {
    const resultado = eliminarProducto(productoId);
    if (resultado.exito) {
      console.log('Producto eliminado');
    }
  };

  const handleUndo = () => {
    const res = undo();
    if (!res.exito) alert(res.mensaje);
  };

  const handleRedo = () => {
    const res = redo();
    if (!res.exito) alert(res.mensaje);
  };

  const handleCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const resultado = actualizarCantidad(productoId, nuevaCantidad);
    if (!resultado.exito) {
      alert(resultado.mensaje);
    }
  };

  const handleAplicarDescuento = (e) => {
    e.preventDefault();
    const resultado = aplicarDescuento(codigoDescuento);
    
    if (resultado.exito) {
      setMensajeDescuento(`✅ ${resultado.mensaje}`);
      setCodigoDescuento('');
    } else {
      setMensajeDescuento(`❌ ${resultado.mensaje}`);
    }

    setTimeout(() => setMensajeDescuento(''), 5000);
  };

  const handleProcederPago = () => {
    // Redirigir al checkout donde está implementado el patrón Bridge
    navigate('/checkout');
  };

  if (estaVacio()) {
    return (
      <main className="carrito-vacio">
        <div className="carrito-vacio-content">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos para comenzar tu compra</p>
          <Link to="/" className="btn-volver">Ir a comprar</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="carrito-page">
        <div className="carrito-container">
          <h1>Mi Carrito</h1>
          <div className="carrito-actions">
            <button className="btn-undo" onClick={handleUndo}>Deshacer</button>
            <button className="btn-redo" onClick={handleRedo}>Rehacer</button>
          </div>
          <p className="carrito-subtitle">{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</p>

          <div className="carrito-content">
            {/* Lista de productos */}
            <div className="carrito-productos">
              {productos.map((producto) => (
                <article key={producto.cartItemId || producto.id} className="carrito-item">
                  <div className="item-image">
                    <img src={producto.image || producto.imagen} alt={producto.name || producto.nombre} />
                  </div>

                  <div className="item-info">
                    <h3>{producto.name || producto.nombre}</h3>
                    <p className="item-price">${(producto.price || 0).toFixed(2)}</p>
                    {producto.discount && (
                      <span className="item-discount">-{producto.discount}% descuento</span>
                    )}
                    {producto.decoratorsApplied && producto.decoratorsApplied.length > 0 && (
                      <div className="item-decorators">
                        {producto.decoratorsApplied.map((d, i) => (
                          <span key={i} className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span>{d.tipo}</span>
                            <button title="Quitar decorador" onClick={async () => {
                              const res = await quitarDecorador(producto.cartItemId || producto.id, d.tipo);
                              if (!res?.exito) alert(res?.mensaje || 'No se pudo quitar el decorador');
                            }} style={{ background: 'transparent', border: 'none', color: '#b00000', cursor: 'pointer' }}>✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="item-cantidad">
                    <button
                      className="btn-cantidad"
                      onClick={() => handleCantidad(producto.cartItemId || producto.id, producto.cantidad - 1)}
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="cantidad-display">{producto.cantidad}</span>
                    <button
                      className="btn-cantidad"
                      onClick={() => handleCantidad(producto.cartItemId || producto.id, producto.cantidad + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <p className="item-total-price">
                      ${((producto.price || 0) * producto.cantidad).toFixed(2)}
                    </p>
                  </div>

                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(producto.cartItemId || producto.id)}
                    aria-label={`Eliminar ${producto.name || producto.nombre}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                    </svg>
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Link to={`/producto/${producto.id}`} className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>Opciones</Link>
                    </div>
                </article>
              ))}

            </div>

            <aside className="carrito-resumen">
              <h2>Resumen del Pedido</h2>

              <form className="descuento-form" onSubmit={handleAplicarDescuento}>
                <label htmlFor="codigo-descuento">Código de descuento</label>
                <div className="descuento-input-group">
                  <input
                    id="codigo-descuento"
                    type="text"
                    placeholder="Ej: FLASH10"
                    value={codigoDescuento}
                    onChange={(e) => setCodigoDescuento(e.target.value)}
                  />
                  <button type="submit">Aplicar</button>
                </div>
                {mensajeDescuento && (
                  <p className="mensaje-descuento">{mensajeDescuento}</p>
                )}
              </form>

              {/* Desglose de precios */}
              <div className="resumen-desglose">
                <div className="resumen-linea">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {descuentos > 0 && (
                  <div className="resumen-linea descuento">
                    <span>Descuentos:</span>
                    <span>-${descuentos.toFixed(2)}</span>
                  </div>
                )}

                <div className="resumen-linea">
                  <span>IVA (13%):</span>
                  <span>${impuestos.toFixed(2)}</span>
                </div>

                <div className="resumen-linea total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de pago - Redirige a Checkout */}
              <button className="btn-checkout" onClick={handleProcederPago}>
                Proceder al Pago
              </button>

              <Link to="/" className="btn-seguir-comprando">
                Seguir Comprando
              </Link>
            </aside>
          </div>
        </div>
      </main>
  );
};

export default Carrito;
