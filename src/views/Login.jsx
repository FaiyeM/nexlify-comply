import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldAlert, Fingerprint, Lock } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AppContext);
  const [username, setUsername] = useState('sarah.jenkins@nexlify.gov');
  const [selectedRole, setSelectedRole] = useState('ISSO');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, selectedRole);
  };

  const handleRoleSelect = (role, email) => {
    setSelectedRole(role);
    setUsername(email);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo-icon" style={{ margin: '0 auto', width: '48px', height: '48px', borderRadius: '12px' }}>
            <Fingerprint size={28} />
          </div>
          <h2 className="login-title" style={{ fontFamily: 'var(--font-heading)' }}>Nexlify Comply</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Account Intelligence & Access Review Platform
          </p>
        </div>

        {/* Federal warning banner (compliance requirement) */}
        <div className="fed-banner">
          <ShieldAlert size={14} style={{ margin: '0 auto 6px auto', display: 'block' }} />
          <strong>WARNING: SYSTEM ACCESS AUTHORIZATION</strong>
          <p style={{ marginTop: '4px', fontSize: '9px', lineHeight: '1.3' }}>
            This system contains sensitive government and enterprise compliance information. Unauthorized access, modification, or auditing of records is strictly prohibited by law (NIST SP 800-53, FISMA). All activities are monitored and logged.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Demo Role Profile</label>
            <div className="role-grid">
              <div 
                className={`role-card-select ${selectedRole === 'ISSO' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('ISSO', 'sarah.jenkins@nexlify.gov')}
              >
                <span>ISSO</span>
                <span className="role-desc">Security Analyst</span>
              </div>
              <div 
                className={`role-card-select ${selectedRole === 'CISO' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('CISO', 'ciso.david@nexlify.gov')}
              >
                <span>CISO</span>
                <span className="role-desc">Executive Views</span>
              </div>
              <div 
                className={`role-card-select ${selectedRole === 'System Owner' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('System Owner', 'david.miller@nexlify.gov')}
              >
                <span>Owner</span>
                <span className="role-desc">Reviewer Workspace</span>
              </div>
              <div 
                className={`role-card-select ${selectedRole === 'Auditor' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('Auditor', 'matthew.comply@nexlify.gov')}
              >
                <span>Auditor</span>
                <span className="role-desc">Compliance Desk</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Principal Login (Email / UPN)</label>
            <input 
              type="email" 
              id="username"
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Security Password / PIV Pin</label>
            <input 
              type="password" 
              id="password"
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <Lock size={14} style={{ marginRight: '6px' }} />
            Authenticate & Access
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
