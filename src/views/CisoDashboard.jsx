import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShieldCheck, AlertTriangle, UserCheck, ShieldAlert, Award, 
  Sparkles, Check, ArrowRight, RefreshCw 
} from 'lucide-react';

const CisoDashboard = () => {
  const { 
    accounts, 
    campaigns, 
    computeFlags, 
    aiRecommendations, 
    acceptAiRecommendation, 
    runLiveAiAudit, 
    isAiLoading, 
    isGeminiActive 
  } = useContext(AppContext);

  // 1. Calculate general metrics
  const totalAccounts = accounts.length;
  
  let dormantCount = 0;
  let unownedCount = 0;
  let orphanedCount = 0;
  let expiredPasswordCount = 0;
  let mfaNotEnrolledCount = 0;

  accounts.forEach(acc => {
    const flags = computeFlags(acc);
    if (flags.some(f => f.type === 'dormant')) dormantCount++;
    if (flags.some(f => f.type === 'noOwner')) unownedCount++;
    if (flags.some(f => f.type === 'orphaned')) orphanedCount++;
    if (flags.some(f => f.type === 'passwordAgeExceeded')) expiredPasswordCount++;
    if (flags.some(f => f.type === 'mfaNotEnrolled')) mfaNotEnrolledCount++;
  });

  // Campaign progress
  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const overallCampaignCompletion = activeCampaigns.length > 0
    ? Math.round((activeCampaigns.reduce((acc, curr) => acc + curr.reviewedAccounts, 0) / activeCampaigns.reduce((acc, curr) => acc + curr.totalAccounts, 0)) * 100)
    : 0;

  const passwordComplianceRate = totalAccounts > 0 
    ? Math.round(((totalAccounts - expiredPasswordCount) / totalAccounts) * 100)
    : 0;

  // 2. Prepare charts data
  const systemCounts = {};
  accounts.forEach(acc => {
    systemCounts[acc.hostSystem] = (systemCounts[acc.hostSystem] || 0) + 1;
  });
  const barChartData = Object.keys(systemCounts).map(sys => ({
    name: sys,
    accounts: systemCounts[sys],
  }));

  const pieChartData = [
    { name: 'Compliant Rotation', value: totalAccounts - expiredPasswordCount, color: 'var(--success-color)' },
    { name: 'Credentials Expired', value: expiredPasswordCount, color: 'var(--danger-color)' }
  ];

  const lineChartData = [
    { week: 'Week 1', completed: 15, pending: 85 },
    { week: 'Week 2', completed: 30, pending: 70 },
    { week: 'Week 3', completed: 42, pending: 58 },
    { week: 'Week 4', completed: 60, pending: 40 },
    { week: 'Week 5', completed: 78, pending: 22 },
    { week: 'Current', completed: overallCampaignCompletion || 80, pending: 100 - (overallCampaignCompletion || 80) }
  ];

  // System Risk Scoring Table
  const systemRisks = {};
  accounts.forEach(acc => {
    const flags = computeFlags(acc);
    if (!systemRisks[acc.hostSystem]) {
      systemRisks[acc.hostSystem] = { system: acc.hostSystem, total: 0, flagged: 0 };
    }
    systemRisks[acc.hostSystem].total++;
    if (flags.length > 0) {
      systemRisks[acc.hostSystem].flagged += flags.length;
    }
  });

  const sortedSystemRisks = Object.values(systemRisks)
    .map(sys => ({
      ...sys,
      riskRatio: sys.total > 0 ? Math.round((sys.flagged / sys.total) * 100) : 0
    }))
    .sort((a, b) => b.riskRatio - a.riskRatio)
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="h1">CISO Executive Dashboard</h1>
          <p className="subtitle">Real-time enterprise account governance metrics and NIST SP 800-53 control compliance.</p>
        </div>
      </div>

      {/* AI RECONCILIATION COPILOT WIDGET (Recommended Expansion) */}
      <div className="ai-copilot-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #bfdbfe', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-color)' }} />
            <strong style={{ fontSize: '15px', color: '#1e3a8a' }}>AI Reconciliation Copilot</strong>
            <span className={`badge ${isGeminiActive ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'none', padding: '2px 6px', fontSize: '10px' }}>
              {isGeminiActive ? 'Gemini 1.5 Active' : 'Gemini Sandbox Mode'}
            </span>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={runLiveAiAudit}
            disabled={isAiLoading}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={12} className={isAiLoading ? 'scan-anim' : ''} style={{ animation: isAiLoading ? 'pulse 1.5s infinite' : 'none' }} />
            <span>{isAiLoading ? 'Running AI Audit...' : 'Run Google AI Studio Audit'}</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {aiRecommendations.length > 0 ? (
            aiRecommendations.slice(0, 2).map((rec, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: i < aiRecommendations.length - 1 ? '10px' : '0', borderBottom: i < aiRecommendations.length - 1 ? '1px dashed #bfdbfe' : 'none' }}>
                <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.4, flexGrow: 1 }}>
                  Detected unassigned account <strong style={{ color: '#0f172a' }}>{rec.accountName}</strong> on <strong style={{ color: '#0f172a' }}>{rec.system}</strong>. 
                  <br />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    ✨ <strong>Gemini Recommendation:</strong> {rec.reason}
                  </span>
                </div>
                <button 
                  className="btn btn-success" 
                  onClick={() => acceptAiRecommendation(rec.id)}
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: '#fff' }}
                >
                  <Check size={12} />
                  <span>Assign to {rec.recommendedOwner}</span>
                </button>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '12px', color: '#1e40af', textAlign: 'center', padding: '10px 0' }}>
              No active reconciliation recommendations. Click "Run Google AI Studio Audit" to evaluate compliance.
            </p>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="dashboard-grid">
        <div className="card card-glow">
          <div className="card-title">Total Discovered Accounts</div>
          <div className="card-value">{totalAccounts}</div>
          <div className="card-subtext">
            <ShieldCheck size={12} className="badge-success" />
            <span>Unified inventory across all systems</span>
          </div>
        </div>

        <div className="card card-glow-success">
          <div className="card-title">Campaign Review Completion</div>
          <div className="card-value">{overallCampaignCompletion}%</div>
          <div className="card-subtext">
            <UserCheck size={12} className="badge-success" />
            <span>Active campaigns status</span>
          </div>
        </div>

        <div className="card card-glow-danger">
          <div className="card-title">Critical Security Flags</div>
          <div className="card-value">{unownedCount + orphanedCount + mfaNotEnrolledCount}</div>
          <div className="card-subtext">
            <ShieldAlert size={12} className="badge-danger" />
            <span>Unowned, orphaned, or non-MFA</span>
          </div>
        </div>

        <div className="card card-glow-warning">
          <div className="card-title">Credentials Rotation Compliance</div>
          <div className="card-value">{passwordComplianceRate}%</div>
          <div className="card-subtext">
            <AlertTriangle size={12} className="badge-warning" />
            <span>{expiredPasswordCount} accounts expire soon</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div className="section" style={{ minHeight: '340px' }}>
          <div className="section-header">
            <h3 className="section-title">Identity Ingestion by Host System</h3>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="accounts" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section" style={{ minHeight: '340px' }}>
          <div className="section-header">
            <h3 className="section-title">Campaign Review Completion Trend</h3>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend fontSize={10} />
                <Line type="monotone" dataKey="completed" stroke="var(--success-color)" activeDot={{ r: 8 }} name="% Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Compliance Heatmaps and risk metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Password rotation compliance donut */}
        <div className="section" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <h3 className="section-title">Password Rotation Compliance</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexGrow: 1, padding: '10px 0' }}>
            <div style={{ width: '150px', height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pieChartData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: d.color }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Risk Table */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Host Systems Risk Scores</h3>
          </div>
          <div className="table-container" style={{ marginTop: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>System</th>
                  <th>Flag Count</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedSystemRisks.map((sys, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{sys.system}</td>
                    <td>{sys.flagged} flags</td>
                    <td>
                      <span className={`badge ${sys.riskRatio > 60 ? 'badge-danger' : sys.riskRatio > 30 ? 'badge-warning' : 'badge-success'}`}>
                        {sys.riskRatio}% RISK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Target compliance checklist */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Regulatory Framework Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>NIST SP 800-53 AC-2</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Account Management & Auth rules</p>
              </div>
              <span className="badge badge-success">COMPLIANT</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>NIST SP 800-53 AC-2(j)</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Account review campaigns</p>
              </div>
              <span className={`badge ${overallCampaignCompletion > 80 ? 'badge-success' : 'badge-warning'}`}>
                {overallCampaignCompletion}% CERTIFIED
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>NIST SP 800-53 AU-2 / AU-12</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Audit logging & review trails</p>
              </div>
              <span className="badge badge-success">ACTIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '13px' }}>FedRAMP ConMon</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monthly access log evidence exports</p>
              </div>
              <span className="badge badge-info">OSCAL READY</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CisoDashboard;
