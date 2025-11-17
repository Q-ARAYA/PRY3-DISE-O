/**
 * ProductDecorator
 * Funciones utilitarias para decorar productos con servicios que modifican el precio
 * Devuelven un nuevo objeto producto (inmutable respecto al original) con la propiedad
 * `price` actualizada y `decoratorsApplied` describiendo las decoraciones.
 */

export const ProductDecorator = {
  aplicarEnvioRapido: (producto, costo = 5) => {
    const nuevo = { ...producto };
    nuevo.price = Number((Number(producto.price) + Number(costo)).toFixed(2));
    nuevo.decoratorsApplied = [...(producto.decoratorsApplied || []), { tipo: 'envio_rapido', valor: costo }];
    return nuevo;
  },

  aplicarGarantiaExtendida: (producto, porcentaje = 10) => {
    const nuevo = { ...producto };
    const incremento = (Number(producto.price) * (porcentaje / 100));
    nuevo.price = Number((Number(producto.price) + incremento).toFixed(2));
    nuevo.decoratorsApplied = [...(producto.decoratorsApplied || []), { tipo: 'garantia', valor: porcentaje }];
    return nuevo;
  },

  aplicarEnvolturaRegalo: (producto, costo = 2) => {
    const nuevo = { ...producto };
    nuevo.price = Number((Number(producto.price) + Number(costo)).toFixed(2));
    nuevo.decoratorsApplied = [...(producto.decoratorsApplied || []), { tipo: 'envoltura', valor: costo }];
    return nuevo;
  },

  quitarDecoradores: (producto) => {
    const nuevo = { ...producto };
    // Intentamos restaurar el precio base si existe basePrice
    if (producto.basePrice !== undefined) {
      nuevo.price = producto.basePrice;
    }
    nuevo.decoratorsApplied = [];
    return nuevo;
  },

  // Normalizar producto para mantener precio base
  ensureBasePrice: (producto) => {
    if (producto.basePrice === undefined) {
      return { ...producto, basePrice: Number(producto.price) };
    }
    return producto;
  }
};
