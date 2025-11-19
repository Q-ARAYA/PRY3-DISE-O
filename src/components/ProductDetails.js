import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductCard.css';
import './ProductDetails.css';
import { ProductosAPI } from '../services/ProductosAPI';
import { ProductDecorator } from '../services/decorator/ProductDecorator';
import { useCarrito } from '../context/CarritoContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [decoratorSelection, setDecoratorSelection] = useState('');
  const [decoratorChecks, setDecoratorChecks] = useState({ envio: false, garantia: false, envoltura: false });
  const [selectedCartItem, setSelectedCartItem] = useState('');
  const { agregarProducto, decorarProducto, quitarDecorador, productos } = useCarrito();
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, texto: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

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
    // load reviews
    try {
      const raw = localStorage.getItem('pry3_reviews_v1');
      const parsed = raw ? JSON.parse(raw) : {};
      setReviews(parsed[id] || []);
    } catch (e) { setReviews([]); }
  }, [id]);

  if (cargando) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (!producto) return <div style={{ padding: '2rem' }}>Producto no encontrado</div>;

  const handleAgregar = async () => {
    // Construir lista de decoradores seleccionados
    const seleccionados = Object.keys(decoratorChecks).filter(k => decoratorChecks[k]);
    const tiposToApply = seleccionados.length > 0 ? seleccionados : (decoratorSelection ? [decoratorSelection] : []);

    // Aplicar decoradores sobre el producto antes de agregar al carrito para que precio refleje cambios
    let productoParaAgregar = { ...producto };
    productoParaAgregar = ProductDecorator.ensureBasePrice(productoParaAgregar);
    if (tiposToApply.length > 0) {
      for (const tipo of tiposToApply) {
        if (tipo === 'envio') productoParaAgregar = ProductDecorator.aplicarEnvioRapido(productoParaAgregar, 5);
        else if (tipo === 'garantia') productoParaAgregar = ProductDecorator.aplicarGarantiaExtendida(productoParaAgregar, 10);
        else if (tipo === 'envoltura') productoParaAgregar = ProductDecorator.aplicarEnvolturaRegalo(productoParaAgregar, 2);
      }
    }

    const res = agregarProducto(productoParaAgregar, 1);
    if (res.exito) {
      // After adding, ensure the cart line reflects current decorator selections
      const seleccionados = Object.keys(decoratorChecks).filter(k => decoratorChecks[k]);
      const tiposToApply = seleccionados.length > 0 ? seleccionados : (decoratorSelection ? [decoratorSelection] : []);
      if (tiposToApply.length > 0) {
        // find the cart line for this base product and apply decorators
        const cartItems = productos.filter(p => String(p.baseId) === String(producto.id) || String(p.id) === String(producto.id));
        if (cartItems.length > 0) {
          const target = cartItems[0];
          await decorarProducto(target.cartItemId || target.id, tiposToApply);
        }
      }
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

  const saveReviewsToStorage = (all) => {
    try {
      localStorage.setItem('pry3_reviews_v1', JSON.stringify(all));
    } catch (e) {}
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    const newRev = { id: `r-${Date.now()}`, rating: parseInt(reviewForm.rating,10)||5, texto: reviewForm.texto || '', fecha: new Date().toISOString() };
    const next = [newRev, ...reviews];
    setReviews(next);
    // persist
    try {
      const raw = localStorage.getItem('pry3_reviews_v1');
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[id] = next;
      saveReviewsToStorage(parsed);
    } catch (e) {}
    setReviewForm({ rating: 5, texto: '' });
  };

  const averageRating = reviews.length === 0 ? null : (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1);

  return (
    <div className="product-details">
      <div className="product-details-inner">
        <div className="product-image-large">
          <img src={producto.image} alt={producto.name} />
        </div>
        <div className="product-details-info">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ margin: 0 }}>{producto.name}</h2>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
            </div>
          </div>
          <p className="product-price">${producto.price}</p>
          <p>{producto.descripcion}</p>
          <div style={{ marginTop: '1rem' }}>
            <h4>Opciones adicionales</h4>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <input aria-label="Envío rápido" type="checkbox" checked={decoratorChecks.envio} onChange={async (e) => {
                    const next = { ...decoratorChecks, envio: e.target.checked };
                    setDecoratorChecks(next);
                    // if product already in cart, update its decorators immediately
                    const cartItems = productos.filter(p => String(p.baseId) === String(producto.id) || String(p.id) === String(producto.id));
                    if (cartItems.length > 0) {
                      const tipos = [];
                      if (next.envio) tipos.push('envio');
                      if (next.garantia) tipos.push('garantia');
                      if (next.envoltura) tipos.push('envoltura');
                      // update first matching line
                      const target = cartItems[0];
                      await decorarProducto(target.cartItemId || target.id, tipos);
                    }
                  }} />
                  Envío rápido (+$5)
                </label>
                <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <input aria-label="Garantía extendida" type="checkbox" checked={decoratorChecks.garantia} onChange={async (e) => {
                    const next = { ...decoratorChecks, garantia: e.target.checked };
                    setDecoratorChecks(next);
                    const cartItems = productos.filter(p => String(p.baseId) === String(producto.id) || String(p.id) === String(producto.id));
                    if (cartItems.length > 0) {
                      const tipos = [];
                      if (next.envio) tipos.push('envio');
                      if (next.garantia) tipos.push('garantia');
                      if (next.envoltura) tipos.push('envoltura');
                      const target = cartItems[0];
                      await decorarProducto(target.cartItemId || target.id, tipos);
                    }
                  }} />
                  Garantía (+10%)
                </label>
                <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <input aria-label="Envoltura de regalo" type="checkbox" checked={decoratorChecks.envoltura} onChange={async (e) => {
                    const next = { ...decoratorChecks, envoltura: e.target.checked };
                    setDecoratorChecks(next);
                    const cartItems = productos.filter(p => String(p.baseId) === String(producto.id) || String(p.id) === String(producto.id));
                    if (cartItems.length > 0) {
                      const tipos = [];
                      if (next.envio) tipos.push('envio');
                      if (next.garantia) tipos.push('garantia');
                      if (next.envoltura) tipos.push('envoltura');
                      const target = cartItems[0];
                      await decorarProducto(target.cartItemId || target.id, tipos);
                    }
                  }} />
                  Envoltura (+$2)
                </label>
              </div>
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              <button className="add-to-cart-btn" onClick={handleAgregar}>Agregar al carrito</button>
            </div>
            <div style={{ marginTop: 12 }}>
                {(() => {
                  const cartItems = productos.filter(p => String(p.baseId) === String(producto.id));
                  if (cartItems.length === 0) {
                    return <p style={{ color: '#666' }}>Después de agregar, aquí podrás ver las opciones aplicadas.</p>;
                  }

                  return (
                    <>
                      <div>
                        <strong>Opciones agregadas:</strong>
                        <div>
                          {cartItems.map((ci, idx) => (
                            <div key={ci.cartItemId || ci.id} style={{ marginBottom: '0.25rem' }}>
                              <div>
                                {(ci.decoratorsApplied || []).length === 0 ? (
                                  <span style={{ color: '#888', marginLeft: '0.5rem' }}>Sin opciones</span>
                                ) : (
                                  (ci.decoratorsApplied || []).map((d, i) => (
                                    <span key={i} style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '0.25rem' }} className="badge">
                                      <span>{d.tipo}</span>
                                      <button title="Quitar decorador" onClick={async () => {
                                        const r = await quitarDecorador(ci.cartItemId || ci.id, d.tipo);
                                        if (!r?.exito) alert(r.mensaje || 'No se pudo quitar el decorador');
                                      }} style={{ background: 'transparent', border: 'none', color: '#b00000', cursor: 'pointer' }}>✕</button>
                                    </span>
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

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Reseñas {averageRating ? `· ${averageRating} ⭐` : ''}
              <button aria-pressed={showReviewForm} onClick={() => setShowReviewForm(prev => !prev)} className="btn" style={{ marginLeft: 12 }}>{showReviewForm ? 'Cancelar' : 'Escribir reseña'}</button>
            </h4>

            {showReviewForm && (
              <div style={{ marginTop: 8 }}>
                <form onSubmit={handleAddReview} style={{ display:'flex', gap:8, flexDirection:'column', maxWidth: 560 }}>
                  <label style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span>Calificación</span>
                    <select value={reviewForm.rating} onChange={(e)=>setReviewForm(prev=>({...prev, rating: e.target.value}))}>
                      <option value={5}>5</option>
                      <option value={4}>4</option>
                      <option value={3}>3</option>
                      <option value={2}>2</option>
                      <option value={1}>1</option>
                    </select>
                  </label>
                  <textarea placeholder="Escribe tu reseña" value={reviewForm.texto} onChange={(e)=>setReviewForm(prev=>({...prev, texto: e.target.value}))} rows={3} />
                  <div>
                    <button className="add-to-cart-btn" type="submit">Publicar reseña</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              {reviews.length === 0 ? <div style={{ color:'#666' }}>Sé el primero en reseñar este producto.</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ padding:10, borderRadius:8, border:'1px solid #eef4ee', background:'#fbfff9' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <strong>{'Usuario'}</strong>
                        <small style={{ color:'#666' }}>{new Date(r.fecha).toLocaleString()}</small>
                      </div>
                      <div style={{ marginTop:6 }}><span style={{ color:'#2b6b3a', fontWeight:700 }}>{'⭐'.repeat(r.rating)}</span></div>
                      <div style={{ marginTop:8, color:'#333' }}>{r.texto}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
