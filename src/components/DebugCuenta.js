import React, { useState } from 'react';
import { useCuenta } from '../context/CuentaContext';

const DebugCuenta = () => {
  const ctx = useCuenta();
  const { addOrder, currentUser } = ctx || {};
  const [ls, setLs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pry3_cuenta_v1')); } catch (e) { return null; }
  });
  const [msg, setMsg] = useState(null);

  const refrescar = () => {
    try { setLs(JSON.parse(localStorage.getItem('pry3_cuenta_v1'))); } catch (e) { setLs({ error: 'no localStorage or parse error' }); }
  };

  const insertarPedidoPrueba = () => {
    if (!addOrder) {
      setMsg('No hay addOrder en el contexto (¿CuentaProvider no está activo?)');
      return;
    }
    if (!currentUser) {
      setMsg('No hay usuario autenticado actualmente. Inicia sesión primero.');
      return;
    }

    const sample = {
      total: 9.99,
      items: [{ id: 'p-debug', name: 'Pedido de prueba', cantidad: 1, price: 9.99 }],
      metodoPago: 'Debug',
      shipping: (currentUser.direcciones || [])[0] || null,
    };

    const res = addOrder(sample);
    setMsg(res && res.exito ? `Pedido creado: ${res.pedido.id}` : `Fallo al crear pedido: ${res && res.mensaje}`);
    // refresh localStorage view
    setTimeout(refrescar, 250);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Debug Cuenta</h2>
      <div style={{ marginBottom: 8 }}>
        <button onClick={refrescar} style={{ marginRight: 8 }}>Refrescar</button>
        <button onClick={insertarPedidoPrueba}>Insertar pedido de prueba</button>
      </div>
      {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}

      <section style={{ marginBottom: 12 }}>
        <h3>Context (expuesto)</h3>
        <pre style={{ background: '#f7f7f7', padding: 10, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(ctx, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: 12 }}>
        <h3>localStorage `pry3_cuenta_v1`</h3>
        <pre style={{ background: '#f7f7f7', padding: 10, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(ls, null, 2)}</pre>
      </section>

      <section>
        <h3>Nota</h3>
        <p>Reproduce el flujo (registro/login/checkout) y actualiza esta página para ver los cambios. Usa el botón de "Insertar pedido de prueba" para forzar un pedido en la cuenta activa.</p>
      </section>
    </div>
  );
};

export default DebugCuenta;
