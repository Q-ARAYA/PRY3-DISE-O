import MetodoPago from './MetodoPago';

/**
 * Implementación concreta: Transferencia Bancaria
 * 
 * Genera datos de cuenta bancaria para que el cliente realice
 * una transferencia manual. Requiere confirmación posterior.
 * 
 * Patrón: Bridge
 * Rol: Implementación Concreta (Concrete Implementation)
 */
class TransferenciaBancaria extends MetodoPago {
  async procesar(monto, datos) {
    const { nombreCliente, emailCliente } = datos;
    
    console.log('🏦 Generando datos para transferencia bancaria...');
    
    // Generar datos de cuenta y referencia
    const datosCuenta = this.generarDatosCuenta(monto, nombreCliente);
    const referencia = this.generarReferencia();
    
    // Simular generación de datos
    await this.simularGeneracion();
    
    return {
      exito: true,
      requiereConfirmacion: true,
      transaccionId: referencia,
      metodo: 'Transferencia Bancaria',
      monto: monto,
      fecha: new Date().toISOString(),
      datosCuenta: datosCuenta,
      referencia: referencia,
      mensaje: 'Realiza la transferencia con los siguientes datos',
      instrucciones: [
        'Accede a tu banca en línea',
        'Realiza una transferencia con los datos proporcionados',
        'Usa la referencia como concepto/descripción',
        'Envía el comprobante a pagos@flashmarket.com',
        'Tu pedido será procesado al confirmar el pago (24-48 horas)'
      ],
      validezDatos: 7 // Días de validez
    };
  }

  validar(datos) {
    const errores = [];
    
    // Validar nombre del cliente
    if (!datos.nombreCliente || datos.nombreCliente.trim().length < 3) {
      errores.push('Nombre completo es requerido');
    }
    
    // Validar email para enviar comprobante
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.emailCliente) {
      errores.push('Email es requerido');
    } else if (!emailRegex.test(datos.emailCliente)) {
      errores.push('Email inválido');
    }
    
    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  obtenerInfo() {
    return {
      id: 'transferencia',
      nombre: 'Transferencia Bancaria',
      icono: '🏦',
      descripcion: 'Pago mediante transferencia a cuenta bancaria',
      comision: 0, // Sin comisión
      tiempoProcesamiento: '24-48 horas',
      campos: ['nombreCliente', 'emailCliente'],
      requiereConfirmacion: true
    };
  }

  /**
   * Generar datos de cuenta bancaria
   * @private
   */
  generarDatosCuenta(monto, cliente) {
    return {
      beneficiario: 'FlashMarket S.A.',
      banco: 'Banco Nacional de Costa Rica',
      tipoCuenta: 'Cuenta Corriente',
      numeroCuenta: '100-01-000-123456-7',
      cedulaJuridica: '3-101-654321',
      moneda: 'Dólares (USD)',
      montoPagar: `$${monto.toFixed(2)}`,
      swift: 'BNCRCRSJ' // Para transferencias internacionales
    };
  }

  /**
   * Generar referencia única
   * @private
   */
  generarReferencia() {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    return `FM${year}${month}${day}-${random}`;
  }

  /**
   * Simular generación de datos
   * @private
   */
  async simularGeneracion() {
    return new Promise((resolve) => {
      setTimeout(resolve, 600);
    });
  }
}

export default TransferenciaBancaria;
