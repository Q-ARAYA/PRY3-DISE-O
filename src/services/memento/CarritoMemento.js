/**
 * Patrón Memento - CarritoMemento
 * 
 * Memento almacena el estado interno del carrito de compras para permitir
 * funcionalidad de deshacer (undo) y rehacer (redo).
 * 
 * COMPONENTES DEL PATRÓN:
 * - Memento: Esta clase (almacena estado)
 * - Originator: CarritoFachada (crea y restaura mementos)
 * - Caretaker: CarritoFachada (gestiona la pila de mementos)
 * 
 * Patrón: Memento
 * Rol: Memento (almacena snapshot del estado)
 */
class CarritoMemento {
  /**
   * @param {object} estado - Estado completo del carrito
   */
  constructor(estado) {
    // Congelar el estado para inmutabilidad
    this._estado = Object.freeze(JSON.parse(JSON.stringify(estado)));
    this._timestamp = new Date().toISOString();
  }

  /**
   * Obtener el estado almacenado
   * @returns {object} Estado del carrito
   */
  obtenerEstado() {
    // Retornar copia profunda para evitar mutaciones
    return JSON.parse(JSON.stringify(this._estado));
  }

  /**
   * Obtener timestamp del memento
   * @returns {string} Timestamp ISO
   */
  obtenerTimestamp() {
    return this._timestamp;
  }

  /**
   * Obtener información del memento
   * @returns {object} Información descriptiva
   */
  obtenerInfo() {
    return {
      timestamp: this._timestamp,
      cantidadProductos: this._estado.productos?.length || 0,
      total: this._estado.totales?.total || 0
    };
  }
}

/**
 * Patrón Memento - CarritoCaretaker
 * 
 * Caretaker gestiona la colección de mementos (historial).
 * Maneja las pilas de undo/redo sin conocer el contenido interno de los mementos.
 * 
 * Patrón: Memento
 * Rol: Caretaker (gestiona mementos)
 */
class CarritoCaretaker {
  constructor() {
    this._historial = []; // Pila de mementos pasados (para undo)
    this._futuro = [];    // Pila de mementos futuros (para redo)
    this._maxHistorial = 20; // Límite de mementos en memoria
  }

  /**
   * Guardar un nuevo memento
   * @param {CarritoMemento} memento - Memento a guardar
   */
  guardar(memento) {
    // Agregar al historial
    this._historial.push(memento);

    // Limpiar pila de redo (nueva acción invalida el futuro)
    this._futuro = [];

    // Limitar tamaño del historial
    if (this._historial.length > this._maxHistorial) {
      this._historial.shift(); // Eliminar el más antiguo
    }

    console.log(`📸 Memento guardado. Historial: ${this._historial.length} estados`);
  }

  /**
   * Obtener el memento anterior (undo)
   * @returns {CarritoMemento|null} Memento anterior o null si no hay
   */
  obtenerAnterior() {
    if (this._historial.length === 0) {
      return null;
    }

    // Mover el estado actual a futuro
    const estadoActual = this._historial.pop();
    this._futuro.push(estadoActual);

    // Retornar el estado anterior
    return this._historial.length > 0 
      ? this._historial[this._historial.length - 1] 
      : null;
  }

  /**
   * Obtener el memento siguiente (redo)
   * @returns {CarritoMemento|null} Memento siguiente o null si no hay
   */
  obtenerSiguiente() {
    if (this._futuro.length === 0) {
      return null;
    }

    // Mover de futuro a historial
    const estadoSiguiente = this._futuro.pop();
    this._historial.push(estadoSiguiente);

    return estadoSiguiente;
  }

  /**
   * Obtener el memento actual sin modificar las pilas
   * @returns {CarritoMemento|null}
   */
  obtenerActual() {
    return this._historial.length > 0 
      ? this._historial[this._historial.length - 1] 
      : null;
  }

  /**
   * Verificar si hay estados para deshacer
   * @returns {boolean}
   */
  puedeDeshacer() {
    return this._historial.length > 0;
  }

  /**
   * Verificar si hay estados para rehacer
   * @returns {boolean}
   */
  puedeRehacer() {
    return this._futuro.length > 0;
  }

  /**
   * Obtener información del historial
   * @returns {object} Estadísticas del historial
   */
  obtenerEstadisticas() {
    return {
      historialSize: this._historial.length,
      futuroSize: this._futuro.length,
      maxHistorial: this._maxHistorial,
      puedeDeshacer: this.puedeDeshacer(),
      puedeRehacer: this.puedeRehacer()
    };
  }

  /**
   * Limpiar todo el historial
   */
  limpiar() {
    this._historial = [];
    this._futuro = [];
    console.log('🗑️ Historial de mementos limpiado');
  }

  /**
   * Obtener todos los mementos (para debugging)
   * @returns {Array<object>} Array con info de todos los mementos
   */
  obtenerHistorialCompleto() {
    return this._historial.map(m => m.obtenerInfo());
  }
}

export { CarritoMemento, CarritoCaretaker };
