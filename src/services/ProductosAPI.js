/**
 * Servicio para consumir la API de productos
 * Utilizamos Fake Store API como fuente de datos de ejemplo
 */

const API_URL = 'https://fakestoreapi.com';

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
      return productos.map(producto => ({
        id: producto.id,
        nombre: producto.title,
        precio: parseFloat(producto.price),
        imagen: producto.image,
        descripcion: producto.description,
        categoria: producto.category,
        stock: Math.floor(Math.random() * 50) + 10, // Simulamos stock aleatorio
        rating: producto.rating
      }));
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
};
