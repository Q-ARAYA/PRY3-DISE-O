import React, { useEffect, useState } from 'react';
import { useCuenta } from '../context/CuentaContext';
import { useNavigate, Link } from 'react-router-dom';
import './Account.css';
import { ProductosAPI } from '../services/ProductosAPI';

const Account = () => {
  const { currentUser, logout, getOrders, addShippingAddress, removeShippingAddress, setDefaultShipping, actualizarPerfil } = useCuenta();
  const { promoteToSeller } = useCuenta();
  const navigate = useNavigate();
  const [adding, setAdding] = React.useState(false);
  const [addrForm, setAddrForm] = React.useState({ label: '', line1: '', city: '', postal: '', country: '', phone: '' });
  const [addrMsg, setAddrMsg] = React.useState(null);
  const [publishedProducts, setPublishedProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', precio: '', categoria: '', imagen: '', descripcion: '', stock: 99 });
  const [sellerInfo, setSellerInfo] = useState({
    companyName: '',
    sellerType: 'individual',
    taxId: '',
    businessAddress: { line1: '', province: '', canton: '', district: '', postal: '', country: '' },
    dispatchAddress: { line1: '', schedule: '', methods: '' },
    bankInfo: { bankName: '', accountType: '', accountNumber: '', accountHolder: '', holderDocument: '' },
    payoutMethod: 'bank',
    paypalEmail: '',
    contactPhone: ''
  });
  const [sellerMsg, setSellerMsg] = useState(null);
  const [showSellerSignup, setShowSellerSignup] = useState(false);
  const [sellerSignup, setSellerSignup] = useState({
    responsibleName: '',
    email: '',
    password: '',
    phone: '',
    storeName: '',
    sellerType: 'individual',
    taxId: '',
    businessAddress: { line1: '', province: '', canton: '', district: '', postal: '', country: '' },
    dispatchAddress: { line1: '', schedule: '', methods: '' },
    bankInfo: { bankName: '', accountType: '', accountNumber: '', accountHolder: '', holderDocument: '' }
  });
  const [signupErrors, setSignupErrors] = useState({});

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

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const cargarPublicados = async () => {
    if (!currentUser || currentUser.role !== 'seller') return setPublishedProducts([]);
    try {
      const todos = await ProductosAPI.obtenerTodos();
      const publicados = (todos || []).filter(p => String(p.sellerId) === String(currentUser.id));
      setPublishedProducts(publicados);
    } catch (e) {
      setPublishedProducts([]);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) cargarPublicados();
    const onStorage = (e) => {
      if (e.key === 'pry3_local_products_v1') cargarPublicados();
    };
    window.addEventListener('storage', onStorage);
    return () => { mounted = false; window.removeEventListener('storage', onStorage); };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    // initialize seller info state from currentUser if present
    const s = currentUser.sellerInfo || {};
    setSellerInfo(prev => ({
      companyName: s.companyName || prev.companyName,
      sellerType: s.sellerType || prev.sellerType,
      taxId: s.taxId || prev.taxId,
      businessAddress: s.businessAddress || prev.businessAddress,
      dispatchAddress: s.dispatchAddress || prev.dispatchAddress,
      bankInfo: s.bankInfo || prev.bankInfo,
      payoutMethod: s.payoutMethod || prev.payoutMethod,
      paypalEmail: s.paypalEmail || prev.paypalEmail,
      contactPhone: s.contactPhone || prev.contactPhone
    }));
  }, [currentUser]);

  if (!currentUser) return null;

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
              <button className="btn btn-secondary" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</button>
            </div>
          </div>

            {currentUser.role === 'seller' ? (
            <section style={{ marginTop: '1rem' }}>
              <h3>Productos publicados</h3>
              {!publishedProducts || publishedProducts.length === 0 ? (
                <div style={{ padding: '0.75rem', color: '#666' }}>Aún no has publicado productos.</div>
              ) : (
                publishedProducts.map(p => (
                  <div key={p.id} className="published-item">
                    <div className="published-thumb">
                      {p.imagen ? <img className="published-thumb-img" src={p.imagen} alt={p.nombre} /> : <div className="published-thumb-empty" />}
                    </div>
                    <div className="published-info">
                      {editingId === p.id ? (
                        <div className="published-edit">
                          <input value={editForm.nombre} onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))} />
                          <input value={editForm.precio} onChange={(e) => setEditForm(prev => ({ ...prev, precio: e.target.value }))} />
                          <input value={editForm.categoria} onChange={(e) => setEditForm(prev => ({ ...prev, categoria: e.target.value }))} />
                          <input value={editForm.imagen} onChange={(e) => setEditForm(prev => ({ ...prev, imagen: e.target.value }))} />
                          <input type="number" min={0} value={editForm.stock} onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))} />
                          <textarea value={editForm.descripcion} onChange={(e) => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))} rows={3} />
                          <div className="published-edit-actions">
                            <button className="btn btn-primary" onClick={async (ev) => {
                              ev.preventDefault();
                              const payload = { ...editForm, id: p.id, sellerId: currentUser.id, precio: parseFloat(editForm.precio) || 0, stock: parseInt(editForm.stock, 10) || 0 };
                              const res = await ProductosAPI.editarProductoPublicado(payload);
                              if (res?.exito) {
                                setEditingId(null);
                                try { const carritoFachada = (await import('../services/fachada/CarritoFachada')).default; carritoFachada.inicializarInventario([res.producto]); } catch (e) {}
                                cargarPublicados();
                              } else {
                                alert(res.mensaje || 'Error al editar');
                              }
                            }}>Guardar</button>
                            <button className="btn" onClick={() => setEditingId(null)}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="published-meta">
                            <strong className="published-name">{p.nombre}</strong>
                            <div className="published-price">${p.precio?.toFixed ? p.precio.toFixed(2) : p.precio}</div>
                          </div>
                          <div className="published-cat">{p.categoria}</div>
                          <div className="published-actions">
                              <Link to={`/producto/${p.id}`} className="btn btn-secondary">Ver</Link>
                              <button className="btn" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(window.location.origin + `/producto/${p.id}`); }}>Copiar enlace</button>
                              <button className="btn" onClick={() => {
                              setEditingId(p.id);
                              setEditForm({ nombre: p.nombre || '', precio: p.precio || '', categoria: p.categoria || '', imagen: p.imagen || '', descripcion: p.descripcion || '' });
                            }}>Editar</button>
                              <button className="btn btn-danger" onClick={async () => {
                              if (!window.confirm('¿Eliminar este producto publicado? Esta acción no se puede deshacer.')) return;
                              const res = await ProductosAPI.eliminarProductoPublicado(p.id, currentUser.id);
                              if (res?.exito) {
                                try { const carritoFachada = (await import('../services/fachada/CarritoFachada')).default; carritoFachada.eliminarProductoInventario(p.id); } catch (e) {}
                                cargarPublicados();
                              } else {
                                alert(res.mensaje || 'Error al eliminar');
                              }
                            }}>Eliminar</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          ) : (
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
          )}

          <section style={{ marginTop: '1rem' }}>
            {currentUser.role === 'seller' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate('/vendedor/publicar')}>Publicar producto</button>
              </div>
            ) : (
              <div>
                {!showSellerSignup ? (
                  <div>
                    <button className="btn btn-primary" onClick={() => {
                      // prefill from current user
                      setSellerSignup(prev => ({ ...prev, responsibleName: currentUser.nombre || '', email: currentUser.email || '' }));
                      setShowSellerSignup(true);
                    }}>Convertirme en vendedor</button>
                    <div style={{ marginTop: 8, color: '#666', fontSize: '0.9rem' }}>Al convertirte en vendedor deberás completar los datos obligatorios de tu negocio y pago.</div>
                  </div>
                ) : (
                  <div className="seller-card" style={{ marginTop: 8 }}>
                    <div className="seller-title">Formulario de registro de vendedor (obligatorio)</div>
                    <div className="seller-sub" style={{ marginBottom: 8 }}>Completa los datos para que la plataforma pueda procesar pagos, envíos y facturación.</div>
                    {signupErrors._global && <div className="account-message">{signupErrors._global}</div>}
                    <div className="seller-grid">
                      <div className="seller-field">
                        <label>Nombre completo del responsable *</label>
                        <input value={sellerSignup.responsibleName} onChange={(e) => setSellerSignup(prev => ({ ...prev, responsibleName: e.target.value }))} />
                        {signupErrors.responsibleName && <div className="helper-text" style={{ color: '#b00000' }}>{signupErrors.responsibleName}</div>}
                      </div>

                      <div className="seller-field">
                        <label>Correo electrónico *</label>
                        <input value={sellerSignup.email} onChange={(e) => setSellerSignup(prev => ({ ...prev, email: e.target.value }))} />
                        {signupErrors.email && <div className="helper-text" style={{ color: '#b00000' }}>{signupErrors.email}</div>}
                      </div>

                      <div className="seller-field">
                        <label>Contraseña *</label>
                        <input type="password" value={sellerSignup.password} onChange={(e) => setSellerSignup(prev => ({ ...prev, password: e.target.value }))} />
                        {signupErrors.password && <div className="helper-text" style={{ color: '#b00000' }}>{signupErrors.password}</div>}
                      </div>

                      <div className="seller-field">
                        <label>Número de teléfono *</label>
                        <input value={sellerSignup.phone} onChange={(e) => setSellerSignup(prev => ({ ...prev, phone: e.target.value }))} />
                        {signupErrors.phone && <div className="helper-text" style={{ color: '#b00000' }}>{signupErrors.phone}</div>}
                      </div>

                      <div className="seller-field">
                        <label>Nombre de la tienda o marca *</label>
                        <input value={sellerSignup.storeName} onChange={(e) => setSellerSignup(prev => ({ ...prev, storeName: e.target.value }))} />
                        {signupErrors.storeName && <div className="helper-text" style={{ color: '#b00000' }}>{signupErrors.storeName}</div>}
                      </div>

                      <div className="seller-field">
                        <label>Tipo de vendedor *</label>
                        <select value={sellerSignup.sellerType} onChange={(e) => setSellerSignup(prev => ({ ...prev, sellerType: e.target.value }))}>
                          <option value="individual">Individual / Persona física</option>
                          <option value="company">Empresa registrada</option>
                        </select>
                      </div>

                      <div className="seller-field">
                        <label>Número de identificación fiscal *</label>
                        <input value={sellerSignup.taxId} onChange={(e) => setSellerSignup(prev => ({ ...prev, taxId: e.target.value }))} />
                        {signupErrors.taxId && <div className="helper-text" style={{ color: '#b00000' }}>{signupErrors.taxId}</div>}
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Dirección física del negocio *</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <input placeholder="Dirección completa" value={sellerSignup.businessAddress.line1} onChange={(e) => setSellerSignup(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, line1: e.target.value } }))} />
                          <input placeholder="Provincia / Cantón / Distrito" value={sellerSignup.businessAddress.province} onChange={(e) => setSellerSignup(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, province: e.target.value } }))} />
                          <input placeholder="Código postal" value={sellerSignup.businessAddress.postal} onChange={(e) => setSellerSignup(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, postal: e.target.value } }))} />
                          <input placeholder="País" value={sellerSignup.businessAddress.country} onChange={(e) => setSellerSignup(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, country: e.target.value } }))} />
                        </div>
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Envíos y logística</div>
                        <input placeholder="Dirección de despacho" value={sellerSignup.dispatchAddress.line1} onChange={(e) => setSellerSignup(prev => ({ ...prev, dispatchAddress: { ...prev.dispatchAddress, line1: e.target.value } }))} />
                        <input placeholder="Horarios de despacho" value={sellerSignup.dispatchAddress.schedule} onChange={(e) => setSellerSignup(prev => ({ ...prev, dispatchAddress: { ...prev.dispatchAddress, schedule: e.target.value } }))} />
                        <input placeholder="Métodos de envío (ej. propio, Correos, mensajería)" value={sellerSignup.dispatchAddress.methods} onChange={(e) => setSellerSignup(prev => ({ ...prev, dispatchAddress: { ...prev.dispatchAddress, methods: e.target.value } }))} />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Información bancaria (para recibir pagos)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <input placeholder="Nombre del banco" value={sellerSignup.bankInfo.bankName} onChange={(e) => setSellerSignup(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, bankName: e.target.value } }))} />
                          <input placeholder="Tipo de cuenta" value={sellerSignup.bankInfo.accountType} onChange={(e) => setSellerSignup(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountType: e.target.value } }))} />
                          <input placeholder="Número de cuenta / IBAN" value={sellerSignup.bankInfo.accountNumber} onChange={(e) => setSellerSignup(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountNumber: e.target.value } }))} />
                          <input placeholder="Nombre del titular" value={sellerSignup.bankInfo.accountHolder} onChange={(e) => setSellerSignup(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountHolder: e.target.value } }))} />
                          <input placeholder="Documento del titular" value={sellerSignup.bankInfo.holderDocument} onChange={(e) => setSellerSignup(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, holderDocument: e.target.value } }))} />
                        </div>
                      </div>
                    </div>

                    <div className="seller-actions">
                      <button className="btn btn-primary" onClick={async () => {
                        const errs = {};
                        if (!sellerSignup.responsibleName) errs.responsibleName = 'Requerido';
                        if (!sellerSignup.email) errs.email = 'Requerido';
                        if (!sellerSignup.password) errs.password = 'Requerido';
                        if (!sellerSignup.phone) errs.phone = 'Requerido';
                        if (!sellerSignup.storeName) errs.storeName = 'Requerido';
                        if (!sellerSignup.taxId) errs.taxId = 'Requerido';
                        if (!sellerSignup.businessAddress.line1) errs.businessAddress = 'Dirección del negocio requerida';
                        if (!sellerSignup.bankInfo.bankName || !sellerSignup.bankInfo.accountNumber || !sellerSignup.bankInfo.accountHolder) errs.bankInfo = 'Información bancaria incompleta';
                        setSignupErrors(errs);
                        if (Object.keys(errs).length > 0) return;

                        const perfil = {
                          sellerInfo: {
                            companyName: sellerSignup.storeName,
                            sellerType: sellerSignup.sellerType,
                            taxId: sellerSignup.taxId,
                            businessAddress: sellerSignup.businessAddress,
                            dispatchAddress: sellerSignup.dispatchAddress,
                            bankInfo: sellerSignup.bankInfo,
                            contactPhone: sellerSignup.phone
                          }
                        };

                        const save = actualizarPerfil(perfil);
                        if (!save?.exito) {
                          setSignupErrors({ _global: save?.mensaje || 'No se pudo guardar' });
                          return;
                        }

                        if (sellerSignup.email && sellerSignup.password) {
                          actualizarPerfil({ email: sellerSignup.email });
                          actualizarPerfil({ password: sellerSignup.password });
                        }

                        promoteToSeller();
                        setSellerMsg({ type: 'success', text: 'Cuenta de vendedor creada' });
                        setShowSellerSignup(false);
                        cargarPublicados();
                      }}>Enviar y convertir</button>
                      <button className="btn" onClick={() => setShowSellerSignup(false)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {currentUser.role === 'buyer' && (
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
          )}

          {currentUser.role === 'seller' && (
            <section style={{ marginTop: '1rem' }}>
              <h3>Información de vendedor</h3>
              <div className="seller-card">
                {sellerMsg && <div className="account-message">{sellerMsg.text}</div>}
                <div className="seller-header">
                  <div>
                    <div className="seller-title">Configuración de cobros y contacto</div>
                  </div>
                  <div className="payout-badge">Procesado por la plataforma</div>
                </div>

                <div className="seller-grid">
                  <div className="seller-field">
                    <label>Nombre de la empresa / persona</label>
                    <input placeholder="Nombre de la empresa / persona" value={sellerInfo.companyName} onChange={(e) => setSellerInfo(prev => ({ ...prev, companyName: e.target.value }))} />
                  </div>

                  <div className="seller-field">
                    <label>Identificación fiscal</label>
                    <input placeholder="Identificación fiscal (NIT / cédula)" value={sellerInfo.taxId} onChange={(e) => setSellerInfo(prev => ({ ...prev, taxId: e.target.value }))} />
                  </div>

                  <div className="seller-field">
                    <label>Tipo de vendedor</label>
                    <select value={sellerInfo.sellerType} onChange={(e) => setSellerInfo(prev => ({ ...prev, sellerType: e.target.value }))}>
                      <option value="individual">Individual / Persona física</option>
                      <option value="company">Empresa registrada</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Dirección física del negocio</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input placeholder="Dirección completa" value={sellerInfo.businessAddress?.line1 || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, businessAddress: { ...(prev.businessAddress || {}), line1: e.target.value } }))} />
                      <input placeholder="Provincia / Cantón / Distrito" value={sellerInfo.businessAddress?.province || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, businessAddress: { ...(prev.businessAddress || {}), province: e.target.value } }))} />
                      <input placeholder="Código postal" value={sellerInfo.businessAddress?.postal || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, businessAddress: { ...(prev.businessAddress || {}), postal: e.target.value } }))} />
                      <input placeholder="País" value={sellerInfo.businessAddress?.country || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, businessAddress: { ...(prev.businessAddress || {}), country: e.target.value } }))} />
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Envíos y logística</div>
                    <input placeholder="Dirección de despacho" value={sellerInfo.dispatchAddress?.line1 || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, dispatchAddress: { ...(prev.dispatchAddress || {}), line1: e.target.value } }))} />
                    <input placeholder="Horarios de despacho" value={sellerInfo.dispatchAddress?.schedule || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, dispatchAddress: { ...(prev.dispatchAddress || {}), schedule: e.target.value } }))} />
                    <input placeholder="Métodos de envío" value={sellerInfo.dispatchAddress?.methods || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, dispatchAddress: { ...(prev.dispatchAddress || {}), methods: e.target.value } }))} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Información bancaria (preferencia de cobro)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input placeholder="Nombre del banco" value={sellerInfo.bankInfo?.bankName || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, bankInfo: { ...(prev.bankInfo || {}), bankName: e.target.value } }))} />
                      <input placeholder="Tipo de cuenta" value={sellerInfo.bankInfo?.accountType || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, bankInfo: { ...(prev.bankInfo || {}), accountType: e.target.value } }))} />
                      <input placeholder="Número de cuenta / IBAN" value={sellerInfo.bankInfo?.accountNumber || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, bankInfo: { ...(prev.bankInfo || {}), accountNumber: e.target.value } }))} />
                      <input placeholder="Nombre del titular" value={sellerInfo.bankInfo?.accountHolder || ''} onChange={(e) => setSellerInfo(prev => ({ ...prev, bankInfo: { ...(prev.bankInfo || {}), accountHolder: e.target.value } }))} />
                    </div>
                  </div>
                </div>

                <div className="seller-actions">
                  <button className="btn btn-primary" onClick={() => {
                    const res = actualizarPerfil({ sellerInfo });
                    if (res?.exito) {
                      setSellerMsg({ type: 'success', text: 'Información guardada' });
                      setTimeout(() => setSellerMsg(null), 3000);
                      cargarPublicados();
                    } else {
                      setSellerMsg({ type: 'error', text: res.mensaje || 'Error guardando' });
                    }
                  }}>Guardar información</button>

                  <button className="btn" onClick={() => setSellerInfo({ companyName: '', sellerType: 'individual', taxId: '', businessAddress: { line1: '', province: '', canton: '', district: '', postal: '', country: '' }, dispatchAddress: { line1: '', schedule: '', methods: '' }, bankInfo: { bankName: '', accountType: '', accountNumber: '', accountHolder: '', holderDocument: '' }, payoutMethod: 'bank', paypalEmail: '', contactPhone: '' })}>Limpiar</button>
                </div>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
};

export default Account;
