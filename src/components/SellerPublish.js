import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';
import { ProductosAPI } from '../services/ProductosAPI';
import carritoFachada from '../services/fachada/CarritoFachada';

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
    <main style={{ padding: '2rem' }}>
      <h2>Publicar Producto</h2>
      {msg && (
        <div style={{ padding: 8, background: msg.type === 'success' ? '#e6ffed' : '#ffecec', color: msg.type === 'success' ? '#064e2a' : '#b00000' }}>{msg.text}</div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
        <input name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={handleChange} required />
        <input name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} required />
        <input name="stock" type="number" min={0} placeholder="Stock disponible" value={stock} onChange={(e) => setStock(e.target.value)} />

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Categoría
          <select name="categoria" value={form.categoria} onChange={(e) => { handleChange(e); setUseOtherCategory(e.target.value === '__other'); }}>
            <option value="">-- Selecciona --</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__other">Otra...</option>
          </select>
        </label>

        {useOtherCategory && (
          <input name="categoria" placeholder="Ingrese nueva categoría" value={form.categoria} onChange={handleChange} />
        )}

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Imagen o video (arrastra aquí o selecciona)</label>
          <div
            className={`media-dropzone${isDragOver ? ' dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{ padding: 12, border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}
          >
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={onFileInputChange} style={{ display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 13, color: '#666' }}>O pega la URL en el campo de abajo</div>
            {previewUrl && (
              <div className="media-preview" style={{ marginTop: 8 }}>
                {mediaFile && (mediaFile.type.startsWith('video/') ? (
                  <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: 240 }} />
                ) : (
                  <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 240 }} />
                ))}
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <button type="button" className="btn" onClick={handleRemoveMedia} style={{ marginLeft: 8 }}>Quitar</button>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <input name="imagen" placeholder="URL de imagen (opcional)" value={form.imagen} onChange={handleChange} />
          </div>
        </div>
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} rows={6} />
        <div>
          <button type="submit">Publicar</button>
          <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>Cancelar</button>
        </div>
      </form>
    </main>
  );
};

export default SellerPublish;
