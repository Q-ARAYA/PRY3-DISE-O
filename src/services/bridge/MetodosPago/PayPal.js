import MetodoPago from './MetodoPago';

/**
 * Implementación concreta: PayPal
 * 
 * Procesa pagos a través de la plataforma PayPal.
 * Requiere redirección a PayPal para completar el pago.
 * 
 * Patrón: Bridge
 * Rol: Implementación Concreta (Concrete Implementation)
 */
class PayPal extends MetodoPago {
  async procesar(monto, datos) {
    const { email } = datos;
    
    console.log('💰 Iniciando proceso de pago con PayPal...');
    
    // En producción: integrar SDK de PayPal
    const urlPago = this.generarURLPayPal(monto, email);
    const ordenId = this.generarOrdenId();
    
    // Simular preparación de pago
    await this.simularPreparacion();
    
    return {
      exito: true,
      requiereRedireccion: true,
      transaccionId: ordenId,
      metodo: 'PayPal',
      urlPago: urlPago,
      email: email,
      monto: monto,
      fecha: new Date().toISOString(),
      mensaje: 'Serás redirigido a PayPal para completar el pago de forma segura',
      instrucciones: [
        'Haz clic en "Continuar a PayPal"',
        'Inicia sesión en tu cuenta PayPal',
        'Confirma el pago',
        'Serás redirigido de vuelta a FlashMarket'
      ]
    };
  }

  validar(datos) {
    const errores = [];
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email) {
      errores.push('Email es requerido');
    } else if (!emailRegex.test(datos.email)) {
      errores.push('Email inválido');
    }
    
    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  obtenerInfo() {
    return {
      id: 'paypal',
      nombre: 'PayPal',
      icono: '💰',
      descripcion: 'Pago seguro con tu cuenta PayPal',
      comision: 3.4, // 3.4% + $0.30
      tiempoProcesamiento: 'Inmediato',
      campos: ['email'],
      requiereRedireccion: true
    };
  }

  /**
   * Generar URL de pago de PayPal
   * @private
   */
  generarURLPayPal(monto, email) {
    // En producción: usar PayPal SDK para generar URL real
    const params = new URLSearchParams({
      amount: monto,
      currency: 'USD',
      email: email,
      return_url: window.location.origin + '/checkout/success',
      cancel_url: window.location.origin + '/checkout/cancel'
    });
    
    return `https://www.paypal.com/checkoutnow?${params.toString()}`;
  }

  /**
   * Generar ID de orden
   * @private
   */
  generarOrdenId() {
    return `PAYPAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Simular preparación de pago
   * @private
   */
  async simularPreparacion() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
}

export default PayPal;
