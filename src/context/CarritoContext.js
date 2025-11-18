import React, { createContext, useContext, useState, useEffect } from 'react';
import carritoFachada from '../services/fachada/CarritoFachada';

// Crear el contexto
const CarritoContext = createContext();

// Hook personalizado para usar el carrito
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
};

// Provider del carrito
export const CarritoProvider = ({ children }) => {
  const [estadoCarrito, setEstadoCarrito] = useState({
    productos: [],
    cantidadTotal: 0,
    subtotal: 0,
    descuentos: 0,
    impuestos: 0,
    total: 0,
    descuentosAplicados: []
  });

  // Suscribirse a cambios de la fachada
  useEffect(() => {
    const desuscribir = carritoFachada.suscribir((nuevoEstado) => {
      setEstadoCarrito(nuevoEstado);
    });

    // Cargar estado inicial
    setEstadoCarrito(carritoFachada.obtenerEstadoCarrito());

    return desuscribir;
  }, []);

  // Métodos simplificados que usan la fachada
  const agregarProducto = (producto, cantidad = 1) => {
    return carritoFachada.agregarProducto(producto, cantidad);
  };

  const eliminarProducto = (productoId) => {
    return carritoFachada.eliminarProducto(productoId);
  };

  const actualizarCantidad = (productoId, cantidad) => {
    return carritoFachada.actualizarCantidad(productoId, cantidad);
  };

  const aplicarDescuento = (codigo) => {
    return carritoFachada.aplicarDescuento(codigo);
  };

  const procesarPago = (metodoPago) => {
    return carritoFachada.procesarPago(metodoPago);
  };

  const limpiarCarrito = () => {
    carritoFachada.limpiarCarrito();
  };

  const undo = () => {
    return carritoFachada.undo();
  };

  const redo = () => {
    return carritoFachada.redo();
  };

  const decorarProducto = (productoId, tipo) => {
    return carritoFachada.decorarProducto(productoId, tipo);
  };

  const estaVacio = () => {
    return carritoFachada.estaVacio();
  };

  // Valor del contexto
  const value = {
    // Estado
    ...estadoCarrito,
    
    // Métodos
    agregarProducto,
    eliminarProducto,
    actualizarCantidad,
    aplicarDescuento,
    procesarPago,
    limpiarCarrito,
    undo,
    redo,
    decorarProducto,
    estaVacio
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoContext;
