import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';
import './Account.css';

const Login = () => {
  const { login } = useCuenta();
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(form);
    if (!res.exito) {
      setMsg(res.mensaje);
    } else {
      navigate('/cuenta');
    }
  };

  return (
    <main className="account-page">
      <div className="account-container">
        <section className="account-main" style={{ padding: '2rem' }}>
          <h2>Iniciar sesión</h2>
          {msg && <div className="account-message">{msg}</div>}
          <form className="account-form" onSubmit={handleSubmit}>
            <label>Email<input className="form-input" name="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" /></label>
            <label>Contraseña<input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" /></label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Ingresar</button>
              <Link to="/register" className="btn btn-secondary">Crear cuenta</Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Login;
