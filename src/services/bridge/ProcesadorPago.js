/**
 * Patrón Bridge - Abstracción
 * 
 * ProcesadorPago es la abstracción que mantiene una referencia a un
 * objeto de tipo MetodoPago (implementación). Permite cambiar el método
 * de pago en tiempo de ejecución sin modificar el código cliente.
 * 
 * VENTAJAS:
 * - Desacopla la abstracción de la implementación
 * - Fácil agregar nuevos métodos de pago
 * - Cambiar método de pago dinámicamente
 * - Testear cada método independientemente
 * 
 * Patrón: Bridge
 * Rol: Abstracción (Abstraction)
 */
class ProcesadorPago {
  /**
   * @param {MetodoPago} metodoPago - Implementación del método de pago
   */
  constructor(metodoPago) {
    this.metodoPago = metodoPago; // ← BRIDGE: referencia a la implementación
  }

  /**
   * Cambiar el método de pago dinámicamente
   * Permite al usuario cambiar de opinión sin reiniciar el proceso
   * 
   * @param {MetodoPago} nuevoMetodo - Nuevo método de pago
   */
  cambiarMetodo(nuevoMetodo) {
    console.log(`🔄 Cambiando método de pago a: ${nuevoMetodo.obtenerInfo().nombre}`);
    this.metodoPago = nuevoMetodo;
  }

  /**
   * Obtener información del método actual
   * 
   * @returns {object} Información descriptiva del método
   */
  obtenerInfoMetodo() {
    return this.metodoPago.obtenerInfo();
  }

  /**
   * Validar datos antes de procesar
   * Delega la validación al método de pago específico
   * 
   * @param {object} datos - Datos a validar
   * @returns {object} {valido: boolean, errores: string[]}
   */
  validarDatos(datos) {
    const info = this.metodoPago.obtenerInfo();
    console.log(`🔍 Validando datos con ${info.nombre}...`);
    
    return this.metodoPago.validar(datos);
  }

  /**
   * Calcular comisión del método de pago
   * 
   * @param {number} monto - Monto base
   * @returns {number} Comisión a cobrar
   */
  calcularComision(monto) {
    const info = this.metodoPago.obtenerInfo();
    const comision = (monto * info.comision) / 100;
    
    console.log(`💵 Comisión ${info.nombre}: $${comision.toFixed(2)} (${info.comision}%)`);
    
    return comision;
  }

  /**
   * Calcular total incluyendo comisión
   * 
   * @param {number} monto - Monto base
   * @returns {object} {subtotal, comision, total}
   */
  calcularTotalConComision(monto) {
    const comision = this.calcularComision(monto);
    const total = monto + comision;
    
    return {
      subtotal: monto,
      comision: comision,
      total: total
    };
  }

  /**
   * MÉTODO PRINCIPAL: Procesar pago
   * 
   * Orquesta todo el flujo:
   * 1. Validar datos
   * 2. Calcular comisión
   * 3. Procesar pago con el método específico
   * 4. Registrar transacción
   * 
   * @param {number} monto - Cantidad a cobrar
   * @param {object} datosPago - Datos específicos del método
   * @returns {Promise<object>} Resultado de la transacción
   */
  async procesarPago(monto, datosPago) {
    const info = this.metodoPago.obtenerInfo();
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`💰 Iniciando procesamiento de pago`);
    console.log(`   Método: ${info.nombre} ${info.icono}`);
    console.log(`   Monto: $${monto.toFixed(2)}`);
    console.log(`${'='.repeat(50)}\n`);

    try {
      // PASO 1: Validar datos
      const validacion = this.validarDatos(datosPago);
      
      if (!validacion.valido) {
        console.error('❌ Validación fallida:', validacion.errores);
        return {
          exito: false,
          errores: validacion.errores,
          paso: 'validacion'
        };
      }
      
      console.log('✅ Datos válidos');

      // PASO 2: Calcular totales
      const totales = this.calcularTotalConComision(monto);
      console.log(`💵 Subtotal: $${totales.subtotal.toFixed(2)}`);
      console.log(`💵 Comisión: $${totales.comision.toFixed(2)}`);
      console.log(`💵 Total: $${totales.total.toFixed(2)}\n`);

      // PASO 3: Procesar con el método específico
      const resultado = await this.metodoPago.procesar(totales.total, datosPago);
      
      if (!resultado.exito) {
        console.error('❌ Procesamiento fallido');
        return resultado;
      }

      // PASO 4: Enriquecer resultado con información adicional
      resultado.totales = totales;
      resultado.comision = totales.comision;
      
      // PASO 5: Registrar transacción (auditoría)
      this.registrarTransaccion(resultado);
      
      console.log(`\n✅ Pago procesado exitosamente`);
      console.log(`   ID: ${resultado.transaccionId}\n`);

      return resultado;
      
    } catch (error) {
      console.error('💥 Error inesperado:', error);
      
      return {
        exito: false,
        mensaje: 'Error al procesar el pago',
        error: error.message,
        paso: 'procesamiento'
      };
    }
  }

  /**
   * Registrar transacción para auditoría
   * En producción: guardar en base de datos
   * 
   * @private
   * @param {object} resultado - Resultado de la transacción
   */
  registrarTransaccion(resultado) {
    const registro = {
      id: resultado.transaccionId,
      metodo: resultado.metodo,
      monto: resultado.monto,
      fecha: resultado.fecha || new Date().toISOString(),
      estado: resultado.exito ? 'exitoso' : 'fallido'
    };
    
    console.log('📋 Transacción registrada:', registro);
    
    // En producción: enviar a API
    // await fetch('/api/transacciones', {
    //   method: 'POST',
    //   body: JSON.stringify(registro)
    // });
  }

  /**
   * Verificar si el método requiere redirección externa
   * 
   * @returns {boolean}
   */
  requiereRedireccion() {
    const info = this.metodoPago.obtenerInfo();
    return info.requiereRedireccion || false;
  }

  /**
   * Verificar si el método requiere confirmación manual
   * 
   * @returns {boolean}
   */
  requiereConfirmacion() {
    const info = this.metodoPago.obtenerInfo();
    return info.requiereConfirmacion || false;
  }
}

export default ProcesadorPago;
