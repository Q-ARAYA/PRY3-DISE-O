import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';
import './Account.css';

const Register = () => {
  const { register } = useCuenta();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [isSeller, setIsSeller] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, role: isSeller ? 'seller' : 'buyer' };
    const res = register(payload);
    setMsg(res.mensaje || (res.exito ? 'Registrado' : 'Error'));
    if (res.exito) navigate('/cuenta');
  };

  return (
    <main className="account-page">
      <div className="account-container">
        <section className="account-main" style={{ padding: '2rem' }}>
          <h2>Crear cuenta</h2>
          {msg && <div className="account-message">{msg}</div>}
          <form className="account-form" onSubmit={handleSubmit}>
            <label>Nombre<input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" /></label>
            <label>Email<input className="form-input" name="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" /></label>
            <label>Contraseña<input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={isSeller} onChange={(e) => setIsSeller(e.target.checked)} /> Registrarme como vendedor
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Registrar</button>
              <Link to="/login" className="btn btn-secondary">Volver</Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Register;
