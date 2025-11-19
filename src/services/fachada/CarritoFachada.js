import GestorProductos from './GestorProductos';
import GestorPrecio from './GestorPrecio';
import GestorInventario from './GestorInventario';
import { ProductDecorator } from '../decorator/ProductDecorator';
import { CarritoMemento, CarritoCaretaker } from '../memento/CarritoMemento';

/**
 * CarritoFachada - Patrón Fachada + Patrón Memento (Originator)
 * 
 * PATRÓN FACHADA:
 * Simplifica la interacción con el sistema de carrito de compras
 * ocultando la complejidad de múltiples gestores (Productos, Precio, Inventario)
 * 
 * PATRÓN MEMENTO:
 * Actúa como Originator - crea y restaura mementos del estado del carrito
 * permitiendo funcionalidad de deshacer/rehacer.
 * 
 * Este patrón proporciona una interfaz unificada y simple para:
 * - Agregar/eliminar productos
 * - Calcular totales y precios
 * - Verificar disponibilidad
 * - Procesar pagos
 * - Deshacer/Rehacer acciones (Memento)
 */
class CarritoFachada {
  constructor() {
    // Subsistemas internos (Fachada)
    this.gestorProductos = new GestorProductos();
    this.gestorPrecio = new GestorPrecio();
    this.gestorInventario = new GestorInventario();
    
    // Suscriptores para notificar cambios
    this.suscriptores = [];
    
    // Patrón Memento - Caretaker para gestionar historial
    this._caretaker = new CarritoCaretaker();
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
    const baseId = producto.baseId || producto.id;

    // 1. Verificar disponibilidad
    const disponibilidad = this.gestorInventario.verificarDisponibilidad(
      baseId,
      cantidad
    );

    if (!disponibilidad.disponible) {
      return {
        exito: false,
        mensaje: disponibilidad.mensaje
      };
    }

    // 2. Guardar snapshot y agregar al carrito
    this._saveSnapshot();
    this.gestorProductos.agregarProducto(producto, cantidad);

    // 3. Reservar en inventario
    this.gestorInventario.reservarProducto(baseId, cantidad);

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
    // Encontrar items a eliminar (por cartItemId o por baseId)
    const items = productos.filter(p => p.cartItemId === productoId || p.baseId === productoId);

    if (items && items.length > 0) {
      items.forEach(item => {
        this.gestorInventario.liberarProducto(item.baseId, item.cantidad);
      });
    }

    // Guardar snapshot y eliminar del carrito
    this._saveSnapshot();
    this.gestorProductos.eliminarProducto(productoId);
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
    // Buscar por cartItemId o por baseId (primera coincidencia)
    const producto = productos.find(p => p.cartItemId === productoId) || productos.find(p => p.baseId === productoId);

    if (!producto) {
      return { exito: false, mensaje: 'Producto no encontrado' };
    }

    const diferencia = nuevaCantidad - producto.cantidad;

    if (diferencia > 0) {
      // Aumentar cantidad - verificar disponibilidad
      const disponibilidad = this.gestorInventario.verificarDisponibilidad(
        producto.baseId,
        diferencia
      );

      if (!disponibilidad.disponible) {
        return {
          exito: false,
          mensaje: disponibilidad.mensaje
        };
      }

      this.gestorInventario.reservarProducto(producto.baseId, diferencia);
    } else if (diferencia < 0) {
      // Disminuir cantidad - liberar inventario
      this.gestorInventario.liberarProducto(producto.baseId, Math.abs(diferencia));
    }

    // Guardar snapshot and update
    this._saveSnapshot();
    this.gestorProductos.actualizarCantidad(producto.cartItemId || producto.baseId, nuevaCantidad);
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

    // Guardar snapshot y aplicar descuento
    this._saveSnapshot();
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
      this.gestorInventario.liberarProducto(producto.baseId || producto.id, producto.cantidad);
    });

    // Guardar snapshot y limpiar productos y descuentos
    this._saveSnapshot();
    this.gestorProductos.limpiarCarrito();
    this.gestorPrecio.limpiarDescuentos();
    this.notificar();
  }

  /**
   * Guardar snapshot del estado actual (Patrón Memento - Originator)
   * Crea un memento con el estado actual y lo entrega al Caretaker
   */
  _saveSnapshot() {
    try {
      // Capturar estado actual de todos los subsistemas
      const estado = {
        productos: this.gestorProductos.obtenerProductos().map(p => ({ ...p })),
        descuentosAplicados: this.gestorPrecio.obtenerDescuentos ? this.gestorPrecio.obtenerDescuentos() : [],
        inventario: this.gestorInventario.getEstadoInventario ? this.gestorInventario.getEstadoInventario() : []
      };

      // Crear memento y entregarlo al Caretaker
      const memento = new CarritoMemento(estado);
      this._caretaker.guardar(memento);
    } catch (e) {
      console.error('Error al guardar snapshot:', e);
    }
  }

  /**
   * Restaurar un memento (Patrón Memento - Originator)
   * Extrae el estado del memento y lo aplica a los subsistemas
   */
  _restoreSnapshot(memento) {
    if (!memento) return;

    try {
      const estado = memento.obtenerEstado();

      // Restaurar productos
      if (estado.productos) {
        this.gestorProductos.setProductos(estado.productos.map(p => ({ ...p })));
      }

      // Restaurar descuentos
      if (estado.descuentosAplicados && this.gestorPrecio.setDescuentos) {
        this.gestorPrecio.setDescuentos(estado.descuentosAplicados);
      }

      // Restaurar inventario
      if (estado.inventario && this.gestorInventario.setEstadoInventario) {
        this.gestorInventario.setEstadoInventario(estado.inventario);
      }

      // Notificar cambios a la UI
      this.notificar();
    } catch (e) {
      console.error('Error al restaurar snapshot:', e);
    }
  }

  /**
   * Deshacer la última acción (Patrón Memento)
   * Solicita al Caretaker el memento anterior y lo restaura
   */
  undo() {
    if (!this._caretaker.puedeDeshacer()) {
      return { exito: false, mensaje: 'Nada para deshacer' };
    }

    const memento = this._caretaker.obtenerAnterior();
    if (memento) {
      this._restoreSnapshot(memento);
      return { exito: true, mensaje: '⏪ Acción deshecha' };
    }

    return { exito: false, mensaje: 'No se pudo deshacer' };
  }

  /**
   * Rehacer la última acción deshecha (Patrón Memento)
   * Solicita al Caretaker el memento siguiente y lo restaura
   */
  redo() {
    if (!this._caretaker.puedeRehacer()) {
      return { exito: false, mensaje: 'Nada para rehacer' };
    }

    const memento = this._caretaker.obtenerSiguiente();
    if (memento) {
      this._restoreSnapshot(memento);
      return { exito: true, mensaje: '⏩ Acción rehecha' };
    }

    return { exito: false, mensaje: 'No se pudo rehacer' };
  }

  /**
   * Obtener estadísticas del historial (útil para debugging)
   */
  obtenerEstadisticasHistorial() {
    return this._caretaker.obtenerEstadisticas();
  }

  /**
   * Decorar un producto dentro del carrito
   * tipos: 'envio', 'garantia', 'envoltura'
   */
  /**
   * Decorar un producto dentro del carrito
   * `tipos` puede ser un string (un solo decorador) o un array de strings
   */
  decorarProducto(productoId, tipos) {
    // Apply decorators directly to the existing cart line (single-line model).
    const productos = this.gestorProductos.obtenerProductos();
    const original = productos.find(p => p.cartItemId === productoId) || productos.find(p => p.baseId === productoId || p.id === productoId);

    if (!original) {
      return { exito: false, mensaje: 'Producto no encontrado' };
    }

    const tiposArray = Array.isArray(tipos) ? tipos : [tipos];

    // Rebuild price starting from basePrice and apply requested decorators in order
    const basePrice = original.basePrice !== undefined ? Number(original.basePrice) : Number(original.price || 0);
    let rebuilt = { nombre: original.nombre, name: original.name || original.nombre, imagen: original.imagen || original.image, price: basePrice, basePrice };

    for (const tipo of tiposArray) {
      if (tipo === 'envio' || tipo === 'envio_rapido') rebuilt = ProductDecorator.aplicarEnvioRapido(rebuilt, 5);
      else if (tipo === 'garantia') rebuilt = ProductDecorator.aplicarGarantiaExtendida(rebuilt, 10);
      else if (tipo === 'envoltura') rebuilt = ProductDecorator.aplicarEnvolturaRegalo(rebuilt, 2);
    }

    const newDecorators = (rebuilt.decoratorsApplied || []).slice();

    // Save snapshot, update the existing line's price and decoratorsApplied
    this._saveSnapshot();
    try {
      this.gestorProductos.actualizarItem(original.cartItemId, {
        price: rebuilt.price,
        decoratorsApplied: newDecorators,
        // keep current cantidad
        cantidad: original.cantidad
      });
      this.notificar();
      return { exito: true, mensaje: 'Decoradores aplicados' };
    } catch (e) {
      return { exito: false, mensaje: 'No se pudo aplicar decoradores' };
    }
  }

  /**
   * Quitar un decorador específico de una línea del carrito
   * tipoToRemove debe coincidir con el campo `tipo` dentro de `decoratorsApplied` (p.ej. 'envio_rapido', 'garantia', 'envoltura')
   */
  quitarDecorador(cartItemId, tipoToRemove) {
    const productos = this.gestorProductos.obtenerProductos();
    const original = productos.find(p => p.cartItemId === cartItemId || p.id === cartItemId);
    if (!original) return { exito: false, mensaje: 'Línea no encontrada' };
    const applied = Array.isArray(original.decoratorsApplied) ? original.decoratorsApplied.slice() : [];
    if (applied.length === 0) return { exito: false, mensaje: 'No hay decoradores aplicados' };

    // Filtrar el decorador solicitado
    const remaining = applied.filter(d => d.tipo !== tipoToRemove);

    // Reconstruir producto base y reaplicar decoradores restantes
    const basePrice = original.basePrice !== undefined ? Number(original.basePrice) : Number(original.price || 0);
    let rebuilt = { nombre: original.nombre, name: original.name || original.nombre, imagen: original.imagen || original.image, price: basePrice, basePrice: basePrice };

    for (const d of remaining) {
      const t = (d.tipo || '').toLowerCase();
      if (t.includes('envio')) {
        rebuilt = ProductDecorator.aplicarEnvioRapido(rebuilt, d.valor || 5);
      } else if (t.includes('garantia')) {
        rebuilt = ProductDecorator.aplicarGarantiaExtendida(rebuilt, d.valor || 10);
      } else if (t.includes('envoltura')) {
        rebuilt = ProductDecorator.aplicarEnvolturaRegalo(rebuilt, d.valor || 2);
      }
    }

    // Guardar snapshot
    this._saveSnapshot();

    // Actualizar la línea dentro del gestor de productos
    try {
      this.gestorProductos.actualizarItem(original.cartItemId, {
        price: rebuilt.price,
        decoratorsApplied: remaining
      });
      this.notificar();
      return { exito: true, mensaje: 'Decorador eliminado' };
    } catch (e) {
      return { exito: false, mensaje: 'No se pudo actualizar la línea' };
    }
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
   * Eliminar un producto del inventario (por ejemplo al borrar una publicación)
   */
  eliminarProductoInventario(productoId) {
    try {
      return this.gestorInventario.eliminarProducto(productoId);
    } catch (e) {
      return false;
    }
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
