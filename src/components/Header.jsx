import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { LogOut, RotateCcw, ShieldCheck, RefreshCw } from 'lucide-react';

const Header = ({ activePageTitle }) => {
  const { currentUser, switchRole, logout, resetDatabase, isSyncing } = useContext(AppContext);

  if (!currentUser) return null;

  return (
    <header className="header">
      <div className="header-left">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600 }}>
          {activePageTitle}
        </h2>
      </div>

      <div className="header-right">
        {/* Syncing Status Indicator */}
        <div className="system-status">
          <span className={`status-dot ${isSyncing ? 'syncing' : ''}`}></span>
          <span>{isSyncing ? 'Ingesting Feeds...' : 'System Secure'}</span>
        </div>

        {/* Database Reseed Utility */}
        <button 
          className="btn btn-secondary" 
          onClick={resetDatabase} 
          title="Reset Database to initial seed state"
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>

        {/* Dynamic Demo Role Switcher */}
        <div className="role-switcher-container">
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Perspective:
          </span>
          <select 
            value={currentUser.role} 
            onChange={(e) => switchRole(e.target.value)}
            className="role-select"
          >
            <option value="CISO">CISO (Executive)</option>
            <option value="ISSO">ISSO (Security Analyst)</option>
            <option value="System Owner">System Owner (Reviewer)</option>
            <option value="Auditor">Compliance Auditor</option>
          </select>
        </div>

        {/* Profile Card */}
        <div className="user-profile">
          <div className="avatar">
            {currentUser.name.charAt(0)}
          </div>
          <div style={{ textAlign: 'left', display: 'none', display: 'md-block' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
              {currentUser.name}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
              {currentUser.role}
            </p>
          </div>
          <button 
            onClick={logout} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginLeft: '8px', color: 'var(--text-secondary)' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
