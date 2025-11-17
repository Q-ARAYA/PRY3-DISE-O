import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useCuenta } from '../context/CuentaContext';

const Checkout = () => {
  const {
    subtotal,
    descuentos,
    impuestos,
    total,
    procesarPago,
    limpiarCarrito,
  } = useCarrito();

  const {
    addOrder,
    currentUser,
    addShippingAddress,
  } = useCuenta();

  const navigate = useNavigate();

  const [selectedAddr, setSelectedAddr] = useState('');
  const [addingAddr, setAddingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: '',
    line1: '',
    city: '',
    postal: '',
    country: '',
    phone: '',
  });
  const [resultMessage, setResultMessage] = useState(null);

  // DEBUG: ver qué usuario llega al checkout
  console.log('[Checkout] currentUser = ', currentUser);

  // Hook SIEMPRE llamado (no dentro de if)
  useEffect(() => {
    if (currentUser && (!selectedAddr || selectedAddr === '')) {
      const dirs = currentUser.direcciones || [];
      if (dirs.length > 0) {
        const defecto = dirs.find(d => d.default) || dirs[0];
        if (defecto) setSelectedAddr(defecto.id);
      }
    }
  }, [currentUser, selectedAddr]);

  const handleAddrChange = (e) => {
    const { name, value } = e.target;
    setAddrForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddr = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const res = addShippingAddress(addrForm);
    if (res?.exito) {
      setSelectedAddr(res.direccion.id);
      setAddrForm({
        label: '',
        line1: '',
        city: '',
        postal: '',
        country: '',
        phone: '',
      });
      setAddingAddr(false);
    }
  };

  const handleConfirmar = () => {
    const resultado = procesarPago('Tarjeta de Crédito');

    if (!resultado.exito) {
      alert(resultado.mensaje || 'No se pudo procesar el pago');
      return;
    }

    try {
      const { resumen, metodoPago } = resultado;

      const shipping = currentUser
        ? (currentUser.direcciones || []).find(a => a.id === selectedAddr)
        : null;

      const order = {
        total: resumen.total,
        items: resumen.productos,
        metodoPago,
        shipping,
      };

      const res = addOrder(order);
      if (!res || !res.exito) {
        const msg = res && res.mensaje
          ? res.mensaje
          : 'No se pudo guardar el pedido en la cuenta';
        setResultMessage({ type: 'error', text: msg });
        return;
      } else {
        setResultMessage({
          type: 'success',
          text: 'Pedido guardado en tu cuenta',
        });
      }
    } catch (e) {
      console.error('addOrder exception', e);
    }

    try {
      limpiarCarrito();
    } catch (e) {}

    alert('Pago realizado correctamente');
    navigate('/historial');
  };

  // 👇 ESTE return ya es DESPUÉS de TODAS las llamadas a hooks
  if (!currentUser) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Checkout</h2>
        <p>
          Debes iniciar sesión para completar tu compra.{' '}
          <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Checkout</h2>
      <div style={{ maxWidth: 480 }}>
        {resultMessage && (
          <div
            style={{
              marginBottom: 12,
              padding: 8,
              borderRadius: 6,
              background:
                resultMessage.type === 'error' ? '#ffecec' : '#e6ffed',
              color:
                resultMessage.type === 'error' ? '#b00000' : '#064e2a',
            }}
          >
            {resultMessage.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <strong>${subtotal?.toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Descuentos</span>
          <strong>-${descuentos?.toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>IVA</span>
          <strong>${impuestos?.toFixed(2)}</strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
          }}
        >
          <span>Total</span>
          <strong>${total?.toFixed(2)}</strong>
        </div>

        {/* Bloque de direcciones: ahora SÍ debe aparecer porque currentUser existe */}
        <div style={{ marginTop: 12 }}>
          <h4>Dirección de envío</h4>
          {(currentUser.direcciones || []).length > 0 ? (
            <select
              value={selectedAddr}
              onChange={(e) => setSelectedAddr(e.target.value)}
            >
              <option value="">-- Seleccione una dirección --</option>
              {(currentUser.direcciones || []).map(a => (
                <option key={a.id} value={a.id}>
                  {a.label || (a.line1 + ' · ' + a.city)}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ color: '#666' }}>
              No hay direcciones guardadas. Puedes agregar una.
            </div>
          )}

          {addingAddr ? (
            <form
              onSubmit={handleAddAddr}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxWidth: 480,
                marginTop: 8,
              }}
            >
              <input
                name="label"
                placeholder="Etiqueta (ej. Casa)"
                value={addrForm.label}
                onChange={handleAddrChange}
              />
              <input
                name="line1"
                placeholder="Dirección"
                value={addrForm.line1}
                onChange={handleAddrChange}
              />
              <input
                name="city"
                placeholder="Ciudad"
                value={addrForm.city}
                onChange={handleAddrChange}
              />
              <input
                name="postal"
                placeholder="Código postal"
                value={addrForm.postal}
                onChange={handleAddrChange}
              />
              <input
                name="country"
                placeholder="País"
                value={addrForm.country}
                onChange={handleAddrChange}
              />
              <input
                name="phone"
                placeholder="Teléfono"
                value={addrForm.phone}
                onChange={handleAddrChange}
              />
              <div>
                <button type="submit">Agregar dirección</button>
                <button
                  type="button"
                  onClick={() => setAddingAddr(false)}
                  style={{ marginLeft: 8 }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setAddingAddr(true)}>
                Agregar nueva dirección
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={handleConfirmar} className="add-to-cart-btn">
            Confirmar Pago
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ marginLeft: '0.5rem' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
