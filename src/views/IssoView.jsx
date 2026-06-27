import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Search, Filter, ShieldAlert, UploadCloud, Terminal, 
  Play, Radio, Calendar, Plus, UserPlus, Info, Check, RefreshCw,
  AlertTriangle, ShieldX, HelpCircle, ShieldCheck
} from 'lucide-react';

const IssoView = ({ defaultTab = 'inventory' }) => {
  const { 
    accounts, 
    campaigns, 
    connectors, 
    simulatedLogs, 
    periodChanges,
    computeFlags, 
    toggleConnector, 
    launchCampaign, 
    parseUploadedCSV, 
    triggerNextSiemLog,
    assignOwner,
    remediateAccount
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Sync tab selection with sidebar clicks
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Inventory state
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState('All');
  const [privilegeFilter, setPrivilegeFilter] = useState('All');
  const [flagFilter, setFlagFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Ownership assignment state
  const [newOwnerName, setNewOwnerName] = useState('David Miller');

  // Campaign Form State
  const [campName, setCampName] = useState('Q3 Enterprise Account Verification');
  const [campType, setCampType] = useState('Quarterly Privileged Account Review');
  const [campDeadline, setCampDeadline] = useState('30');
  const [campSystems, setCampSystems] = useState(['Active Directory', 'AWS IAM']);

  // CSV upload state
  const [csvUploadSuccess, setCsvUploadSuccess] = useState(null);

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(search.toLowerCase()) || 
                          acc.assignedOwner.toLowerCase().includes(search.toLowerCase());
    
    const matchesSystem = systemFilter === 'All' || acc.hostSystem === systemFilter;
    
    const matchesPriv = privilegeFilter === 'All' || 
                         (privilegeFilter === 'Admin' && (acc.type.toLowerCase().includes('admin') || acc.privilegeLevel.toLowerCase().includes('admin') || acc.privilegeLevel.toLowerCase().includes('super-user'))) ||
                         (privilegeFilter === 'Standard' && acc.privilegeLevel.toLowerCase().includes('standard'));
    
    const flags = computeFlags(acc);
    const matchesFlag = flagFilter === 'All' || flags.some(f => f.type === flagFilter);
    
    return matchesSearch && matchesSystem && matchesPriv && matchesFlag;
  });

  // Re-fetch selected account details if modified
  const currentSelectedAccount = selectedAccount ? accounts.find(a => a.id === selectedAccount.id) : null;

  // Unique systems for dropdown
  const uniqueSystems = Array.from(new Set(accounts.map(a => a.hostSystem)));

  const handleCsvFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const res = parseUploadedCSV(text, file.name);
      if (res.success) {
        setCsvUploadSuccess(`Parsed & imported ${res.count} account records.`);
        setTimeout(() => setCsvUploadSuccess(null), 5000);
      } else {
        setCsvUploadSuccess(`Import failed: ${res.error}`);
        setTimeout(() => setCsvUploadSuccess(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleSystemCheckbox = (sys) => {
    if (campSystems.includes(sys)) {
      setCampSystems(prev => prev.filter(s => s !== sys));
    } else {
      setCampSystems(prev => [...prev, sys]);
    }
  };

  const handleCreateCampaignSubmit = (e) => {
    e.preventDefault();
    if (campSystems.length === 0) {
      alert("Please select at least one system for review scope.");
      return;
    }
    launchCampaign(campName, campType, campSystems, campDeadline);
    alert(`Successfully launched ${campName}!`);
  };

  const downloadSampleTemplate = () => {
    const csvContent = "username,type,system,system_owner,owner,last_login,password_changed,privilege,mfa\n" +
      "consultant-db-dev,Human user,Linux Servers,Database Operations,John Doe,2026-06-25,2026-05-10,Standard user,true\n" +
      "invoice-processor-sa,service account,ServiceNow,Finance IT Team,None,2026-06-20,2025-05-15,Standard user,false\n" +
      "admin-aws-root,admin / privileged,AWS IAM,Cloud Infrastructure,None,2026-06-26,2026-04-12,super-user/system administrator,true";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "comply_ingestion_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to compile data for the Password Heatmap grid
  const getHeatmapData = () => {
    const today = new Date("2026-06-26");
    const data = uniqueSystems.map(sys => {
      const sysAccs = accounts.filter(a => a.hostSystem === sys);
      let count0to30 = 0;
      let count30to60 = 0;
      let count60to90 = 0;
      let count90plus = 0;

      sysAccs.forEach(acc => {
        const pwdDate = new Date(acc.passwordChanged);
        const ageDays = Math.floor((today - pwdDate) / (1000 * 60 * 60 * 24));
        if (ageDays <= 30) count0to30++;
        else if (ageDays <= 60) count30to60++;
        else if (ageDays <= 90) count60to90++;
        else count90plus++;
      });

      return { system: sys, c0to30: count0to30, c30to60: count30to60, c60to90: count60to90, c90plus: count90plus };
    });
    return data;
  };

  const heatmapData = getHeatmapData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 className="h1">Security Analyst View (ISSO)</h1>
        <p className="subtitle">Reconcile accounts inventory, manage API integrations, audit SIEM logs, and schedule NIST review campaigns.</p>
      </div>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '8px' }}>
        <button 
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('inventory')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Account Inventory ({filteredAccounts.length})
        </button>
        <button 
          className={`btn ${activeTab === 'ingestion' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ingestion')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Ingest & Log Discovery
        </button>
        <button 
          className={`btn ${activeTab === 'reconciliation' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reconciliation')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Reconciliation Comparison
        </button>
        <button 
          className={`btn ${activeTab === 'campaigns' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('campaigns')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Campaign Manager ({campaigns.length})
        </button>
      </div>

      {/* TAB 1: Account Inventory */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
          <div className="section" style={{ overflowX: 'auto' }}>
            <div className="section-header">
              <h3 className="section-title">Normalized Unified Identity Inventory</h3>
            </div>
            
            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search account name or owner..." 
                  className="form-control"
                  style={{ paddingLeft: '36px', width: '100%' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select className="form-control" value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}>
                <option value="All">All Systems</option>
                {uniqueSystems.map((sys, idx) => (
                  <option key={idx} value={sys}>{sys}</option>
                ))}
              </select>

              <select className="form-control" value={privilegeFilter} onChange={(e) => setPrivilegeFilter(e.target.value)}>
                <option value="All">All Privileges</option>
                <option value="Admin">Admin / Privileged</option>
                <option value="Standard">Standard User</option>
              </select>

              <select className="form-control" value={flagFilter} onChange={(e) => setFlagFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="noOwner">Unassigned Owner</option>
                <option value="dormant">Dormant</option>
                <option value="passwordAgeExceeded">Password Expired</option>
                <option value="mfaNotEnrolled">MFA Missing</option>
                <option value="orphaned">Orphaned</option>
                <option value="outsideProvisioning">Outside provisioning</option>
              </select>
            </div>

            {/* Inventory Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>System</th>
                  <th>Privilege</th>
                  <th>Assigned Owner</th>
                  <th>Flags / Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc, idx) => {
                  const flags = computeFlags(acc);
                  const isSelected = currentSelectedAccount?.id === acc.id;

                  return (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedAccount(acc)}
                      style={{ cursor: 'pointer', backgroundColor: isSelected ? 'var(--accent-glow)' : '' }}
                    >
                      <td style={{ fontWeight: 600 }}>{acc.name}</td>
                      <td>{acc.hostSystem}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{acc.privilegeLevel}</td>
                      <td>{acc.assignedOwner}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {acc.status === 'Revoked' ? (
                            <span className="badge badge-danger">Revoked</span>
                          ) : flags.length === 0 ? (
                            <span className="badge badge-success">Compliant</span>
                          ) : (
                            flags.map((f, i) => (
                              <span key={i} className={`badge badge-${f.severity}`} style={{ fontSize: '9px' }}>
                                {f.label}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Account Detail Side Panel */}
          <div className="section" style={{ position: 'sticky', top: '100px' }}>
            <div className="section-header">
              <h3 className="section-title">Identity Details</h3>
            </div>
            {currentSelectedAccount ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{currentSelectedAccount.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Account ID: {currentSelectedAccount.id}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                    <strong>{currentSelectedAccount.type}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Host System:</span>
                    <strong>{currentSelectedAccount.hostSystem}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>System Owner:</span>
                    <strong style={{ fontSize: '11px' }}>{currentSelectedAccount.systemOwner}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Assigned Owner:</span>
                    <strong className={currentSelectedAccount.assignedOwner === 'None' ? 'badge-danger' : ''}>
                      {currentSelectedAccount.assignedOwner}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Last Login:</span>
                    <strong>{currentSelectedAccount.lastLogin}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Password Age:</span>
                    <strong>{currentSelectedAccount.passwordChanged}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>MFA Status:</span>
                    <span className={`badge ${currentSelectedAccount.mfaEnrolled ? 'badge-success' : 'badge-danger'}`}>
                      {currentSelectedAccount.mfaEnrolled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                    <span className={`badge ${currentSelectedAccount.status === 'Active' ? 'badge-success' : currentSelectedAccount.status === 'Revoked' ? 'badge-danger' : 'badge-warning'}`}>
                      {currentSelectedAccount.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Last Audit Date:</span>
                    <strong>{currentSelectedAccount.lastReviewDate}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Reviewed By:</span>
                    <strong>{currentSelectedAccount.reviewer}</strong>
                  </div>
                </div>

                {/* Ownership Assigner Tool (Missing requirement added) */}
                {(currentSelectedAccount.assignedOwner === 'None' || currentSelectedAccount.status === 'Orphaned') && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label">
                      <UserPlus size={12} style={{ marginRight: '4px' }} />
                      Assign Human Owner (NIST AC-2(d))
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="form-control" 
                        value={newOwnerName} 
                        onChange={(e) => setNewOwnerName(e.target.value)}
                        style={{ flexGrow: 1, padding: '6px 10px', fontSize: '12px' }}
                      >
                        <option value="Sarah Jenkins">Sarah Jenkins (ISSO)</option>
                        <option value="David Miller">David Miller (System Owner)</option>
                        <option value="John Doe">John Doe (Staff)</option>
                        <option value="Matthew Comply">Matthew Comply (Auditor)</option>
                        <option value="Alice Smith">Alice Smith (Directory Admin)</option>
                      </select>
                      <button 
                        className="btn btn-primary"
                        onClick={() => assignOwner(currentSelectedAccount.id, newOwnerName)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Remediation lockout button (Govern stage added) */}
                {currentSelectedAccount.status !== 'Revoked' && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => {
                        if (confirm(`Are you sure you want to trigger active remediation to disable ${currentSelectedAccount.name}?`)) {
                          remediateAccount(currentSelectedAccount.id);
                        }
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}
                    >
                      <ShieldX size={14} />
                      <span>Simulate Directory Lockout</span>
                    </button>
                  </div>
                )}

                {computeFlags(currentSelectedAccount).length > 0 && currentSelectedAccount.status !== 'Revoked' && (
                  <div style={{ padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', fontSize: '11px', display: 'flex', gap: '8px' }}>
                    <ShieldAlert size={14} className="badge-danger" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Compliance warning:</strong>
                      <p style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
                        This account violates internal standards and must be assigned to an active campaign reviewer.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Info size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                Select an account record from the inventory grid to audit details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Ingest & Connectors */}
      {activeTab === 'ingestion' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Native API Connectors */}
            <div className="section">
              <div className="section-header">
                <h3 className="section-title">
                  <Radio size={16} className="badge-success" />
                  <span>Native API Connectors</span>
                </h3>
              </div>
              <div className="connector-grid">
                {connectors.filter(c => c.type === 'Native API').map((conn, idx) => (
                  <div key={idx} className="connector-card">
                    <div className="connector-info">
                      <div className="connector-icon" style={{ color: conn.active ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                        <RefreshCw size={16} className={conn.active ? 'scan-anim' : ''} />
                      </div>
                      <div className="connector-details">
                        <h4>{conn.name}</h4>
                        <p>Last Sync: {conn.lastPoll}</p>
                      </div>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={conn.active}
                        onChange={() => toggleConnector(conn.name)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* CSV File Upload */}
            <div className="section">
              <div className="section-header">
                <h3 className="section-title">
                  <UploadCloud size={16} />
                  <span>File-Based List Ingestion</span>
                </h3>
              </div>
              <div className="dropzone" onClick={() => document.getElementById('csv-file-picker').click()}>
                <UploadCloud size={32} style={{ color: 'var(--accent-color)' }} />
                <div>
                  <strong>Drag & drop account export CSV file</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supports files exported from Active Directory, Okta, and SaaS platforms
                  </p>
                </div>
                <input 
                  type="file" 
                  id="csv-file-picker" 
                  accept=".csv"
                  onChange={handleCsvFile}
                  style={{ display: 'none' }} 
                />
                <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); downloadSampleTemplate(); }} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  Download CSV Template
                </button>
              </div>

              {csvUploadSuccess && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', fontSize: '12px', textAlign: 'center' }}>
                  <Check size={14} style={{ marginRight: '6px', color: 'var(--success-color)' }} />
                  {csvUploadSuccess}
                </div>
              )}
            </div>

            {/* Password Age Heatmap Widget (Missing requirement added) */}
            <div className="section">
              <div className="section-header">
                <h3 className="section-title">
                  <Calendar size={16} />
                  <span>Password Age Heatmap (NIST SP 800-53 IA-5)</span>
                </h3>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Monitors credential rotation compliance rates by indexing password age buckets across connected hosts.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Heatmap header */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(4, 1fr)', gap: '8px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>
                  <span style={{ textAlign: 'left' }}>System</span>
                  <span>0-30d</span>
                  <span>30-60d</span>
                  <span>60-90d</span>
                  <span>90d+</span>
                </div>

                {heatmapData.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px repeat(4, 1fr)', gap: '8px', alignItems: 'center', textAlign: 'center', fontSize: '12px' }}>
                    <span style={{ textAlign: 'left', fontWeight: 600 }}>{row.system}</span>
                    
                    <span className="heatmap-cell" style={{ 
                      backgroundColor: row.c0to30 > 0 ? '#d1fae5' : '#f1f5f9', 
                      color: row.c0to30 > 0 ? '#065f46' : 'var(--text-muted)',
                      borderColor: row.c0to30 > 0 ? '#a7f3d0' : 'var(--border-color)',
                      padding: '6px'
                    }}>
                      {row.c0to30}
                    </span>

                    <span className="heatmap-cell" style={{ 
                      backgroundColor: row.c30to60 > 0 ? '#ecf5ff' : '#f1f5f9', 
                      color: row.c30to60 > 0 ? '#1e40af' : 'var(--text-muted)',
                      borderColor: row.c30to60 > 0 ? '#bfdbfe' : 'var(--border-color)',
                      padding: '6px'
                    }}>
                      {row.c30to60}
                    </span>

                    <span className="heatmap-cell" style={{ 
                      backgroundColor: row.c60to90 > 0 ? '#fffbeb' : '#f1f5f9', 
                      color: row.c60to90 > 0 ? '#92400e' : 'var(--text-muted)',
                      borderColor: row.c60to90 > 0 ? '#fef3c7' : 'var(--border-color)',
                      padding: '6px'
                    }}>
                      {row.c60to90}
                    </span>

                    <span className="heatmap-cell" style={{ 
                      backgroundColor: row.c90plus > 0 ? '#fef2f2' : '#f1f5f9', 
                      color: row.c90plus > 0 ? '#991b1b' : 'var(--text-muted)',
                      borderColor: row.c90plus > 0 ? '#fecaca' : 'var(--border-color)',
                      padding: '6px'
                    }}>
                      {row.c90plus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: SIEM Log Stream Analyzer */}
          <div className="section" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
              <h3 className="section-title">
                <Terminal size={16} />
                <span>SIEM Log Ingestion Console</span>
              </h3>
              <button className="btn btn-success" onClick={triggerNextSiemLog} style={{ padding: '6px 12px', fontSize: '12px' }}>
                <Play size={10} />
                <span>Inject Next Event</span>
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Passive account discovery scans raw connection logs and audit lines for unrecorded logins or credentials provisioning. Windows Event IDs 4720/4624 trigger automatic registration warnings.
            </p>

            <div className="log-terminal">
              {simulatedLogs.map((log, idx) => (
                <div key={idx} className={`log-line ${log.type}`}>
                  [{log.timestamp}] [{log.system}] {log.message}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <strong>AI Detection Status:</strong> Listening on syslog endpoints... 
              <br />
              Any event showing user creation (Event ID 4720) outside approved ITSM tickets will raise an immediate <em>"Created Outside Provisioning Workflow"</em> compliance alert flag.
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Reconciliation Comparison View (Missing requirement added) */}
      {activeTab === 'reconciliation' && (
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <Filter size={16} />
              <span>Period-over-Period Reconciliation Comparison</span>
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Compares accounts active in the current reporting period vs. the baseline logs. Changes dynamically as you parse SIEM logs, upload CSVs, or lock out accounts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Added table */}
            <div style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)' }}>
                  <Plus size={16} /> Added this Period
                </strong>
                <span className="badge badge-success">{periodChanges.added.length}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {periodChanges.added.map((name, i) => (
                  <li key={i} style={{ padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                    {name}
                  </li>
                ))}
                {periodChanges.added.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No additions recorded.</p>
                )}
              </ul>
            </div>

            {/* Removed table */}
            <div style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger-color)' }}>
                  <ShieldX size={16} /> Removed/Decommissioned
                </strong>
                <span className="badge badge-danger">{periodChanges.removed.length}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {periodChanges.removed.map((name, i) => (
                  <li key={i} style={{ padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Status Transitions table */}
            <div style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning-color)' }}>
                  <AlertTriangle size={16} /> Status Modifications
                </strong>
                <span className="badge badge-warning">{periodChanges.modified.length}</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {periodChanges.modified.map((transition, i) => (
                  <li key={i} style={{ padding: '6px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                    {transition}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Campaign Manager */}
      {activeTab === 'campaigns' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          
          {/* Active Campaigns List */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">
                <Calendar size={16} />
                <span>Active Compliance Campaigns</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {campaigns.map((camp, idx) => {
                const percent = Math.round((camp.reviewedAccounts / camp.totalAccounts) * 100);
                return (
                  <div key={idx} style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '15px' }}>{camp.name}</strong>
                      <span className="badge badge-success">{camp.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <span>Type: <strong>{camp.type}</strong></span>
                      <span>Target: <strong>{camp.targetSystems.join(', ')}</strong></span>
                      <span>Ends: <strong className="badge-danger">{camp.endDate}</strong></span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flexGrow: 1, height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--success-color)', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, width: '40px', textAlign: 'right' }}>
                        {camp.reviewedAccounts}/{camp.totalAccounts} ({percent}%)
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Reviewer Group: </span>
                      {camp.reviewerRoster.map((r, i) => (
                        <span key={i} style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '3px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campaign Scheduler Form */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">
                <Plus size={16} />
                <span>Launch New Campaign</span>
              </h3>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="camp-name">Campaign Title</label>
                <input 
                  type="text" 
                  id="camp-name"
                  className="form-control" 
                  value={campName} 
                  onChange={(e) => setCampName(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="camp-type">Campaign Scope Type</label>
                <select 
                  id="camp-type"
                  className="form-control" 
                  value={campType}
                  onChange={(e) => setCampType(e.target.value)}
                >
                  <option value="Annual Full Review">Annual Full Review (NIST AC-2)</option>
                  <option value="Quarterly Privileged Account Review">Quarterly Privileged Review (NIST AC-2(j))</option>
                  <option value="Password Age Campaign">Password Age Compliance</option>
                  <option value="Orphan Resolution Campaign">Orphan Resolution Campaign</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scope Target Systems</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {uniqueSystems.map((sys, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={campSystems.includes(sys)}
                        onChange={() => handleSystemCheckbox(sys)} 
                      />
                      <span>{sys}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="camp-days">Deadline Window (Days)</label>
                <select 
                  id="camp-days"
                  className="form-control" 
                  value={campDeadline} 
                  onChange={(e) => setCampDeadline(e.target.value)}
                >
                  <option value="15">15 Days (Urgent)</option>
                  <option value="30">30 Days (Standard)</option>
                  <option value="90">90 Days (Long-term)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                <Plus size={14} style={{ marginRight: '6px' }} />
                Launch Campaign Active
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default IssoView;
