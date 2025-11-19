import React, { createContext, useContext, useEffect, useState } from 'react';

const CuentaContext = createContext();

export const useCuenta = () => {
  const context = useContext(CuentaContext);
  if (!context) throw new Error('useCuenta debe usarse dentro de CuentaProvider');
  return context;
};

const STORAGE_KEY = 'pry3_cuenta_v1';

export const CuentaProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const _normalizeEmail = (email) =>
    (email || '').trim().toLowerCase();

  const _normalizePassword = (password) =>
    (password || '').trim();

  const _getFullCurrentUser = () =>
    users.find(u => u.id === currentUserId) || null;

  const _publicUser = (user) =>
    user ? { ...user, password: undefined } : null;

  const _persist = (nextUsers, nextCurrentUserId) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users: nextUsers,
          currentUserId: nextCurrentUserId,
        })
      );
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      let loadedUsers = Array.isArray(parsed.users) ? parsed.users : [];
      const loadedCurrentUserId = parsed.currentUserId || null;

      loadedUsers = loadedUsers.filter(
        u => u && u.id && typeof u.email === 'string'
      );

      loadedUsers = loadedUsers.map(u => ({
        ...u,
        email: _normalizeEmail(u.email),
      }));

      // ensure role exists
      loadedUsers = loadedUsers.map(u => ({ ...u, role: u.role || 'buyer' }));

      setUsers(loadedUsers);
      setCurrentUserId(loadedCurrentUserId);
    } catch (e) {}
  }, []);

  useEffect(() => {
    _persist(users, currentUserId);
  }, [users, currentUserId]);

  const fullCurrentUser = _getFullCurrentUser();
  const publicCurrentUser = _publicUser(fullCurrentUser);

  const register = ({ nombre, email, password, role = 'buyer' }) => {
    const emailNorm = _normalizeEmail(email);
    const passNorm = _normalizePassword(password);

    if (!emailNorm || !passNorm) {
      return { exito: false, mensaje: 'Email y password requeridos' };
    }

    if (users.some(u => u.email === emailNorm)) {
      return { exito: false, mensaje: 'Email ya registrado' };
    }

    const newUser = {
      id: `u-${Date.now()}`,
      nombre: (nombre || '').trim() || 'Usuario',
      email: emailNorm,
      password: passNorm,
      role,
      direccion: '',
      direcciones: [],
      pedidos: [],
    };

    const newUsers = [...users, newUser];
    setUsers(newUsers);
    setCurrentUserId(newUser.id);
    _persist(newUsers, newUser.id);

    return { exito: true, mensaje: 'Registrado correctamente' };
  };

  const login = ({ email, password }) => {
    const emailNorm = _normalizeEmail(email);
    const passNorm = _normalizePassword(password);

    if (!emailNorm || !passNorm) {
      return { exito: false, mensaje: 'Email y password requeridos' };
    }

    let nextUsers = users;
    let uIndex = nextUsers.findIndex(x => x.email === emailNorm);
    let u = uIndex !== -1 ? nextUsers[uIndex] : null;

    if (!u) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const persistedUsers = Array.isArray(parsed.users) ? parsed.users : [];

          const normalizedPersisted = persistedUsers.map(x => ({
            ...x,
            email: _normalizeEmail(x.email),
          }));

          uIndex = normalizedPersisted.findIndex(x => x.email === emailNorm);
          u = uIndex !== -1 ? normalizedPersisted[uIndex] : null;

          if (u) {
            nextUsers = normalizedPersisted;
            setUsers(normalizedPersisted);
          }
        }
      } catch (e) {}
    }

    if (!u) {
      return { exito: false, mensaje: 'Credenciales incorrectas' };
    }

    if (!u.password) {
      const updated = { ...u, password: passNorm };
      const newUsers = [...nextUsers];
      newUsers[uIndex] = updated;

      setUsers(newUsers);
      setCurrentUserId(updated.id);
      _persist(newUsers, updated.id);

      return { exito: true };
    }

    if (u.password !== passNorm) {
      return { exito: false, mensaje: 'Credenciales incorrectas' };
    }

    setCurrentUserId(u.id);
    _persist(nextUsers, u.id);

    return { exito: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    _persist(users, null);
  };

  const addShippingAddress = (addr) => {
    if (!fullCurrentUser) {
      return { exito: false, mensaje: 'No autenticado' };
    }

    const direccion = { id: `a-${Date.now()}`, ...addr };
    const updatedFull = {
      ...fullCurrentUser,
      direcciones: [...(fullCurrentUser.direcciones || []), direccion],
    };

    const newUsers = users.map(u =>
      u.id === updatedFull.id ? updatedFull : u
    );

    setUsers(newUsers);
    _persist(newUsers, currentUserId);

    return { exito: true, direccion };
  };

  const updateShippingAddress = (id, datos) => {
    if (!fullCurrentUser) {
      return { exito: false, mensaje: 'No autenticado' };
    }

    const direcciones = (fullCurrentUser.direcciones || []).map(d =>
      d.id === id ? { ...d, ...datos } : d
    );

    const updatedFull = { ...fullCurrentUser, direcciones };

    const newUsers = users.map(u =>
      u.id === updatedFull.id ? updatedFull : u
    );

    setUsers(newUsers);
    _persist(newUsers, currentUserId);

    return { exito: true };
  };

  const removeShippingAddress = (id) => {
    if (!fullCurrentUser) {
      return { exito: false, mensaje: 'No autenticado' };
    }

    const direcciones = (fullCurrentUser.direcciones || []).filter(
      d => d.id !== id
    );

    const updatedFull = { ...fullCurrentUser, direcciones };
    const newUsers = users.map(u =>
      u.id === updatedFull.id ? updatedFull : u
    );

    setUsers(newUsers);
    _persist(newUsers, currentUserId);

    return { exito: true };
  };

  const setDefaultShipping = (id) => {
    if (!fullCurrentUser) {
      return { exito: false, mensaje: 'No autenticado' };
    }

    const direcciones = (fullCurrentUser.direcciones || []).map(d => ({
      ...d,
      default: d.id === id,
    }));

    const updatedFull = { ...fullCurrentUser, direcciones };
    const newUsers = users.map(u =>
      u.id === updatedFull.id ? updatedFull : u
    );

    setUsers(newUsers);
    _persist(newUsers, currentUserId);

    return { exito: true };
  };

  const _saveSnapshot = () => {
    if (!fullCurrentUser) return;

    setPast(prev => {
      const next = [...prev, fullCurrentUser];
      if (next.length > 50) next.shift();
      return next;
    });
    setFuture([]);
  };

  const actualizarPerfil = (datos) => {
    if (!fullCurrentUser) {
      return { exito: false, mensaje: 'No autenticado' };
    }

    _saveSnapshot();

    const updatedFull = { ...fullCurrentUser, ...datos };
    // if role changed ensure it's allowed value
    if (updatedFull.role && !['buyer', 'seller'].includes(updatedFull.role)) {
      updatedFull.role = 'buyer';
    }
    const newUsers = users.map(u =>
      u.id === updatedFull.id ? updatedFull : u
    );

    setUsers(newUsers);
    _persist(newUsers, currentUserId);

    return { exito: true };
  };

  const undo = () => {
    if (past.length === 0 || !fullCurrentUser) {
      return { exito: false, mensaje: 'Nada para deshacer' };
    }

    const last = past[past.length - 1];

    setFuture(f => [...f, fullCurrentUser]);
    setPast(p => p.slice(0, -1));

    const newUsers = users.map(u =>
      u.id === last.id ? last : u
    );

    setUsers(newUsers);
    setCurrentUserId(last.id);
    _persist(newUsers, last.id);

    return { exito: true };
  };

  const redo = () => {
    if (future.length === 0 || !fullCurrentUser) {
      return { exito: false, mensaje: 'Nada para rehacer' };
    }

    const next = future[future.length - 1];

    setPast(p => [...p, fullCurrentUser]);
    setFuture(f => f.slice(0, -1));

    const newUsers = users.map(u =>
      u.id === next.id ? next : u
    );

    setUsers(newUsers);
    setCurrentUserId(next.id);
    _persist(newUsers, next.id);

    return { exito: true };
  };

  const addOrder = (order) => {
    if (!fullCurrentUser) {
      return { exito: false, mensaje: 'No autenticado' };
    }

    const pedido = {
      id: `o-${Date.now()}`,
      fecha: new Date().toISOString(),
      ...order,
    };

    const updatedFull = {
      ...fullCurrentUser,
      pedidos: [...(fullCurrentUser.pedidos || []), pedido],
    };

    const newUsers = users.map(u =>
      u.id === updatedFull.id ? updatedFull : u
    );

    setUsers(newUsers);
    _persist(newUsers, currentUserId);

    return { exito: true, pedido };
  };

  const promoteToSeller = () => {
    if (!fullCurrentUser) return { exito: false, mensaje: 'No autenticado' };

    const updatedFull = { ...fullCurrentUser, role: 'seller' };
    const newUsers = users.map(u => u.id === updatedFull.id ? updatedFull : u);
    setUsers(newUsers);
    _persist(newUsers, currentUserId);
    return { exito: true };
  };

  const getOrders = () => {
    return fullCurrentUser ? (fullCurrentUser.pedidos || []) : [];
  };

  return (
    <CuentaContext.Provider
      value={{
        users: users.map(_publicUser),
        currentUser: publicCurrentUser,
        register,
        login,
        logout,
        actualizarPerfil,
        undo,
        redo,
        addOrder,
        getOrders,
        addShippingAddress,
        updateShippingAddress,
        removeShippingAddress,
        setDefaultShipping,
        promoteToSeller,
      }}
    >
      {children}
    </CuentaContext.Provider>
  );
};

export default CuentaContext;
