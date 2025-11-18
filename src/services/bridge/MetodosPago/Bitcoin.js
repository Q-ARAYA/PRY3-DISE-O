import MetodoPago from './MetodoPago';

/**
 * Implementación concreta: Bitcoin (Criptomoneda)
 * 
 * Procesa pagos con Bitcoin mediante generación de dirección de wallet
 * y código QR para escanear. Requiere confirmación de transacción en blockchain.
 * 
 * Patrón: Bridge
 * Rol: Implementación Concreta (Concrete Implementation)
 */
class Bitcoin extends MetodoPago {
  async procesar(monto, datos) {
    const { emailCliente, walletCliente } = datos;
    
    console.log('₿ Generando dirección Bitcoin para pago...');
    
    // Generar dirección Bitcoin única para la transacción
    const direccionBitcoin = this.generarDireccionBitcoin();
    const montoBTC = this.convertirUSDaBTC(monto);
    const codigoQR = this.generarCodigoQR(direccionBitcoin, montoBTC);
    
    // Simular generación de pago
    await this.simularGeneracion();
    
    return {
      exito: true,
      requiereConfirmacion: true,
      transaccionId: `BTC-${Date.now()}`,
      metodo: 'Bitcoin',
      monto: monto,
      montoBTC: montoBTC,
      direccionBitcoin: direccionBitcoin,
      codigoQR: codigoQR,
      tasaCambio: this.obtenerTasaCambio(),
      fecha: new Date().toISOString(),
      mensaje: 'Envía Bitcoin a la dirección proporcionada',
      instrucciones: [
        'Abre tu wallet de Bitcoin (Coinbase, Binance, Trust Wallet, etc.)',
        `Envía exactamente ${montoBTC} BTC a la dirección mostrada`,
        'O escanea el código QR desde tu wallet',
        'La transacción será confirmada en 10-30 minutos',
        'Recibirás un email cuando se confirme el pago',
        'Guarda el ID de transacción como comprobante'
      ],
      expiraEn: 30, // 30 minutos para completar el pago
      confirmacionesRequeridas: 3 // Confirmaciones en blockchain
    };
  }

  validar(datos) {
    const errores = [];
    
    // Validar email para notificaciones
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.emailCliente) {
      errores.push('Email es requerido para notificaciones');
    } else if (!emailRegex.test(datos.emailCliente)) {
      errores.push('Email inválido');
    }
    
    // Validar wallet opcional (si el usuario quiere registrar su wallet)
    if (datos.walletCliente && datos.walletCliente.trim() !== '') {
      if (!this.validarDireccionBitcoin(datos.walletCliente)) {
        errores.push('Dirección de wallet Bitcoin inválida');
      }
    }
    
    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  obtenerInfo() {
    return {
      id: 'bitcoin',
      nombre: 'Bitcoin (BTC)',
      icono: '₿',
      descripcion: 'Pago con criptomoneda Bitcoin',
      comision: 1.5, // 1.5% (menor que tarjetas tradicionales)
      tiempoProcesamiento: '10-30 minutos',
      campos: ['emailCliente', 'walletCliente'],
      requiereConfirmacion: true,
      ventajas: [
        'Transacciones internacionales sin intermediarios',
        'Mayor privacidad',
        'Comisiones más bajas',
        'Seguridad blockchain'
      ]
    };
  }

  /**
   * Generar dirección Bitcoin única para la transacción
   * En producción: usar API de wallet como Coinbase Commerce, BTCPay
   * @private
   */
  generarDireccionBitcoin() {
    // Dirección Bitcoin simulada (formato válido)
    // En producción: generar mediante API de servicio de pagos cripto
    const prefijo = '1'; // Direcciones Legacy empiezan con 1
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let direccion = prefijo;
    
    // Direcciones Bitcoin tienen 26-35 caracteres
    for (let i = 0; i < 33; i++) {
      direccion += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    return direccion;
  }

  /**
   * Convertir USD a BTC
   * En producción: usar API de exchange real (CoinGecko, Binance)
   * @private
   */
  convertirUSDaBTC(montoUSD) {
    // Tasa simulada: 1 BTC = $43,500 USD (Nov 2025 estimado)
    const tasaBTC = 43500;
    const montoBTC = montoUSD / tasaBTC;
    return montoBTC.toFixed(8); // Bitcoin usa 8 decimales (satoshis)
  }

  /**
   * Obtener tasa de cambio actual
   * @private
   */
  obtenerTasaCambio() {
    return {
      moneda: 'USD',
      valorBTC: 43500,
      ultimaActualizacion: new Date().toISOString()
    };
  }

  /**
   * Generar código QR para la transacción
   * En producción: usar librería como qrcode.js
   * @private
   */
  generarCodigoQR(direccion, monto) {
    // URI de Bitcoin que las wallets pueden escanear
    const bitcoinURI = `bitcoin:${direccion}?amount=${monto}`;
    
    // En producción: generar QR real con librería
    // Por ahora retornamos la URI y un placeholder
    return {
      uri: bitcoinURI,
      imagenBase64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkPDs2RpZ28gUVI8L3RleHQ+PC9zdmc+',
      placeholder: true
    };
  }

  /**
   * Validar formato de dirección Bitcoin
   * @private
   */
  validarDireccionBitcoin(direccion) {
    // Validación básica de formato Bitcoin
    // Direcciones Legacy (1...), SegWit (3...), Bech32 (bc1...)
    const legacyRegex = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const segwitRegex = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const bech32Regex = /^(bc1)[a-z0-9]{39,59}$/;
    
    return legacyRegex.test(direccion) || 
           segwitRegex.test(direccion) || 
           bech32Regex.test(direccion);
  }

  /**
   * Simular generación de pago
   * @private
   */
  async simularGeneracion() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  /**
   * Verificar estado de transacción en blockchain
   * En producción: consultar API de blockchain.com o similar
   */
  async verificarTransaccion(transaccionId) {
    // Simular verificación
    return {
      confirmaciones: 0,
      estado: 'pendiente',
      hash: '0x' + Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString()
    };
  }
}

export default Bitcoin;
