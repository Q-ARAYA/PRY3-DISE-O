/**
 * GestorProductos
 * Maneja la lógica de gestión de productos en el carrito
 */
class GestorProductos {
  constructor() {
    this.productos = [];
  }

  /**
   * Agregar un producto al carrito
   */
  agregarProducto(producto, cantidad = 1) {
    const productoExistente = this.productos.find(p => p.id === producto.id);
    
    if (productoExistente) {
      productoExistente.cantidad += cantidad;
    } else {
      this.productos.push({
        ...producto,
        cantidad: cantidad
      });
    }
    
    return this.productos;
  }

  /**
   * Eliminar un producto del carrito
   */
  eliminarProducto(productoId) {
    this.productos = this.productos.filter(p => p.id !== productoId);
    return this.productos;
  }

  /**
   * Actualizar la cantidad de un producto
   */
  actualizarCantidad(productoId, cantidad) {
    const producto = this.productos.find(p => p.id === productoId);
    
    if (producto) {
      if (cantidad <= 0) {
        return this.eliminarProducto(productoId);
      }
      producto.cantidad = cantidad;
    }
    
    return this.productos;
  }

  /**
   * Obtener todos los productos del carrito
   */
  obtenerProductos() {
    return [...this.productos];
  }

  /**
   * Obtener la cantidad total de productos
   */
  obtenerCantidadTotal() {
    return this.productos.reduce((total, producto) => total + producto.cantidad, 0);
  }

  /**
   * Limpiar el carrito
   */
  limpiarCarrito() {
    this.productos = [];
    return this.productos;
  }

  /**
   * Verificar si un producto está en el carrito
   */
  existeProducto(productoId) {
    return this.productos.some(p => p.id === productoId);
  }
}

export default GestorProductos;
