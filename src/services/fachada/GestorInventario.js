/**
 * GestorInventario
 * Maneja la verificación de disponibilidad de productos
 */
class GestorInventario {
  constructor() {
    // Simulación de inventario
    this.inventario = new Map();
  }

  /**
   * Obtener estado serializable del inventario (para mementos)
   */
  getEstadoInventario() {
    const estado = [];
    this.inventario.forEach((value, key) => {
      estado.push({ id: key, disponible: value.disponible, stock: value.stock, reservado: value.reservado });
    });
    return estado;
  }

  /**
   * Restaurar estado del inventario desde un snapshot
   */
  setEstadoInventario(estadoArray) {
    this.inventario = new Map();
    if (!Array.isArray(estadoArray)) return;
    estadoArray.forEach(item => {
      this.inventario.set(item.id, {
        disponible: item.disponible,
        stock: item.stock,
        reservado: item.reservado
      });
    });
  }

  /**
   * Inicializar inventario de productos
   */
  inicializarInventario(productos) {
    productos.forEach(producto => {
      this.inventario.set(producto.id, {
        disponible: true,
        stock: producto.stock || 100, // Usar stock real o 100 por defecto
        reservado: 0
      });
    });
  }

  /**
   * Verificar disponibilidad de un producto
   */
  verificarDisponibilidad(productoId, cantidad) {
    const item = this.inventario.get(productoId);
    
    if (!item) {
      return { disponible: false, mensaje: 'Producto no encontrado' };
    }

    if (!item.disponible) {
      return { disponible: false, mensaje: 'Producto no disponible' };
    }

    const stockDisponible = item.stock - item.reservado;
    
    if (stockDisponible < cantidad) {
      return { 
        disponible: false, 
        mensaje: `Solo hay ${stockDisponible} unidades disponibles`,
        stockDisponible: stockDisponible
      };
    }

    return { disponible: true, mensaje: 'Producto disponible' };
  }

  /**
   * Reservar productos (al agregar al carrito)
   */
  reservarProducto(productoId, cantidad) {
    const item = this.inventario.get(productoId);
    
    if (item) {
      item.reservado += cantidad;
      return true;
    }
    
    return false;
  }

  /**
   * Liberar productos reservados (al eliminar del carrito)
   */
  liberarProducto(productoId, cantidad) {
    const item = this.inventario.get(productoId);
    
    if (item) {
      item.reservado = Math.max(0, item.reservado - cantidad);
      return true;
    }
    
    return false;
  }

  /**
   * Confirmar compra (actualizar stock)
   */
  confirmarCompra(productos) {
    productos.forEach(producto => {
      const item = this.inventario.get(producto.id);
      if (item) {
        item.stock -= producto.cantidad;
        item.reservado -= producto.cantidad;
      }
    });
    
    return true;
  }

  /**
   * Obtener stock disponible de un producto
   */
  obtenerStock(productoId) {
    const item = this.inventario.get(productoId);
    if (item) {
      return item.stock - item.reservado;
    }
    return 0;
  }

  /**
   * Eliminar producto del inventario (al borrar publicación)
   */
  eliminarProducto(productoId) {
    try {
      return this.inventario.delete(productoId);
    } catch (e) {
      return false;
    }
  }
}

export default GestorInventario;
