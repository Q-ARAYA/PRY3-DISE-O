import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';
import { ProductosAPI } from '../services/ProductosAPI';
import carritoFachada from '../services/fachada/CarritoFachada';
import './Account.css';

const SellerPublish = () => {
  const { currentUser } = useCuenta();
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', imagen: '', descripcion: '' });
  const [stock, setStock] = useState(99);
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [categories, setCategories] = useState([]);
  const [useOtherCategory, setUseOtherCategory] = useState(false);
  const [msg, setMsg] = useState(null);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Redirect if not authenticated or not seller (do not show the intermediate message)
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser && currentUser.role !== 'seller') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const cargarCats = async () => {
      try {
        const cats = await ProductosAPI.obtenerCategorias();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) { setCategories([]); }
    };
    cargarCats();
  }, []);

  if (!currentUser || (currentUser && currentUser.role !== 'seller')) return null;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setPreviewUrl('');
    // clear file input if present
    try { if (fileInputRef.current) fileInputRef.current.value = ''; } catch (e) {}
    // also clear URL field so payload will prefer url only if set
    setForm(prev => ({ ...prev, imagen: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imagenField = form.imagen || '';
    if (mediaFile) {
      try {
        imagenField = await readFileAsDataURL(mediaFile);
      } catch (e) {
        console.error('Error leyendo archivo', e);
      }
    }

    const payload = {
      nombre: form.nombre,
      precio: parseFloat(form.precio) || 0,
      categoria: (useOtherCategory ? (form.categoria || 'otros') : (form.categoria || 'otros')),
      imagen: imagenField,
      descripcion: form.descripcion || '',
      stock: parseInt(stock, 10) || 0,
      sellerId: currentUser.id
    };

    const res = await ProductosAPI.publicarProducto(payload);
    if (res?.exito) {
      setMsg({ type: 'success', text: 'Producto publicado correctamente' });
      // add published product to inventory so other users can add to cart
      try {
        carritoFachada.inicializarInventario([res.producto]);
      } catch (e) {}
      setTimeout(() => navigate(`/producto/${res.producto.id}`), 800);
    } else {
      setMsg({ type: 'error', text: res.mensaje || 'Error al publicar' });
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    setMediaFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (e) { setPreviewUrl(''); }
  };

  const onFileInputChange = (e) => {
    const f = e.target.files && e.target.files[0];
    handleFileSelected(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFileSelected(f);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };

  

  return (
    <main className="account-page">
      <div className="account-container">
        <section className="account-main">
          <h2>Publicar Producto</h2>
          {msg && (
            <div className="account-message" style={{ background: msg.type === 'success' ? '#e6ffed' : '#ffecec', color: msg.type === 'success' ? '#064e2a' : '#b00000' }}>{msg.text}</div>
          )}

          <form onSubmit={handleSubmit} className="register-two-column seller-publish-form">
            <div className="register-column-left">
              <div className="column-title">Información del producto</div>
              <label>Nombre del producto
                <input className="form-input" name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={handleChange} required />
              </label>

              <label>Precio
                <input className="form-input" name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} required />
              </label>

              <label>Stock disponible
                <input className="form-input" name="stock" type="number" min={0} placeholder="Stock disponible" value={stock} onChange={(e) => setStock(e.target.value)} />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', alignItems: 'start' }}>
                <label style={{ marginBottom: 0 }}>Categoría
                  <select className="form-input" name="categoria" value={form.categoria} onChange={(e) => { handleChange(e); setUseOtherCategory(e.target.value === '__other'); }}>
                    <option value="">-- Selecciona --</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__other">Otra...</option>
                  </select>
                </label>
              </div>

              {useOtherCategory && (
                <label style={{ marginTop: 6 }}>Otra categoría
                  <input className="form-input" name="categoria" placeholder="Ingrese nueva categoría" value={form.categoria} onChange={handleChange} />
                </label>
              )}

              <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
                <button type="submit" className="btn btn-primary">Publicar</button>
                <button type="button" className="btn" onClick={() => navigate(-1)}>Cancelar</button>
              </div>
            </div>

            <div className="register-column-right">
              <label>Descripción
                <textarea className="form-input" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} rows={6} />
              </label>
              
              <div className="column-title">Imagen o video</div>
              <div
                className={`media-dropzone${isDragOver ? ' dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={onFileInputChange} style={{ display: 'none' }} />

                {!previewUrl && (
                  <div className="upload-placeholder">
                    <svg width="34" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12 3v10" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 7l4-4 4 4" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="13" width="18" height="7" rx="2" stroke="#27AE60" strokeWidth="1.2"/>
                    </svg>
                    <div style={{ fontSize: 15, color: '#0b3d24', fontWeight: 700 }}>Arrastra un archivo aquí para subirlo, o <span className="browse-link" onClick={() => fileInputRef.current && fileInputRef.current.click()}>haz clic aquí para buscar</span></div>
                  </div>
                )}

                {previewUrl && (
                  <div className="media-preview" style={{ marginTop: 8 }}>
                    <button type="button" className="remove-overlay" onClick={handleRemoveMedia}>✕</button>
                    {mediaFile && (mediaFile.type.startsWith('video/') ? (
                      <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: 240 }} />
                    ) : (
                      <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 240 }} />
                    ))}
                    <div className="media-info">
                      <div className="filename">{mediaFile ? mediaFile.name : 'Archivo seleccionado'}</div>
                      <div className="filesize">{mediaFile ? (mediaFile.size/1024).toFixed(1) + ' KB' : ''}</div>
                    </div>
                  </div>
                )}
              </div>

              <label style={{ marginTop: 10 }}>URL de imagen (opcional)
                <input className="form-input" name="imagen" placeholder="URL de imagen (opcional)" value={form.imagen} onChange={handleChange} />
              </label>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default SellerPublish;
