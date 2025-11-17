import React from 'react';
import { useCuenta } from '../context/CuentaContext';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account = () => {
  const { currentUser, logout, getOrders, addShippingAddress, removeShippingAddress, setDefaultShipping } = useCuenta();
  const navigate = useNavigate();
  const [adding, setAdding] = React.useState(false);
  const [addrForm, setAddrForm] = React.useState({ label: '', line1: '', city: '', postal: '', country: '', phone: '' });
  const [addrMsg, setAddrMsg] = React.useState(null);

  const handleAddrChange = (e) => setAddrForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddAddr = (e) => {
    e.preventDefault();
    const res = addShippingAddress(addrForm);
    if (res?.exito) {
      setAddrForm({ label: '', line1: '', city: '', postal: '', country: '', phone: '' });
      setAdding(false);
      setAddrMsg({ type: 'success', text: 'Dirección agregada correctamente' });
      setTimeout(() => setAddrMsg(null), 3000);
    }
  };

  if (!currentUser) {
    return (
      <main style={{ padding: '2rem' }}>
        <h2>Debes iniciar sesión</h2>
        <p>Por favor ve a la página de <a href="/login">iniciar sesión</a> o <a href="/register">registrarte</a>.</p>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <section className="account-main" style={{ padding: '1.25rem' }}>
          <h2>Mi Cuenta</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div>
              <strong>{currentUser.nombre}</strong>
              <div style={{ color: '#666' }}>{currentUser.email}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</button>
            </div>
          </div>

          <section style={{ marginTop: '1rem' }}>
            <h3>Historial de Pedidos</h3>
            {((getOrders() || []).slice().reverse().length === 0) ? (
              <div style={{ padding: '0.75rem', color: '#666' }}>No tienes pedidos todavía.</div>
            ) : (
              (getOrders() || []).slice().reverse().map(o => (
                <div key={o.id} style={{ padding: '0.75rem', border: '1px solid #eef6ee', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Pedido {o.id}</strong>
                    <small>{new Date(o.fecha).toLocaleString()}</small>
                  </div>
                  <div>Nota: {o.nota || 'Sin nota'}</div>
                  <div>Total: ${o.total?.toFixed ? o.total.toFixed(2) : (o.total || 0)}</div>
                </div>
              ))
            )}
          </section>

          <section style={{ marginTop: '1rem' }}>
            <h3>Direcciones de Envío</h3>
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              {addrMsg && (
                <div style={{ padding: 8, borderRadius: 6, background: addrMsg.type === 'success' ? '#e6ffed' : '#ffecec', color: addrMsg.type === 'success' ? '#064e2a' : '#b00000' }}>
                  {addrMsg.text}
                </div>
              )}
              {(currentUser.direcciones || []).map(d => (
                <div key={d.id} style={{ padding: '0.75rem', border: '1px solid #eef6ee', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                  <div>
                    <div><strong>{d.label || `${d.line1}, ${d.city}`}</strong></div>
                    <div style={{ color: '#666' }}>{d.line1} · {d.city} · {d.postal} · {d.country}</div>
                    <div style={{ color: '#666' }}>Tel: {d.phone}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button onClick={() => setDefaultShipping(d.id)}>{d.default ? 'Predeterminada' : 'Usar'}</button>
                    <button onClick={() => removeShippingAddress(d.id)}>Eliminar</button>
                  </div>
                </div>
              ))}

              {adding ? (
                <form onSubmit={handleAddAddr} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
                  <input name="label" placeholder="Etiqueta (ej. Casa)" value={addrForm.label} onChange={handleAddrChange} />
                  <input name="line1" placeholder="Dirección" value={addrForm.line1} onChange={handleAddrChange} />
                  <input name="city" placeholder="Ciudad" value={addrForm.city} onChange={handleAddrChange} />
                  <input name="postal" placeholder="Código postal" value={addrForm.postal} onChange={handleAddrChange} />
                  <input name="country" placeholder="País" value={addrForm.country} onChange={handleAddrChange} />
                  <input name="phone" placeholder="Teléfono" value={addrForm.phone} onChange={handleAddrChange} />
                  <div>
                    <button type="submit">Agregar dirección</button>
                    <button type="button" onClick={() => setAdding(false)} style={{ marginLeft: 8 }}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <div>
                  <button onClick={() => setAdding(true)}>Agregar nueva dirección</button>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
};

export default Account;
