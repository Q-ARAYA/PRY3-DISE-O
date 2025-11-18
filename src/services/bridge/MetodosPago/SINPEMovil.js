import MetodoPago from './MetodoPago';

/**
 * Implementación concreta: SINPE Móvil (Costa Rica)
 * 
 * Sistema de pagos instantáneos entre bancos de Costa Rica.
 * Genera un código único que el usuario confirma en su app bancaria.
 * 
 * Patrón: Bridge
 * Rol: Implementación Concreta (Concrete Implementation)
 */
class SINPEMovil extends MetodoPago {
  async procesar(monto, datos) {
    const { telefono, cedula } = datos;
    
    console.log('📱 Generando código SINPE Móvil...');
    
    // Generar código único SINPE
    const codigoSINPE = this.generarCodigoSINPE(monto, telefono);
    
    // Simular tiempo de generación
    await this.simularGeneracion();
    
    return {
      exito: true,
      requiereConfirmacion: true,
      transaccionId: `SINPE-${Date.now()}`,
      metodo: 'SINPE Móvil',
      codigoSINPE: codigoSINPE,
      telefono: telefono,
      monto: monto,
      instrucciones: [
        'Abre tu aplicación bancaria móvil',
        'Selecciona "SINPE Móvil"',
        `Ingresa el código: ${codigoSINPE}`,
        `Confirma el pago de ₡${(monto * 520).toFixed(2)}` // Conversión USD a CRC
      ],
      expiraEn: 10, // 10 minutos
      fecha: new Date().toISOString(),
      mensaje: 'Código SINPE generado. Complete el pago en su app bancaria.'
    };
  }

  validar(datos) {
    const errores = [];
    
    // Validar teléfono costarricense (8 dígitos)
    if (!/^[0-9]{8}$/.test(datos.telefono)) {
      errores.push('Teléfono inválido (debe tener 8 dígitos sin guiones)');
    }
    
    // Validar que empiece con dígitos válidos (2, 4, 5, 6, 7, 8)
    const primerDigito = datos.telefono?.charAt(0);
    if (primerDigito && !['2', '4', '5', '6', '7', '8'].includes(primerDigito)) {
      errores.push('Número de teléfono no válido en Costa Rica');
    }
    
    // Validar cédula costarricense (9 dígitos)
    if (!/^[0-9]{9}$/.test(datos.cedula)) {
      errores.push('Cédula inválida (debe tener 9 dígitos sin guiones)');
    }
    
    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  obtenerInfo() {
    return {
      id: 'sinpe',
      nombre: 'SINPE Móvil',
      icono: '📱',
      descripcion: 'Transferencia instantánea en Costa Rica',
      comision: 0, // Sin comisión
      tiempoProcesamiento: '1-2 minutos',
      campos: ['telefono', 'cedula'],
      paisesDisponibles: ['CR']
    };
  }

  /**
   * Generar código único SINPE
   * @private
   */
  generarCodigoSINPE(monto, telefono) {
    const timestamp = Date.now().toString().slice(-6);
    const hash = telefono.slice(-4);
    const montoCode = Math.floor(monto).toString().padStart(4, '0');
    return `${timestamp}${hash}${montoCode}`;
  }

  /**
   * Simular generación de código
   * @private
   */
  async simularGeneracion() {
    return new Promise((resolve) => {
      setTimeout(resolve, 800);
    });
  }
}

export default SINPEMovil;
