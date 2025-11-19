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
            <label className="switch-row">
              <span className="switch-text">Registrarme como vendedor</span>
              <div className="switch">
                <input id="register-isSeller" className="switch-input" type="checkbox" checked={isSeller} onChange={(e) => setIsSeller(e.target.checked)} aria-checked={isSeller} />
                <span className="switch-slider" aria-hidden="true"></span>
              </div>
            </label>

            {isSeller && (
              <div className="seller-card register-seller" style={{ marginTop: 8 }}>
                <div className="seller-title">Información obligatoria para vendedor</div>
                <div className="seller-sub">Estos datos son necesarios para procesar pagos, envíos y facturación.</div>
                <label>Teléfono<input className="form-input" name="phone" value={sellerData.phone} onChange={(e) => setSellerData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Número de contacto" /></label>
                <label>Nombre de la tienda / marca<input className="form-input" name="storeName" value={sellerData.storeName} onChange={(e) => setSellerData(prev => ({ ...prev, storeName: e.target.value }))} placeholder="Nombre de la tienda" /></label>
                <label>Tipo de vendedor
                  <select className="form-input" value={sellerData.sellerType} onChange={(e) => setSellerData(prev => ({ ...prev, sellerType: e.target.value }))}>
                    <option value="individual">Individual / Persona física</option>
                    <option value="company">Empresa registrada</option>
                  </select>
                </label>
                <label>Número de identificación fiscal<input className="form-input" name="taxId" value={sellerData.taxId} onChange={(e) => setSellerData(prev => ({ ...prev, taxId: e.target.value }))} placeholder="Cédula o NIT" /></label>
                <div className="seller-grid">
                  <input className="form-input" placeholder="Dirección completa" value={sellerData.businessAddress.line1} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, line1: e.target.value } }))} />
                  <input className="form-input" placeholder="Provincia / Cantón / Distrito" value={sellerData.businessAddress.province} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, province: e.target.value } }))} />
                  <input className="form-input" placeholder="Código postal" value={sellerData.businessAddress.postal} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, postal: e.target.value } }))} />
                  <input className="form-input" placeholder="País" value={sellerData.businessAddress.country} onChange={(e) => setSellerData(prev => ({ ...prev, businessAddress: { ...prev.businessAddress, country: e.target.value } }))} />
                </div>
                <div className="seller-sub" style={{ marginTop: 6 }}>Información bancaria</div>
                <div className="seller-grid">
                  <input className="form-input" placeholder="Nombre del banco" value={sellerData.bankInfo.bankName} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, bankName: e.target.value } }))} />
                  <input className="form-input" placeholder="Tipo de cuenta" value={sellerData.bankInfo.accountType} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountType: e.target.value } }))} />
                  <input className="form-input" placeholder="Número de cuenta / IBAN" value={sellerData.bankInfo.accountNumber} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountNumber: e.target.value } }))} />
                  <input className="form-input" placeholder="Nombre del titular" value={sellerData.bankInfo.accountHolder} onChange={(e) => setSellerData(prev => ({ ...prev, bankInfo: { ...prev.bankInfo, accountHolder: e.target.value } }))} />
                </div>
              </div>
            )}
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
