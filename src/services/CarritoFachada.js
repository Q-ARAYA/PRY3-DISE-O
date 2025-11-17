import GestorProductos from './GestorProductos';
import GestorPrecio from './GestorPrecio';
import GestorInventario from './GestorInventario';
import { ProductDecorator } from './ProductDecorator';

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
    // Memento stacks
    this._past = []; // snapshots anteriores
    this._future = []; // snapshots para redo
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
   * Guardar snapshot del estado actual (memento)
   */
  _saveSnapshot() {
    try {
      // Construimos un snapshot consistente que incluya inventario
      const snapshot = {
        productos: this.gestorProductos.obtenerProductos().map(p => ({ ...p })),
        descuentosAplicados: this.gestorPrecio.obtenerDescuentos ? this.gestorPrecio.obtenerDescuentos() : [],
        inventario: this.gestorInventario.getEstadoInventario ? this.gestorInventario.getEstadoInventario() : []
      };
      // Guardamos copia profunda
      this._past.push(JSON.parse(JSON.stringify(snapshot)));
      // limpiar pila de redo
      this._future = [];
      // limitamos tamaño para evitar crecimiento descontrolado
      if (this._past.length > 50) this._past.shift();
    } catch (e) {
      // ignore
    }
  }

  /**
   * Restaurar un snapshot previo
   */
  _restoreSnapshot(snapshot) {
    if (!snapshot) return;
    // Restauramos productos y descuentos
    if (snapshot.productos) {
      this.gestorProductos.setProductos(snapshot.productos.map(p => ({ ...p })));
    }
    if (snapshot.descuentosAplicados) {
      if (this.gestorPrecio.setDescuentos) {
        this.gestorPrecio.setDescuentos(snapshot.descuentosAplicados);
      }
    }
    // Restaurar inventario si viene en el snapshot
    if (snapshot.inventario && this.gestorInventario.setEstadoInventario) {
      this.gestorInventario.setEstadoInventario(snapshot.inventario);
    }
    // Notificamos a UI
    this.notificar();
  }

  /**
   * Deshacer la última acción
   */
  undo() {
    if (this._past.length === 0) {
      return { exito: false, mensaje: 'Nada para deshacer' };
    }

    // Guardar estado actual en future
    try {
      const actualSnapshot = {
        productos: this.gestorProductos.obtenerProductos().map(p => ({ ...p })),
        descuentosAplicados: this.gestorPrecio.obtenerDescuentos ? this.gestorPrecio.obtenerDescuentos() : [],
        inventario: this.gestorInventario.getEstadoInventario ? this.gestorInventario.getEstadoInventario() : []
      };
      this._future.push(JSON.parse(JSON.stringify(actualSnapshot)));
    } catch (e) {}

    // Tomar último snapshot del past y restaurarlo
    const snapshot = this._past.pop();
    this._restoreSnapshot(snapshot);

    return { exito: true, mensaje: 'Acción deshecha' };
  }

  /**
   * Rehacer la última acción deshecha
   */
  redo() {
    if (this._future.length === 0) {
      return { exito: false, mensaje: 'Nada para rehacer' };
    }

    // Guardar estado actual en past
    try {
      const actualSnapshot = {
        productos: this.gestorProductos.obtenerProductos().map(p => ({ ...p })),
        descuentosAplicados: this.gestorPrecio.obtenerDescuentos ? this.gestorPrecio.obtenerDescuentos() : [],
        inventario: this.gestorInventario.getEstadoInventario ? this.gestorInventario.getEstadoInventario() : []
      };
      this._past.push(JSON.parse(JSON.stringify(actualSnapshot)));
    } catch (e) {}

    const snapshot = this._future.pop();
    this._restoreSnapshot(snapshot);

    return { exito: true, mensaje: 'Acción rehecha' };
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
    const productos = this.gestorProductos.obtenerProductos();
    // Buscar item por cartItemId o por baseId (primera coincidencia)
    const original = productos.find(p => p.cartItemId === productoId) || productos.find(p => p.baseId === productoId);

    if (!original) {
      return { exito: false, mensaje: 'Producto no encontrado' };
    }

    const tiposArray = Array.isArray(tipos) ? tipos : [tipos];

    // Guardar snapshot antes de modificar
    this._saveSnapshot();

    const baseId = original.baseId;

    // Liberar una unidad temporalmente para poder re-reservar para la nueva línea
    this.gestorInventario.liberarProducto(baseId, 1);

    // Verificar disponibilidad para el nuevo ítem (1 unidad)
    const disponibilidad = this.gestorInventario.verificarDisponibilidad(baseId, 1);
    if (!disponibilidad.disponible) {
      // Re-reservar la unidad liberada y abortar
      this.gestorInventario.reservarProducto(baseId, 1);
      return { exito: false, mensaje: 'No hay stock disponible para aplicar el decorador' };
    }

    // Construir objeto base para decorar
    const baseProduct = {
      id: baseId,
      name: original.nombre,
      nombre: original.nombre,
      image: original.imagen,
      imagen: original.imagen,
      basePrice: original.basePrice,
      price: original.basePrice
    };

    // Aplicar en secuencia todos los decoradores solicitados
    let nuevoDecorado = ProductDecorator.ensureBasePrice(baseProduct);
    for (const tipo of tiposArray) {
      if (tipo === 'envio') {
        nuevoDecorado = ProductDecorator.aplicarEnvioRapido(nuevoDecorado, 5);
      } else if (tipo === 'garantia') {
        nuevoDecorado = ProductDecorator.aplicarGarantiaExtendida(nuevoDecorado, 10);
      } else if (tipo === 'envoltura') {
        nuevoDecorado = ProductDecorator.aplicarEnvolturaRegalo(nuevoDecorado, 2);
      } else if (tipo === 'quitar') {
        nuevoDecorado = ProductDecorator.quitarDecoradores(nuevoDecorado);
      } else {
        // Ignorar tipos desconocidos
      }
    }

    // Ajustamos cantidades: restar 1 de la línea original
    if (original.cantidad > 1) {
      this.gestorProductos.actualizarCantidad(original.cartItemId, original.cantidad - 1);
    } else {
      this.gestorProductos.eliminarProducto(original.cartItemId);
    }

    // Reservar para la nueva línea (ya verificamos disponibilidad)
    this.gestorInventario.reservarProducto(baseId, 1);

    // Agregar la nueva línea decorada (mergeIfSame = true para agrupar iguales)
    this.gestorProductos.agregarProducto({
      ...nuevoDecorado,
      decoratorsApplied: nuevoDecorado.decoratorsApplied || []
    }, 1, true);

    this.notificar();
    return { exito: true, mensaje: 'Producto decorado' };
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
