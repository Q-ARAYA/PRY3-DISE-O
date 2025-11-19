/**
 * GestorProductos
 * Maneja la lógica de gestión de productos en el carrito
 */
class GestorProductos {
  constructor() {
    this.productos = [];
  }

  _generateCartItemId(baseId) {
    return `${baseId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  }

  _makeGroupKey(baseId, decorators = []) {
    // For this app we want a single line per base product regardless of decorators.
    // Use only the baseId as the grouping key so additions merge into one line.
    return String(baseId);
  }

  /**
   * Agregar un producto al carrito
   */
  /**
   * Agregar un producto al carrito.
   * producto puede contener `decoratorsApplied` y `baseId` opcional.
   * mergeIfSame: si true, agrupa ítems con misma groupKey
   */
  agregarProducto(producto, cantidad = 1, mergeIfSame = true) {
    const baseId = producto.baseId || producto.id;
    const decorators = producto.decoratorsApplied || [];
    const groupKey = this._makeGroupKey(baseId, decorators);

    if (mergeIfSame) {
      const existente = this.productos.find(p => p.groupKey === groupKey);
      if (existente) {
        existente.cantidad += cantidad;
        return this.productos;
      }
    }

    const cartItem = {
      cartItemId: this._generateCartItemId(baseId),
      baseId: baseId,
      id: baseId,
      nombre: producto.nombre || producto.name,
      imagen: producto.imagen || producto.image,
      cantidad: cantidad,
      basePrice: producto.basePrice || producto.price || producto.originalPrice || 0,
      price: producto.price || producto.basePrice || producto.originalPrice || 0,
      decoratorsApplied: Array.isArray(decorators) ? decorators.slice() : [],
      groupKey: groupKey
    };

    this.productos.push(cartItem);
    return this.productos;
  }

  /**
   * Eliminar un producto del carrito
   */
  eliminarProducto(productoId) {
    // Intentar eliminar por cartItemId primero
    if (this.productos.some(p => p.cartItemId === productoId)) {
      this.productos = this.productos.filter(p => p.cartItemId !== productoId);
      return this.productos;
    }

    // Si no coincide, eliminar todas las líneas cuyo baseId coincida
    this.productos = this.productos.filter(p => p.baseId !== productoId);
    return this.productos;
  }

  /**
   * Actualizar la cantidad de un producto
   */
  actualizarCantidad(productoId, cantidad) {
    // Buscar por cartItemId
    let producto = this.productos.find(p => p.cartItemId === productoId);
    // Si no existe, buscar por baseId y tomar la primera coincidencia
    if (!producto) producto = this.productos.find(p => p.baseId === productoId);

    if (producto) {
      if (cantidad <= 0) {
        return this.eliminarProducto(producto.cartItemId || producto.baseId);
      }
      producto.cantidad = cantidad;
    }

    return this.productos;
  }

  /**
   * Actualizar campos de un item del carrito (precio, decoratorsApplied, groupKey)
   * Si existe otra línea con el mismo groupKey se hace merge de cantidades.
   */
  actualizarItem(cartItemId, updates = {}) {
    const idx = this.productos.findIndex(p => p.cartItemId === cartItemId || p.id === cartItemId);
    if (idx === -1) return this.productos;

    const existing = { ...this.productos[idx] };
    const nuevo = { ...existing, ...updates };

    // Asegurar baseId
    const baseId = nuevo.baseId || nuevo.id;
    const decorators = nuevo.decoratorsApplied || [];
    nuevo.groupKey = this._makeGroupKey(baseId, decorators);

    // Intentar merge con otra línea existente (misma groupKey)
    const otherIdx = this.productos.findIndex(p => p.groupKey === nuevo.groupKey && p.cartItemId !== existing.cartItemId);
    if (otherIdx !== -1) {
      // sumar cantidades
      this.productos[otherIdx].cantidad += nuevo.cantidad;
      // eliminar la línea original
      this.productos.splice(idx, 1);
      return this.productos;
    }

    // Reemplazar item
    this.productos[idx] = { ...this.productos[idx], ...nuevo };
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
   * Reemplazar la lista completa de productos (útil para restaurar estados)
   */
  setProductos(productos) {
    this.productos = productos.map(p => ({ ...p }));
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
