import MetodoPago from './MetodoPago';

/**
 * Implementación concreta: Tarjeta de Crédito/Débito
 * 
 * Maneja el procesamiento de pagos con tarjetas Visa, Mastercard, etc.
 * Incluye validación de números de tarjeta, CVV y fecha de vencimiento.
 * 
 * Patrón: Bridge
 * Rol: Implementación Concreta (Concrete Implementation)
 */
class TarjetaCredito extends MetodoPago {
  async procesar(monto, datos) {
    const { numeroTarjeta, cvv, vencimiento, titular } = datos;
    
    console.log('💳 Procesando pago con tarjeta de crédito...');
    
    // Simulación de procesamiento con pasarela de pago
    // En producción: integrar con Visa/Mastercard API
    await this.simularProcesamiento();
    
    return {
      exito: true,
      transaccionId: `TXN-${Date.now()}`,
      metodo: 'Tarjeta de Crédito',
      monto: monto,
      ultimosDigitos: numeroTarjeta.slice(-4),
      titular: titular,
      fecha: new Date().toISOString(),
      mensaje: 'Pago procesado exitosamente'
    };
  }

  validar(datos) {
    const errores = [];
    
    // Validar titular
    if (!datos.titular || datos.titular.trim().length < 3) {
      errores.push('Nombre del titular es requerido');
    }
    
    // Validar número de tarjeta (16 dígitos)
    const numeroLimpio = datos.numeroTarjeta?.replace(/\s/g, '') || '';
    if (!/^\d{16}$/.test(numeroLimpio)) {
      errores.push('Número de tarjeta inválido (debe tener 16 dígitos)');
    } else if (!this.validarLuhn(numeroLimpio)) {
      errores.push('Número de tarjeta inválido (algoritmo Luhn)');
    }
    
    // Validar CVV (3 o 4 dígitos)
    if (!/^\d{3,4}$/.test(datos.cvv)) {
      errores.push('CVV inválido (debe tener 3 o 4 dígitos)');
    }
    
    // Validar fecha de vencimiento (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(datos.vencimiento)) {
      errores.push('Fecha de vencimiento inválida (formato: MM/YY)');
    } else {
      const [mes, año] = datos.vencimiento.split('/').map(Number);
      const fechaVencimiento = new Date(2000 + año, mes - 1);
      const ahora = new Date();
      
      if (fechaVencimiento < ahora) {
        errores.push('Tarjeta vencida');
      }
      if (mes < 1 || mes > 12) {
        errores.push('Mes inválido');
      }
    }
    
    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  obtenerInfo() {
    return {
      id: 'tarjeta',
      nombre: 'Tarjeta de Crédito/Débito',
      icono: '💳',
      descripcion: 'Visa, Mastercard, American Express',
      comision: 2.5, // 2.5%
      tiempoProcesamiento: 'Inmediato',
      campos: ['titular', 'numeroTarjeta', 'vencimiento', 'cvv']
    };
  }

  /**
   * Algoritmo de Luhn para validar números de tarjeta
   * @private
   */
  validarLuhn(numero) {
    let suma = 0;
    let alternar = false;
    
    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = parseInt(numero.charAt(i), 10);
      
      if (alternar) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }
      
      suma += digito;
      alternar = !alternar;
    }
    
    return (suma % 10) === 0;
  }

  /**
   * Simular tiempo de procesamiento
   * @private
   */
  async simularProcesamiento() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  }
}

export default TarjetaCredito;
