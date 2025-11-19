/**
 * Servicio para consumir la API de productos
 * Utilizamos Fake Store API como fuente de datos de ejemplo
 */

const API_URL = 'https://fakestoreapi.com';
const LOCAL_KEY = 'pry3_local_products_v1';

const _loadLocal = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
};

const _saveLocal = (arr) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(arr)); } catch (e) {}
};

export const ProductosAPI = {
  /**
   * Obtiene todos los productos disponibles
   */
  obtenerTodos: async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      const productos = await response.json();

      // Adaptamos la estructura de la API a nuestro formato
      let mapped = productos.map(producto => ({
        id: producto.id,
        nombre: producto.title,
        precio: parseFloat(producto.price),
        imagen: producto.image,
        descripcion: producto.description,
        categoria: producto.category,
        stock: Math.floor(Math.random() * 50) + 10, // Simulamos stock aleatorio
        rating: producto.rating
      }));

      // Si la API devuelve pocos productos (ej. FakeStore ~20), expandimos creando variantes
      const desiredCount = 40; // objetivo de productos
      if (mapped.length > 0 && mapped.length < desiredCount) {
        const clones = [];
        let nextId = mapped.reduce((max, p) => Math.max(max, Number(p.id)), 0) + 1;
        while (mapped.length + clones.length < desiredCount) {
          const original = mapped[(clones.length) % mapped.length];
          const variantIndex = Math.floor(clones.length / mapped.length) + 1;
          const nueva = { ...original };
          nueva.id = nextId++;
          nueva.nombre = `${original.nombre} (Variante ${variantIndex})`;
          // small price variation
          const variation = (Math.random() * 0.15) - 0.05; // -5% .. +10%
          nueva.precio = parseFloat((original.precio * (1 + variation)).toFixed(2));
          // mark as clone of original so UI can filter duplicates if needed
          nueva.variantOf = original.id;
          clones.push(nueva);
        }
        mapped = mapped.concat(clones);
      }

      // append local products published by users
      const local = _loadLocal();
      const localMapped = (local || []).map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagen,
        descripcion: p.descripcion,
        categoria: p.categoria,
        stock: p.stock ?? 99,
        rating: p.rating ?? null,
        sellerId: p.sellerId
      }));

      return mapped.concat(localMapped);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      return [];
    }
  },

  /**
   * Obtiene productos por categoría
   */
  obtenerPorCategoria: async (categoria) => {
    try {
      const response = await fetch(`${API_URL}/products/category/${categoria}`);
      if (!response.ok) {
        throw new Error('Error al obtener productos por categoría');
      }
      const productos = await response.json();
      
      const mapped = productos.map(producto => ({
        id: producto.id,
        nombre: producto.title,
        precio: parseFloat(producto.price),
        imagen: producto.image,
        descripcion: producto.description,
        categoria: producto.category,
        stock: Math.floor(Math.random() * 50) + 10,
        rating: producto.rating
      }));

      // include local published products with matching category
      const local = _loadLocal().filter(p => (p.categoria || '').toLowerCase() === (categoria || '').toLowerCase());
      const localMapped = local.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagen,
        descripcion: p.descripcion,
        categoria: p.categoria,
        stock: p.stock ?? 99,
        rating: p.rating ?? null,
        sellerId: p.sellerId
      }));

      return mapped.concat(localMapped);
    } catch (error) {
      console.error('Error al cargar productos por categoría:', error);
      return [];
    }
  },

  /**
   * Obtiene todas las categorías disponibles
   */
  obtenerCategorias: async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      return [];
    }
  },

  /**
   * Obtiene un producto específico por ID
   */
  obtenerPorId: async (id) => {
    try {
      // check local published products first
      const local = _loadLocal();
      const lp = local.find(p => String(p.id) === String(id));
      if (lp) return {
        id: lp.id,
        nombre: lp.nombre,
        precio: lp.precio,
        imagen: lp.imagen,
        descripcion: lp.descripcion,
        categoria: lp.categoria,
        stock: lp.stock ?? 99,
        rating: lp.rating ?? null,
        sellerId: lp.sellerId
      };

      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener producto');
      }
      const producto = await response.json();

      return {
        id: producto.id,
        nombre: producto.title,
        precio: parseFloat(producto.price),
        imagen: producto.image,
        descripcion: producto.description,
        categoria: producto.category,
        stock: Math.floor(Math.random() * 50) + 10,
        rating: producto.rating
      };
    } catch (error) {
      console.error('Error al cargar producto:', error);
      return null;
    }
  },

  /**
   * Limita la cantidad de productos retornados
   */
  obtenerLimitados: async (limite = 8) => {
    try {
      const response = await fetch(`${API_URL}/products?limit=${limite}`);
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      const productos = await response.json();
      
      return productos.map(producto => ({
        id: producto.id,
        nombre: producto.title,
        precio: parseFloat(producto.price),
        imagen: producto.image,
        descripcion: producto.description,
        categoria: producto.category,
        stock: Math.floor(Math.random() * 50) + 10,
        rating: producto.rating
      }));
    } catch (error) {
      console.error('Error al cargar productos limitados:', error);
      return [];
    }
  }
,
  publicarProducto: async (producto) => {
    try {
      const local = _loadLocal();
      const id = `lp-${Date.now()}`;
      const nuevo = {
        id,
        nombre: producto.nombre || producto.title || 'Producto',
        precio: producto.precio || producto.price || 0,
        imagen: producto.imagen || producto.image || '',
        descripcion: producto.descripcion || producto.description || '',
        categoria: producto.categoria || producto.category || 'otros',
        stock: producto.stock ?? 99,
        rating: producto.rating ?? null,
        sellerId: producto.sellerId || null,
        fechaPublicacion: new Date().toISOString()
      };
      const next = [...local, nuevo];
      _saveLocal(next);
      return { exito: true, producto: nuevo };
    } catch (error) {
      console.error('Error publicando producto:', error);
      return { exito: false, mensaje: 'Error al publicar' };
    }
  }
,
  editarProductoPublicado: async (producto) => {
    try {
      const local = _loadLocal();
      const idx = local.findIndex(p => String(p.id) === String(producto.id));
      if (idx === -1) return { exito: false, mensaje: 'Producto no encontrado' };
      // Only allow editing if sellerId matches (basic client-side check)
      if (local[idx].sellerId && producto.sellerId && String(local[idx].sellerId) !== String(producto.sellerId)) {
        return { exito: false, mensaje: 'No autorizado' };
      }
      const updated = { ...local[idx], ...producto, fechaModificacion: new Date().toISOString() };
      local[idx] = updated;
      _saveLocal(local);
      return { exito: true, producto: updated };
    } catch (error) {
      console.error('Error editando producto:', error);
      return { exito: false, mensaje: 'Error al editar' };
    }
  },
  eliminarProductoPublicado: async (id, sellerId) => {
    try {
      const local = _loadLocal();
      const idx = local.findIndex(p => String(p.id) === String(id));
      if (idx === -1) return { exito: false, mensaje: 'Producto no encontrado' };
      if (local[idx].sellerId && sellerId && String(local[idx].sellerId) !== String(sellerId)) {
        return { exito: false, mensaje: 'No autorizado' };
      }
      const next = local.filter(p => String(p.id) !== String(id));
      _saveLocal(next);
      return { exito: true };
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return { exito: false, mensaje: 'Error al eliminar' };
    }
  }
};
