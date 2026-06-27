import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Check, AlertTriangle, ShieldX, Clock, 
  HelpCircle, MessageSquare, ListTodo, History 
} from 'lucide-react';

const ReviewerView = () => {
  const { accounts, campaigns, currentUser, computeFlags, reviewAccount, auditLogs } = useContext(AppContext);
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [actionType, setActionType] = useState('validate'); // 'validate' | 'flag' | 'revoke'
  const [justification, setJustification] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayStr = "2026-06-26";

  // Filter accounts in active campaigns that need review
  // For the demo, we show accounts belonging to systems in active campaigns
  // and exclude those already reviewed today (2026-06-26)
  const activeSystemsInCampaigns = Array.from(new Set(
    campaigns.filter(c => c.status === 'Active').flatMap(c => c.targetSystems)
  ));

  const pendingAccounts = accounts.filter(acc => 
    activeSystemsInCampaigns.includes(acc.hostSystem) && 
    acc.lastReviewDate !== todayStr &&
    acc.status !== 'Revoked'
  );

  // Active campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'Active');

  // Filter audit logs for actions taken by the current reviewer in this session
  const myActionHistory = auditLogs.filter(log => log.reviewer === currentUser.name);

  const openReviewModal = (acc, type) => {
    setSelectedAcc(acc);
    setActionType(type);
    setJustification('');
    setIsModalOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if ((actionType === 'flag' || actionType === 'revoke') && justification.trim() === '') {
      alert("A detailed justification note is required to Flag or Revoke accounts under compliance policies.");
      return;
    }

    // Find the campaign in scope for this system
    const matchingCampaign = campaigns.find(c => 
      c.status === 'Active' && c.targetSystems.includes(selectedAcc.hostSystem)
    ) || campaigns[0];

    reviewAccount(selectedAcc.id, matchingCampaign.id, actionType, justification);
    setIsModalOpen(false);
    setSelectedAcc(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
      
      {/* Left Column: Reviews Queue */}
      <div className="section" style={{ minHeight: '500px' }}>
        <div className="section-header">
          <h3 className="section-title">
            <ListTodo size={16} />
            <span>My Account Review Queue ({pendingAccounts.length})</span>
          </h3>
        </div>

        {pendingAccounts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingAccounts.map((acc, idx) => {
              const flags = computeFlags(acc);
              
              return (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '16px', 
                    borderRadius: 'var(--border-radius)', 
                    backgroundColor: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                  className="card-glow"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#fff' }}>{acc.name}</strong>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Host System: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{acc.hostSystem}</span> | Privilege: {acc.privilegeLevel}
                      </p>
                    </div>
                    <span className="badge badge-secondary">{acc.type}</span>
                  </div>

                  {/* Account Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px', padding: '10px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Last Login</span>
                      <p style={{ fontWeight: 600 }}>{acc.lastLogin}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Password Age</span>
                      <p style={{ fontWeight: 600 }}>{acc.passwordChanged}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>MFA Status</span>
                      <p style={{ fontWeight: 600, color: acc.mfaEnrolled ? 'var(--success-color)' : 'var(--danger-color)' }}>
                        {acc.mfaEnrolled ? 'MFA Ok' : 'No MFA'}
                      </p>
                    </div>
                  </div>

                  {/* Active Warnings */}
                  {flags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {flags.map((f, i) => (
                        <span key={i} className={`badge badge-${f.severity}`} style={{ fontSize: '9px' }}>
                          {f.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button 
                      className="btn btn-success" 
                      onClick={() => openReviewModal(acc, 'validate')}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Check size={12} />
                      <span>Validate</span>
                    </button>
                    
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => openReviewModal(acc, 'flag')}
                      style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--warning-color)', borderColor: 'var(--warning-border)' }}
                    >
                      <AlertTriangle size={12} />
                      <span>Flag for Review</span>
                    </button>

                    <button 
                      className="btn btn-danger" 
                      onClick={() => openReviewModal(acc, 'revoke')}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <ShieldX size={12} />
                      <span>Revoke Access</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
            <Check size={48} className="badge-success" style={{ margin: '0 auto 16px auto', display: 'block', padding: '10px', borderRadius: '50%', backgroundColor: 'var(--success-bg)' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Queue Fully Certified!</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              All accounts in active campaigns are reviewed. Excellent governance!
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Deadlines and Action Log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Campaign Deadlines */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <Clock size={16} />
              <span>Campaign Deadlines</span>
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeCampaigns.map((camp, idx) => {
              const today = new Date("2026-06-26");
              const end = new Date(camp.endDate);
              const daysLeft = Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));

              return (
                <div key={idx} style={{ padding: '10px 12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                    {camp.name.split(' (')[0]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Progress: <strong>{camp.reviewedAccounts}/{camp.totalAccounts}</strong></span>
                    <span style={{ color: daysLeft < 10 ? 'var(--danger-color)' : 'var(--warning-color)', fontWeight: 600 }}>
                      {daysLeft} days remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Session Action History */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <History size={16} />
              <span>My Action Log</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
            {myActionHistory.length > 0 ? (
              myActionHistory.map((log, idx) => {
                const isRevoke = log.action.includes('REVOKE');
                const isFlag = log.action.includes('FLAG');
                
                return (
                  <div key={idx} style={{ padding: '10px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', fontSize: '11px', display: 'flex', gap: '8px' }}>
                    <div style={{ flexShrink: 0 }}>
                      <Check size={12} className={isRevoke ? 'badge-danger' : isFlag ? 'badge-warning' : 'badge-success'} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#fff' }}>{log.action.split('reviewed account ')[1] || log.action}</p>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-word' }}>{log.details.split('. Host')[0]}</p>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{log.timestamp}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No actions taken in this session yet.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Review Confirmation Modal */}
      {isModalOpen && selectedAcc && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === 'validate' ? 'Validate Access Rights' : actionType === 'flag' ? 'Flag Account Warning' : 'Revoke Account Access'}
              </h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Account Name: <strong style={{ color: '#fff' }}>{selectedAcc.name}</strong> on <strong style={{ color: '#fff' }}>{selectedAcc.hostSystem}</strong>.
                <p style={{ marginTop: '6px' }}>
                  {actionType === 'validate' 
                    ? 'Confirming this account is authorized, active, and meets active compliance policies.'
                    : actionType === 'flag'
                    ? 'Flagging this account will escalate it to the security analyst team for validation.'
                    : 'Revoking access will lock the account and initiate standard offboarding logs.'}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="justification-input">
                  Compliance Justification Notes {(actionType === 'flag' || actionType === 'revoke') && '*'}
                </label>
                <textarea 
                  id="justification-input"
                  className="form-control"
                  rows="3"
                  placeholder={actionType === 'validate' ? "E.g., verified active employee contract and permissions match role scope." : "E.g., Owner departed. Account lacks active manager approval. Request immediate revocation."}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  style={{ resize: 'none', width: '100%' }}
                  required={actionType === 'flag' || actionType === 'revoke'}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={`btn ${actionType === 'revoke' ? 'btn-danger' : actionType === 'flag' ? 'btn-secondary' : 'btn-success'}`}>
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewerView;
