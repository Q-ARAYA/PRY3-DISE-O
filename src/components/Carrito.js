import React, { useState } from 'react';
import './Carrito.css';
import { useCarrito } from '../context/CarritoContext';
import Header from './Header';
import Footer from './Footer';

const Carrito = () => {
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
    procesarPago,
    estaVacio
  } = useCarrito();

  const [codigoDescuento, setCodigoDescuento] = useState('');
  const [mensajeDescuento, setMensajeDescuento] = useState('');
  const [mostrarCheckout, setMostrarCheckout] = useState(false);

  const handleEliminar = (productoId) => {
    const resultado = eliminarProducto(productoId);
    if (resultado.exito) {
      console.log('Producto eliminado');
    }
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

  const handleProcesarPago = () => {
    const resultado = procesarPago('Tarjeta de Crédito');
    
    if (resultado.exito) {
      alert('¡Compra realizada exitosamente! Total: $' + resultado.resumen.total.toFixed(2));
      setMostrarCheckout(false);
    } else {
      alert(resultado.mensaje);
    }
  };

  if (estaVacio()) {
    return (
      <>
        <Header />
        <main className="carrito-vacio">
          <div className="carrito-vacio-content">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos para comenzar tu compra</p>
            <a href="/" className="btn-volver">Ir a comprar</a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="carrito-page">
        <div className="carrito-container">
          <h1>Mi Carrito</h1>
          <p className="carrito-subtitle">{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</p>

          <div className="carrito-content">
            {/* Lista de productos */}
            <div className="carrito-productos">
              {productos.map((producto) => (
                <article key={producto.id} className="carrito-item">
                  <div className="item-image">
                    <img src={producto.image} alt={producto.name} />
                  </div>

                  <div className="item-info">
                    <h3>{producto.name}</h3>
                    <p className="item-price">${producto.price.toFixed(2)}</p>
                    {producto.discount && (
                      <span className="item-discount">-{producto.discount}% descuento</span>
                    )}
                  </div>

                  <div className="item-cantidad">
                    <button
                      className="btn-cantidad"
                      onClick={() => handleCantidad(producto.id, producto.cantidad - 1)}
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="cantidad-display">{producto.cantidad}</span>
                    <button
                      className="btn-cantidad"
                      onClick={() => handleCantidad(producto.id, producto.cantidad + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <p className="item-total-price">
                      ${(producto.price * producto.cantidad).toFixed(2)}
                    </p>
                  </div>

                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(producto.id)}
                    aria-label={`Eliminar ${producto.name}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                    </svg>
                  </button>
                </article>
              ))}
            </div>

            {/* Resumen del pedido */}
            <aside className="carrito-resumen">
              <h2>Resumen del Pedido</h2>

              {/* Código de descuento */}
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

              {/* Botón de pago */}
              <button className="btn-checkout" onClick={() => setMostrarCheckout(true)}>
                Proceder al Pago
              </button>

              <a href="/" className="btn-seguir-comprando">
                Seguir Comprando
              </a>
            </aside>
          </div>
        </div>

        {/* Modal de checkout */}
        {mostrarCheckout && (
          <div className="checkout-modal" onClick={() => setMostrarCheckout(false)}>
            <div className="checkout-content" onClick={(e) => e.stopPropagation()}>
              <h2>Confirmar Compra</h2>
              <p>¿Deseas proceder con el pago?</p>
              
              <div className="checkout-total">
                <span>Total a pagar:</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <div className="checkout-acciones">
                <button className="btn-cancelar" onClick={() => setMostrarCheckout(false)}>
                  Cancelar
                </button>
                <button className="btn-confirmar" onClick={handleProcesarPago}>
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Carrito;
