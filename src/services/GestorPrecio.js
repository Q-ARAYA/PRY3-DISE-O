/**
 * GestorPrecio
 * Maneja el cálculo de precios, descuentos e impuestos
 */
class GestorPrecio {
  constructor() {
    this.tasaImpuesto = 0.13; // IVA 13%
    this.descuentos = [];
  }

  /**
   * Calcular el subtotal (sin impuestos ni descuentos)
   */
  calcularSubtotal(productos) {
    return productos.reduce((total, producto) => {
      return total + (producto.price * producto.cantidad);
    }, 0);
  }

  /**
   * Aplicar descuentos
   */
  aplicarDescuentos(subtotal, descuentos = []) {
    let totalDescuento = 0;
    
    descuentos.forEach(descuento => {
      if (descuento.tipo === 'porcentaje') {
        totalDescuento += subtotal * (descuento.valor / 100);
      } else if (descuento.tipo === 'fijo') {
        totalDescuento += descuento.valor;
      }
    });
    
    return totalDescuento;
  }

  /**
   * Calcular impuestos
   */
  calcularImpuestos(subtotal, descuentos = 0) {
    const baseImponible = subtotal - descuentos;
    return baseImponible * this.tasaImpuesto;
  }

  /**
   * Calcular el total final
   */
  calcularTotal(productos, descuentos = []) {
    const subtotal = this.calcularSubtotal(productos);
    const totalDescuentos = this.aplicarDescuentos(subtotal, descuentos);
    const impuestos = this.calcularImpuestos(subtotal, totalDescuentos);
    
    return {
      subtotal: subtotal,
      descuentos: totalDescuentos,
      impuestos: impuestos,
      total: subtotal - totalDescuentos + impuestos
    };
  }

  /**
   * Agregar un descuento
   */
  agregarDescuento(descuento) {
    this.descuentos.push(descuento);
  }

  /**
   * Obtener descuentos aplicados
   */
  obtenerDescuentos() {
    return [...this.descuentos];
  }

  /**
   * Limpiar descuentos
   */
  limpiarDescuentos() {
    this.descuentos = [];
  }

  /**
   * Formatear precio a moneda
   */
  formatearPrecio(precio) {
    return `$${precio.toFixed(2)}`;
  }
}

export default GestorPrecio;
