import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useCuenta } from '../context/CuentaContext';
import ProcesadorPago from '../services/bridge/ProcesadorPago';
import TarjetaCredito from '../services/bridge/MetodosPago/TarjetaCredito';
import Bitcoin from '../services/bridge/MetodosPago/Bitcoin';
import PayPal from '../services/bridge/MetodosPago/PayPal';
import TransferenciaBancaria from '../services/bridge/MetodosPago/TransferenciaBancaria';
import './Checkout.css';

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

  // Estados para direcciones
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
  
  // Estados para métodos de pago (Patrón Bridge)
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('tarjeta');
  const [datosPago, setDatosPago] = useState({});
  const [procesando, setProcesando] = useState(false);
  const [resultadoPago, setResultadoPago] = useState(null);
  
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

  // Redirect unauthenticated users away from checkout (do not show the login message)
  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

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

  const handleConfirmar = async () => {
    setProcesando(true);
    setResultadoPago(null);

    try {
      // 1. Crear el método de pago seleccionado (Patrón Bridge)
      let metodoPago;
      switch (metodoSeleccionado) {
        case 'tarjeta':
          metodoPago = new TarjetaCredito();
          break;
        case 'paypal':
          metodoPago = new PayPal();
          break;
        case 'bitcoin':
          metodoPago = new Bitcoin();
          break;
        case 'transferencia':
          metodoPago = new TransferenciaBancaria();
          break;
        default:
          metodoPago = new TarjetaCredito();
      }

      // 2. Crear el procesador con el método (BRIDGE)
      const procesador = new ProcesadorPago(metodoPago);

      // 3. Procesar pago usando el patrón Bridge
      const resultadoBridge = await procesador.procesarPago(total, datosPago);

      if (!resultadoBridge.exito) {
        setResultadoPago(resultadoBridge);
        setProcesando(false);
        return;
      }

      // 4. Si requiere confirmación externa (SINPE, Transferencia)
      if (resultadoBridge.requiereConfirmacion) {
        setResultadoPago(resultadoBridge);
        setProcesando(false);
        return;
      }

      // 5. Si requiere redirección (PayPal)
      if (resultadoBridge.requiereRedireccion) {
        setResultadoPago(resultadoBridge);
        // En producción: window.location.href = resultadoBridge.urlPago;
        setProcesando(false);
        return;
      }

      // 6. Procesar pago en el sistema (Fachada)
      const resultado = procesarPago(metodoSeleccionado);

      if (!resultado.exito) {
        setResultMessage({ type: 'error', text: resultado.mensaje || 'No se pudo procesar el pago' });
        setProcesando(false);
        return;
      }

      // 7. Guardar orden
      try {
        const { resumen, metodoPago: metodo } = resultado;

        const shipping = currentUser
          ? (currentUser.direcciones || []).find(a => a.id === selectedAddr)
          : null;

        const order = {
          total: resumen.total,
          items: resumen.productos,
          metodoPago: metodo,
          transaccionId: resultadoBridge.transaccionId,
          shipping,
        };

        const res = addOrder(order);
        if (!res || !res.exito) {
          const msg = res && res.mensaje
            ? res.mensaje
            : 'No se pudo guardar el pedido en la cuenta';
          setResultMessage({ type: 'error', text: msg });
          setProcesando(false);
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

      // 8. Limpiar carrito
      try {
        limpiarCarrito();
      } catch (e) {}

      // 9. Redirigir
      alert(`Pago realizado correctamente\nID: ${resultadoBridge.transaccionId}`);
      navigate('/historial');

    } catch (error) {
      console.error('Error en checkout:', error);
      setResultMessage({ type: 'error', text: 'Error inesperado al procesar el pago' });
    } finally {
      setProcesando(false);
    }
  };

  // 👇 Si no hay usuario, ya estamos redirigiendo en useEffect; no mostrar mensaje
  if (!currentUser) return null;

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      <div className="checkout-content">
        {/* Columna izquierda: Formularios */}
        <div className="checkout-forms">
          {resultMessage && (
            <div className={`message-box ${resultMessage.type}`}>
              {resultMessage.text}
            </div>
          )}

          {/* Método de Pago - Patrón Bridge */}
          <div className="checkout-section">
            <h3>Método de Pago</h3>
            
            <div className="metodos-pago">
              <label className={`metodo-card ${metodoSeleccionado === 'tarjeta' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="tarjeta"
                  checked={metodoSeleccionado === 'tarjeta'}
                  onChange={(e) => setMetodoSeleccionado(e.target.value)}
                />
                <div className="metodo-info">
                  <span className="metodo-icono">💳</span>
                  <div>
                    <div className="metodo-nombre">Tarjeta de Crédito/Débito</div>
                    <div className="metodo-desc">Visa, Mastercard, American Express</div>
                  </div>
                </div>
              </label>

              <label className={`metodo-card ${metodoSeleccionado === 'bitcoin' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="bitcoin"
                  checked={metodoSeleccionado === 'bitcoin'}
                  onChange={(e) => setMetodoSeleccionado(e.target.value)}
                />
                <div className="metodo-info">
                  <span className="metodo-icono">₿</span>
                  <div>
                    <div className="metodo-nombre">Bitcoin (BTC)</div>
                    <div className="metodo-desc">Pago con criptomoneda</div>
                  </div>
                </div>
              </label>

              <label className={`metodo-card ${metodoSeleccionado === 'paypal' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="paypal"
                  checked={metodoSeleccionado === 'paypal'}
                  onChange={(e) => setMetodoSeleccionado(e.target.value)}
                />
                <div className="metodo-info">
                  <span className="metodo-icono">💰</span>
                  <div>
                    <div className="metodo-nombre">PayPal</div>
                    <div className="metodo-desc">Pago seguro con tu cuenta</div>
                  </div>
                </div>
              </label>

              <label className={`metodo-card ${metodoSeleccionado === 'transferencia' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="transferencia"
                  checked={metodoSeleccionado === 'transferencia'}
                  onChange={(e) => setMetodoSeleccionado(e.target.value)}
                />
                <div className="metodo-info">
                  <span className="metodo-icono">🏦</span>
                  <div>
                    <div className="metodo-nombre">Transferencia Bancaria</div>
                    <div className="metodo-desc">Pago manual (24-48h)</div>
                  </div>
                </div>
              </label>
            </div>

            {/* Formularios dinámicos según método seleccionado */}
            <div className="form-pago">
              {metodoSeleccionado === 'tarjeta' && (
                <div className="tarjeta-form">
                  <div className="form-group">
                    <label>Nombre del Titular</label>
                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      value={datosPago.titular || ''}
                      onChange={(e) => setDatosPago({...datosPago, titular: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Número de Tarjeta</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      value={datosPago.numeroTarjeta || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setDatosPago({...datosPago, numeroTarjeta: value});
                      }}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Vencimiento (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/25"
                        maxLength="5"
                        value={datosPago.vencimiento || ''}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setDatosPago({...datosPago, vencimiento: value});
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="4"
                        value={datosPago.cvv || ''}
                        onChange={(e) => setDatosPago({...datosPago, cvv: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {metodoSeleccionado === 'bitcoin' && (
                <div className="bitcoin-form">
                  <div className="form-group">
                    <label>Email (para notificaciones)</label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={datosPago.emailCliente || ''}
                      onChange={(e) => setDatosPago({...datosPago, emailCliente: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tu Wallet Bitcoin (opcional)</label>
                    <input
                      type="text"
                      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                      value={datosPago.walletCliente || ''}
                      onChange={(e) => setDatosPago({...datosPago, walletCliente: e.target.value})}
                    />
                    <small style={{fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', display: 'block'}}>
                      Opcional: para registro y devoluciones
                    </small>
                  </div>
                  <div className="info-text" style={{background: '#fff3cd', borderLeft: '3px solid #ffc107'}}>
                    <strong>ℹ️ Información importante:</strong>
                    <ul style={{margin: '0.5rem 0 0 1rem', padding: 0}}>
                      <li>Se generará una dirección Bitcoin única</li>
                      <li>Envía el monto exacto mostrado</li>
                      <li>La confirmación toma 10-30 minutos</li>
                      <li>Recibirás notificación por email</li>
                    </ul>
                  </div>
                </div>
              )}

              {metodoSeleccionado === 'paypal' && (
                <div className="paypal-form">
                  <div className="form-group">
                    <label>Email de PayPal</label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={datosPago.email || ''}
                      onChange={(e) => setDatosPago({...datosPago, email: e.target.value})}
                    />
                  </div>
                  <p className="info-text">
                    Serás redirigido a PayPal para completar el pago de forma segura
                  </p>
                </div>
              )}

              {metodoSeleccionado === 'transferencia' && (
                <div className="transferencia-form">
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Juan Pérez Mora"
                      value={datosPago.nombreCliente || ''}
                      onChange={(e) => setDatosPago({...datosPago, nombreCliente: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={datosPago.emailCliente || ''}
                      onChange={(e) => setDatosPago({...datosPago, emailCliente: e.target.value})}
                    />
                  </div>
                  <p className="info-text">
                    Recibirás los datos de cuenta para realizar la transferencia
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="checkout-section">
            <h3>Dirección de Envío</h3>
            {(currentUser.direcciones || []).length > 0 ? (
              <select
                value={selectedAddr}
                onChange={(e) => setSelectedAddr(e.target.value)}
                className="direccion-select"
              >
                <option value="">-- Seleccione una dirección --</option>
                {(currentUser.direcciones || []).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.label || (a.line1 + ' · ' + a.city)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="no-direcciones">
                No hay direcciones guardadas. Puedes agregar una.
              </div>
            )}

            {addingAddr ? (
              <form onSubmit={handleAddAddr} className="addr-form">
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
                <div className="btn-group">
                  <button type="submit" className="btn-primary">Agregar dirección</button>
                  <button
                    type="button"
                    onClick={() => setAddingAddr(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setAddingAddr(true)} className="btn-add-addr">
                + Agregar nueva dirección
              </button>
            )}
          </div>

          {/* Resultado del pago (para Bitcoin/Transferencia) */}
          {resultadoPago && resultadoPago.requiereConfirmacion && (
            <div className="resultado-pago">
              <h3>✅ {resultadoPago.mensaje}</h3>
              
              {resultadoPago.direccionBitcoin && (
                <div className="codigo-sinpe">
                  <p><strong>Dirección Bitcoin:</strong></p>
                  <div className="codigo" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>
                    {resultadoPago.direccionBitcoin}
                  </div>
                  <p style={{marginTop: '1rem'}}><strong>Monto a enviar:</strong></p>
                  <div className="codigo" style={{color: '#f7931a'}}>
                    {resultadoPago.montoBTC} BTC
                  </div>
                  <p style={{fontSize: '0.85rem', color: '#666', marginTop: '0.5rem'}}>
                    ≈ ${resultadoPago.monto.toFixed(2)} USD
                  </p>
                  {resultadoPago.codigoQR && (
                    <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
                      <p><strong>O escanea el código QR:</strong></p>
                      <div style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        display: 'inline-block',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{
                          width: '200px',
                          height: '200px',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px'
                        }}>
                          <span style={{color: '#666'}}>Código QR</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {resultadoPago.datosCuenta && (
                <div className="datos-cuenta">
                  <h4>Datos para Transferencia:</h4>
                  <table>
                    <tbody>
                      <tr>
                        <td><strong>Beneficiario:</strong></td>
                        <td>{resultadoPago.datosCuenta.beneficiario}</td>
                      </tr>
                      <tr>
                        <td><strong>Banco:</strong></td>
                        <td>{resultadoPago.datosCuenta.banco}</td>
                      </tr>
                      <tr>
                        <td><strong>Cuenta:</strong></td>
                        <td>{resultadoPago.datosCuenta.numeroCuenta}</td>
                      </tr>
                      <tr>
                        <td><strong>Monto:</strong></td>
                        <td>{resultadoPago.datosCuenta.montoPagar}</td>
                      </tr>
                      <tr>
                        <td><strong>Referencia:</strong></td>
                        <td>{resultadoPago.referencia}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {resultadoPago.instrucciones && (
                <div className="instrucciones">
                  <h4>Instrucciones:</h4>
                  <ol>
                    {resultadoPago.instrucciones.map((instr, i) => (
                      <li key={i}>{instr}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {resultadoPago && resultadoPago.requiereRedireccion && (
            <div className="resultado-pago">
              <h3>💰 Redirigiendo a PayPal...</h3>
              <p>{resultadoPago.mensaje}</p>
              <a href={resultadoPago.urlPago} className="btn-paypal" target="_blank" rel="noopener noreferrer">
                Continuar a PayPal
              </a>
            </div>
          )}

          {resultadoPago && !resultadoPago.exito && (
            <div className="errores-pago">
              <h4>❌ Error en el pago</h4>
              <ul>
                {resultadoPago.errores?.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Columna derecha: Resumen */}
        <div className="checkout-summary">
          <h3>Resumen del Pedido</h3>
          <div className="summary-line">
            <span>Subtotal</span>
            <strong>${subtotal?.toFixed(2)}</strong>
          </div>
          <div className="summary-line">
            <span>Descuentos</span>
            <strong className="discount">-${descuentos?.toFixed(2)}</strong>
          </div>
          <div className="summary-line">
            <span>IVA (13%)</span>
            <strong>${impuestos?.toFixed(2)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>${total?.toFixed(2)}</strong>
          </div>

          <button 
            onClick={handleConfirmar} 
            className="btn-confirmar"
            disabled={procesando || !selectedAddr}
          >
            {procesando ? 'Procesando...' : 'Confirmar Pago'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
