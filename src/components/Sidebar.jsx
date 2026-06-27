import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  BarChart3, 
  Users, 
  Settings, 
  CheckSquare, 
  FileSpreadsheet, 
  Fingerprint, 
  ShieldAlert 
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const { currentUser, switchRole } = useContext(AppContext);

  if (!currentUser) return null;

  // Handle navigation click and automatically switch role to match page perspective
  const handleNavClick = (page, requiredRole) => {
    setActivePage(page);
    if (currentUser.role !== requiredRole) {
      switchRole(requiredRole);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Fingerprint size={18} />
        </div>
        <div className="logo-text">Comply</div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ padding: '0 16px 8px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Executive Desk
        </div>
        <div 
          className={`sidebar-link ${activePage === 'ciso' ? 'active' : ''}`}
          onClick={() => handleNavClick('ciso', 'CISO')}
        >
          <BarChart3 size={16} />
          <span>Executive Dashboard</span>
        </div>

        <div style={{ padding: '16px 16px 8px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Security Analyst
        </div>
        <div 
          className={`sidebar-link ${activePage === 'inventory' ? 'active' : ''}`}
          onClick={() => handleNavClick('inventory', 'ISSO')}
        >
          <Users size={16} />
          <span>Account Inventory</span>
        </div>
        <div 
          className={`sidebar-link ${activePage === 'integrations' ? 'active' : ''}`}
          onClick={() => handleNavClick('integrations', 'ISSO')}
        >
          <Settings size={16} />
          <span>Ingest & Connectors</span>
        </div>

        <div style={{ padding: '16px 16px 8px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Operations
        </div>
        <div 
          className={`sidebar-link ${activePage === 'reviewer' ? 'active' : ''}`}
          onClick={() => handleNavClick('reviewer', 'System Owner')}
        >
          <CheckSquare size={16} />
          <span>Campaign Reviews</span>
        </div>

        <div style={{ padding: '16px 16px 8px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Regulatory Desk
        </div>
        <div 
          className={`sidebar-link ${activePage === 'auditor' ? 'active' : ''}`}
          onClick={() => handleNavClick('auditor', 'Auditor')}
        >
          <FileSpreadsheet size={16} />
          <span>Compliance Reports</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <ShieldAlert size={14} className="badge-warning" style={{ flexShrink: 0 }} />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              FISMA High Baseline
            </p>
            <p style={{ fontSize: '8px', color: 'var(--text-muted)', margin: 0 }}>
              Audit Ready: 2026
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
