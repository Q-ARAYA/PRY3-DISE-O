import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';
import './Account.css';

const Register = () => {
  const { register } = useCuenta();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = register(form);
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
            <label>Nombre<input name="nombre" value={form.nombre} onChange={handleChange} /></label>
            <label>Email<input name="email" value={form.email} onChange={handleChange} /></label>
            <label>Contraseña<input name="password" type="password" value={form.password} onChange={handleChange} /></label>
            <div className="form-actions">
              <button type="submit">Registrar</button>
              <Link to="/login"><button type="button">Volver</button></Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Register;
