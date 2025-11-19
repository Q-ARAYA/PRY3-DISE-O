import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';

const HistorialPedidos = () => {
  const { currentUser, getOrders } = useCuenta();
  const navigate = useNavigate();

  console.log('[Historial] currentUser = ', currentUser);
  console.log('[Historial] pedidos = ', getOrders());

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const pedidos = (getOrders() || []).slice().reverse();

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Historial de Pedidos</h2>
      {pedidos.length === 0 ? (
        <p>No tienes pedidos todavía.</p>
      ) : (
        pedidos.map(o => (
          <div
            key={o.id}
            style={{
              padding: '0.75rem',
              border: '1px solid #eef6ee',
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Pedido {o.id}</strong>
              <small>{new Date(o.fecha).toLocaleString()}</small>
            </div>
            <div>Items: {(o.items || []).length}</div>
            <div>
              Total: $
              {o.total?.toFixed
                ? o.total.toFixed(2)
                : (o.total || 0)}
            </div>
            <div>
              Dirección:{' '}
              {o.shipping
                ? `${o.shipping.line1}, ${o.shipping.city}`
                : 'No especificada'}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HistorialPedidos;
