/**
 * Patrón Bridge - Implementación (Interface)
 * 
 * Clase base abstracta que define la interfaz que todos los métodos
 * de pago deben implementar. Permite que el ProcesadorPago trabaje
 * con cualquier método de pago sin conocer sus detalles internos.
 * 
 * Patrón: Bridge
 * Rol: Implementación (Implementation)
 */
class MetodoPago {
  /**
   * Procesar el pago con el método específico
   * @param {number} monto - Cantidad a cobrar
   * @param {object} datos - Datos específicos del método de pago
   * @returns {Promise<object>} Resultado de la transacción
   */
  async procesar(monto, datos) {
    throw new Error('El método procesar() debe ser implementado por las subclases');
  }

  /**
   * Validar los datos antes de procesar el pago
   * @param {object} datos - Datos a validar
   * @returns {object} {valido: boolean, errores: string[]}
   */
  validar(datos) {
    throw new Error('El método validar() debe ser implementado por las subclases');
  }

  /**
   * Obtener información descriptiva del método de pago
   * @returns {object} Información del método
   */
  obtenerInfo() {
    throw new Error('El método obtenerInfo() debe ser implementado por las subclases');
  }
}

export default MetodoPago;
