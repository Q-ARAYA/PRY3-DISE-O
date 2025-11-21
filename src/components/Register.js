import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCuenta } from '../context/CuentaContext';
import './Account.css';

const Register = () => {
  const { register, actualizarPerfil } = useCuenta();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [isSeller, setIsSeller] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState({
    phone: '',
    storeName: '',
    sellerType: 'individual',
    taxId: '',
    businessAddress: { line1: '', province: '', canton: '', district: '', postal: '', country: '' },
    dispatchAddress: { line1: '', schedule: '', methods: '' },
    bankInfo: { bankName: '', accountType: '', accountNumber: '', accountHolder: '', holderDocument: '' }
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, role: isSeller ? 'seller' : 'buyer' };
    if (isSeller) payload.sellerInfo = {
      companyName: sellerData.storeName,
      sellerType: sellerData.sellerType,
      taxId: sellerData.taxId,
      businessAddress: sellerData.businessAddress,
      dispatchAddress: sellerData.dispatchAddress,
      bankInfo: sellerData.bankInfo,
      contactPhone: sellerData.phone
    };
    const res = register(payload);
    setMsg(res.mensaje || (res.exito ? 'Registrado' : 'Error'));
    if (res.exito) {
      // ensure sellerInfo is present on the stored profile (redundant but safe)
      if (isSeller && payload.sellerInfo) {
        try { actualizarPerfil({ sellerInfo: payload.sellerInfo }); } catch (e) {}
      }
      navigate('/cuenta');
    }
  };

  return (
    <main className="account-page">
      <div className={`account-container ${isSeller ? 'register-seller-expanded' : ''}`}>
        <section className="account-main" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Crear cuenta</h2>
          {msg && <div className="account-message">{msg}</div>}
          <form className={`account-form ${isSeller ? 'register-two-column' : ''}`} onSubmit={handleSubmit}>
            {!isSeller ? (
              <>
                <label>Nombre<input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" required /></label>
                <label>Email<input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" required /></label>
                <label>Contraseña<input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" required /></label>
                <label className="switch-row">
                  <span className="switch-text">Registrarme como vendedor</span>
                  <div className="switch">
                    <input id="register-isSeller" className="switch-input" type="checkbox" checked={isSeller} onChange={(e) => setIsSeller(e.target.checked)} aria-checked={isSeller} />
                    <span className="switch-slider" aria-hidden="true"></span>
                  </div>
                </label>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Registrar</button>
                  <Link to="/login" className="btn btn-secondary">Volver</Link>
                </div>
              </>
            ) : (
              <>
                <div className="register-column-left">
                  <h3 className="column-title">Información Personal</h3>
                  <label>Nombre completo<input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" required /></label>
                  <label>Correo electrónico<input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" required /></label>
                  <label>Contraseña<input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" required /></label>
                  <label className="switch-row" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <span className="switch-text">Registrarme como vendedor</span>
                    <div className="switch">
                      <input id="register-isSeller" className="switch-input" type="checkbox" checked={isSeller} onChange={(e) => setIsSeller(e.target.checked)} aria-checked={isSeller} />
                      <span className="switch-slider" aria-hidden="true"></span>
                    </div>
                  </label>
                  <label>Teléfono de contacto<input className="form-input" name="phone" value={sellerData.phone} onChange={(e) => setSellerData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+506 1234-5678" required /></label>
                  <label>Nombre de la tienda<input className="form-input" name="storeName" value={sellerData.storeName} onChange={(e) => setSellerData(prev => ({ ...prev, storeName: e.target.value }))} placeholder="Nombre de tu tienda" required /></label>
                  <label>Tipo de vendedor
                    <select className="form-input" value={sellerData.sellerType} onChange={(e) => setSellerData(prev => ({ ...prev, sellerType: e.target.value }))} required>
                      <option value="individual">Individual / Persona física</option>
                      <option value="company">Empresa registrada</option>
                    </select>
                  </label>
                  <label>Número de identificación fiscal
                    <input className="form-input" name="taxId" value={sellerData.taxId} onChange={(e) => setSellerData(prev => ({ ...prev, taxId: e.target.value }))} placeholder="Cédula o NIT" required />
                  </label>
                </div>
                <div className="register-column-right">
                  <h3 className="column-title">Dirección e Información Bancaria</h3>
                  <label>Dirección completa (negocio)<input className="form-input" placeholder="Calle, número, edificio" value={sellerData.businessAddress.line1} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, line1: e.target.value } }))} required /></label>
                  <label>Provincia / Cantón / Distrito<input className="form-input" placeholder="Provincia, Cantón, Distrito" value={sellerData.businessAddress.province} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, province: e.target.value } }))} required /></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <label>Código postal<input className="form-input" placeholder="10101" value={sellerData.businessAddress.postal} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, postal: e.target.value } }))} required /></label>
                    <label>País<input className="form-input" placeholder="Costa Rica" value={sellerData.businessAddress.country} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, country: e.target.value } }))} required /></label>
                  </div>
                  
                  <div className="section-subtitle" style={{ marginTop: '1rem' }}>Información bancaria</div>
                  <label>Nombre del banco<input className="form-input" placeholder="Ej: Banco Nacional" value={sellerData.bankInfo.bankName} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, bankName: e.target.value } }))} required /></label>
                  <label>Tipo de cuenta<input className="form-input" placeholder="Ahorro, Corriente, etc." value={sellerData.bankInfo.accountType} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountType: e.target.value } }))} required /></label>
                  <label>Número de cuenta<input className="form-input" placeholder="CR12345678901234567890" value={sellerData.bankInfo.accountNumber} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountNumber: e.target.value } }))} required /></label>
                  <label>Nombre del titular<input className="form-input" placeholder="Nombre completo del titular" value={sellerData.bankInfo.accountHolder} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountHolder: e.target.value } }))} required /></label>
                </div>
                <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '1.5rem', justifyContent: 'center' }}>
                  <button type="submit" className="btn btn-primary">Registrar como Vendedor</button>
                  <Link to="/login" className="btn btn-secondary">Volver</Link>
                </div>
              </>
            )}
          </form>
        </section>
      </div>
    </main>
  );
};

export default Register;
