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
            <label>Email<input name="email" value={form.email} onChange={handleChange} /></label>
            <label>Contraseña<input name="password" type="password" value={form.password} onChange={handleChange} /></label>
            <div className="form-actions">
              <button type="submit">Ingresar</button>
              <Link to="/register"><button type="button">Crear cuenta</button></Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Login;
