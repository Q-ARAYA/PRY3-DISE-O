import GestorProductos from './GestorProductos';
import GestorPrecio from './GestorPrecio';
import GestorInventario from './GestorInventario';

/**
 * CarritoFachada - Patrón Fachada
 * 
 * Simplifica la interacción con el sistema de carrito de compras
 * ocultando la complejidad de múltiples gestores (Productos, Precio, Inventario)
 * 
 * Este patrón proporciona una interfaz unificada y simple para:
 * - Agregar/eliminar productos
 * - Calcular totales y precios
 * - Verificar disponibilidad
 * - Procesar pagos
 */
class CarritoFachada {
  constructor() {
    // Subsistemas internos
    this.gestorProductos = new GestorProductos();
    this.gestorPrecio = new GestorPrecio();
    this.gestorInventario = new GestorInventario();
    
    // Suscriptores para notificar cambios
    this.suscriptores = [];
  }

  /**
   * Suscribirse a cambios del carrito
   */
  suscribir(callback) {
    this.suscriptores.push(callback);
    return () => {
      this.suscriptores = this.suscriptores.filter(cb => cb !== callback);
    };
  }

  /**
   * Notificar a todos los suscriptores
   */
  notificar() {
    const estado = this.obtenerEstadoCarrito();
    this.suscriptores.forEach(callback => callback(estado));
  }

  /**
   * MÉTODO PRINCIPAL: Agregar producto al carrito
   * Simplifica: verificación de inventario + agregar + reservar + notificar
   */
  agregarProducto(producto, cantidad = 1) {
    // 1. Verificar disponibilidad
    const disponibilidad = this.gestorInventario.verificarDisponibilidad(
      producto.id, 
      cantidad
    );

    if (!disponibilidad.disponible) {
      return {
        exito: false,
        mensaje: disponibilidad.mensaje
      };
    }

    // 2. Agregar al carrito
    this.gestorProductos.agregarProducto(producto, cantidad);

    // 3. Reservar en inventario
    this.gestorInventario.reservarProducto(producto.id, cantidad);

    // 4. Notificar cambios
    this.notificar();

    return {
      exito: true,
      mensaje: 'Producto agregado al carrito'
    };
  }

  /**
   * MÉTODO PRINCIPAL: Eliminar producto del carrito
   * Simplifica: eliminar + liberar inventario + notificar
   */
  eliminarProducto(productoId) {
    const productos = this.gestorProductos.obtenerProductos();
    const producto = productos.find(p => p.id === productoId);

    if (producto) {
      // Liberar inventario reservado
      this.gestorInventario.liberarProducto(productoId, producto.cantidad);
    }

    // Eliminar del carrito
    this.gestorProductos.eliminarProducto(productoId);

    // Notificar cambios
    this.notificar();

    return {
      exito: true,
      mensaje: 'Producto eliminado del carrito'
    };
  }

  /**
   * MÉTODO PRINCIPAL: Actualizar cantidad de un producto
   */
  actualizarCantidad(productoId, nuevaCantidad) {
    const productos = this.gestorProductos.obtenerProductos();
    const producto = productos.find(p => p.id === productoId);

    if (!producto) {
      return { exito: false, mensaje: 'Producto no encontrado' };
    }

    const diferencia = nuevaCantidad - producto.cantidad;

    if (diferencia > 0) {
      // Aumentar cantidad - verificar disponibilidad
      const disponibilidad = this.gestorInventario.verificarDisponibilidad(
        productoId,
        diferencia
      );

      if (!disponibilidad.disponible) {
        return {
          exito: false,
          mensaje: disponibilidad.mensaje
        };
      }

      this.gestorInventario.reservarProducto(productoId, diferencia);
    } else if (diferencia < 0) {
      // Disminuir cantidad - liberar inventario
      this.gestorInventario.liberarProducto(productoId, Math.abs(diferencia));
    }

    // Actualizar cantidad
    this.gestorProductos.actualizarCantidad(productoId, nuevaCantidad);

    // Notificar cambios
    this.notificar();

    return {
      exito: true,
      mensaje: 'Cantidad actualizada'
    };
  }

  /**
   * MÉTODO PRINCIPAL: Obtener resumen del carrito
   * Simplifica: productos + cálculos de precio + totales
   */
  obtenerResumenCarrito() {
    const productos = this.gestorProductos.obtenerProductos();
    const descuentos = this.gestorPrecio.obtenerDescuentos();
    const totales = this.gestorPrecio.calcularTotal(productos, descuentos);

    return {
      productos: productos,
      cantidadTotal: this.gestorProductos.obtenerCantidadTotal(),
      ...totales,
      descuentosAplicados: descuentos
    };
  }

  /**
   * MÉTODO PRINCIPAL: Aplicar código de descuento
   */
  aplicarDescuento(codigoDescuento) {
    // Simulación de códigos de descuento
    const codigosValidos = {
      'FLASH10': { tipo: 'porcentaje', valor: 10, descripcion: '10% de descuento' },
      'FLASH20': { tipo: 'porcentaje', valor: 20, descripcion: '20% de descuento' },
      'ENVIOGRATIS': { tipo: 'fijo', valor: 5, descripcion: 'Envío gratis' }
    };

    const descuento = codigosValidos[codigoDescuento.toUpperCase()];

    if (!descuento) {
      return {
        exito: false,
        mensaje: 'Código de descuento inválido'
      };
    }

    this.gestorPrecio.agregarDescuento(descuento);
    this.notificar();

    return {
      exito: true,
      mensaje: `Descuento aplicado: ${descuento.descripcion}`,
      descuento: descuento
    };
  }

  /**
   * MÉTODO PRINCIPAL: Procesar pago
   * Simplifica: validación + confirmación inventario + limpieza
   */
  procesarPago(metodoPago) {
    const productos = this.gestorProductos.obtenerProductos();

    if (productos.length === 0) {
      return {
        exito: false,
        mensaje: 'El carrito está vacío'
      };
    }

    // Confirmar compra en inventario
    this.gestorInventario.confirmarCompra(productos);

    // Obtener resumen final
    const resumen = this.obtenerResumenCarrito();

    // Limpiar carrito
    this.limpiarCarrito();

    return {
      exito: true,
      mensaje: 'Compra procesada exitosamente',
      resumen: resumen,
      metodoPago: metodoPago
    };
  }

  /**
   * Limpiar el carrito completamente
   */
  limpiarCarrito() {
    // Liberar todos los productos reservados
    const productos = this.gestorProductos.obtenerProductos();
    productos.forEach(producto => {
      this.gestorInventario.liberarProducto(producto.id, producto.cantidad);
    });

    // Limpiar productos y descuentos
    this.gestorProductos.limpiarCarrito();
    this.gestorPrecio.limpiarDescuentos();

    // Notificar cambios
    this.notificar();
  }

  /**
   * Obtener estado completo del carrito
   */
  obtenerEstadoCarrito() {
    return this.obtenerResumenCarrito();
  }

  /**
   * Inicializar inventario con productos disponibles
   */
  inicializarInventario(productos) {
    this.gestorInventario.inicializarInventario(productos);
  }

  /**
   * Verificar si el carrito está vacío
   */
  estaVacio() {
    return this.gestorProductos.obtenerCantidadTotal() === 0;
  }

  /**
   * Obtener cantidad total de productos
   */
  obtenerCantidadTotal() {
    return this.gestorProductos.obtenerCantidadTotal();
  }
}

// Instancia singleton de la fachada
const carritoFachada = new CarritoFachada();

export default carritoFachada;
