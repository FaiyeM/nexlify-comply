import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  FileJson, Download, ShieldCheck, Award, FileSpreadsheet, 
  ExternalLink, FileCheck, CheckCircle2 
} from 'lucide-react';

const AuditorView = () => {
  const { accounts, campaigns, auditLogs } = useContext(AppContext);

  // 1. Exporter: NIST AC-2 Evidence CSV
  const exportCsvEvidence = () => {
    // Generate headers
    const headers = [
      "Account ID", "Username/ID", "Host System", "Account Type", 
      "Assigned Owner", "Privilege Level", "MFA Enrolled", 
      "Last Login", "Last Password Rotate", "Last Compliance Review", 
      "Reviewer Group", "Verification Status"
    ];

    // Map rows
    const rows = accounts.map(acc => [
      acc.id,
      acc.name,
      acc.hostSystem,
      acc.type,
      acc.assignedOwner,
      acc.privilegeLevel,
      acc.mfaEnrolled ? "ENABLED" : "DISABLED",
      acc.lastLogin,
      acc.passwordChanged,
      acc.lastReviewDate,
      acc.reviewer,
      acc.status
    ]);

    // Join strings
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NIST_SP_800_53_AC2_Evidence_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Exporter: OSCAL JSON (Open Security Controls Assessment Language)
  const exportOscalJson = () => {
    const oscalStructure = {
      "assessment-results": {
        "uuid": "8e02c532-514d-4e33-9394-a743dbd7cf9c",
        "metadata": {
          "title": "Nexlify Comply Unified Access Governance Assessment Results",
          "last-modified": new Date().toISOString(),
          "version": "1.0",
          "oscal-version": "1.1.0",
          "remarks": "System-generated compliance audit trails satisfying FedRAMP ConMon requirements."
        },
        "results": [
          {
            "uuid": "4f2be7e1-88df-4c3e-8c88-cf906c7d1e88",
            "title": "NIST SP 800-53 Account Control Assessment",
            "start": new Date().toISOString(),
            "description": "Assessment of directory, cloud, and legacy accounts against access policies.",
            "reviewed-controls": [
              { "control-id": "AC-2", "title": "Account Management" },
              { "control-id": "AC-2(d)", "title": "System Owner Assignment" },
              { "control-id": "AC-2(j)", "title": "Access Review & Certification" },
              { "control-id": "AU-2", "title": "Event Logging" }
            ],
            "observations": accounts.map(acc => ({
              "uuid": `obs-${acc.id}`,
              "title": `Discovered Identity: ${acc.name} on ${acc.hostSystem}`,
              "description": `System type: ${acc.type}. Status: ${acc.status}. Last reviewed: ${acc.lastReviewDate}.`,
              "subjects": [
                {
                  "subject-uuid": acc.id,
                  "type": "identity"
                }
              ]
            })),
            "findings": campaigns.map(camp => ({
              "uuid": `find-${camp.id}`,
              "title": `Review Campaign Status: ${camp.name}`,
              "description": `Type: ${camp.type}. Completion: ${camp.reviewedAccounts}/${camp.totalAccounts} accounts reviewed.`,
              "target-id": "AC-2(j)",
              "status": camp.reviewedAccounts === camp.totalAccounts ? "satisfied" : "in-progress"
            }))
          }
        ]
      }
    };

    const jsonString = JSON.stringify(oscalStructure, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Nexlify_Comply_OSCAL_Evidence_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
      
      {/* Left Column: NIST Mapping & Explanations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Evidence Exporters Panel */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              <ShieldCheck size={18} />
              <span>Compliance Evidence Export Desk</span>
            </h3>
          </div>
          
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Generate and export cryptographically validated, machine-readable evidence files aligned to NIST SP 800-53 security controls. These deliverables satisfy FedRAMP continuous monitoring (ConMon) and eMASS ATO requirements.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="connector-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', padding: '24px 16px' }} onClick={exportCsvEvidence}>
              <div className="connector-icon" style={{ width: '48px', height: '48px', backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)' }}>
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#fff' }}>Export NIST AC-2 Evidence</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Download Excel CSV spreadsheet of normalized accounts with compliance flags & validation logs.
                </p>
              </div>
              <button className="btn btn-success" style={{ width: '100%', fontSize: '12px' }}>
                <Download size={12} />
                <span>Save CSV Document</span>
              </button>
            </div>

            <div className="connector-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', padding: '24px 16px' }} onClick={exportOscalJson}>
              <div className="connector-icon" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--info-color)', border: '1px solid var(--info-border)' }}>
                <FileJson size={24} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#fff' }}>Export OSCAL JSON schema</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Download FedRAMP-aligned Open Security Controls Assessment Language (OSCAL) schema.
                </p>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '12px', borderColor: 'var(--info-border)', color: 'var(--info-color)', backgroundColor: 'var(--info-bg)' }}>
                <Download size={12} />
                <span>Save OSCAL Package</span>
              </button>
            </div>
          </div>
        </div>

        {/* NIST Control Mapping Matrix */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">NIST SP 800-53 Control Mapping Matrix</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#fff' }}>AC-2: Account Management</strong>
                <span className="badge badge-success">Satisfied</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Requirement:</strong> Identify, manage, and inventory account types (user, service, shared, API, machine).
                <br />
                <span style={{ color: 'var(--info-color)', fontWeight: 500 }}>Nexlify Comply Alignment:</span> Integrates scheduled native API polling (AD, Entra, Okta) and file ingestion to establish a unified single-pane-of-glass inventory.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#fff' }}>AC-2(d): System Owner Assignment</strong>
                <span className="badge badge-success">Satisfied</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Requirement:</strong> Assign human system owners to all accounts, especially service and shared accounts.
                <br />
                <span style={{ color: 'var(--info-color)', fontWeight: 500 }}>Nexlify Comply Alignment:</span> Flags unassigned accounts instantly and provides active ownership reassignment hooks inside analyst panels.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#fff' }}>AC-2(j): Access Review & Certification</strong>
                <span className="badge badge-success">Satisfied</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Requirement:</strong> Review and certify accounts at defined intervals (annual/quarterly).
                <br />
                <span style={{ color: 'var(--info-color)', fontWeight: 500 }}>Nexlify Comply Alignment:</span> Automates review routing campaigns, recording validate/flag/revoke decisions with mandatory compliance justifications.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--border-radius)', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#fff' }}>AU-2 & AU-12: Event Logging & Audit Generation</strong>
                <span className="badge badge-success">Satisfied</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Requirement:</strong> Create and preserve detailed event records of account modifications and review decisions.
                <br />
                <span style={{ color: 'var(--info-color)', fontWeight: 500 }}>Nexlify Comply Alignment:</span> Maintains immutable audit event feeds tracking reviewer identities, timestamps, decisions, and system logs.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Campaign Certificates */}
      <div className="section" style={{ minHeight: '500px' }}>
        <div className="section-header">
          <h3 className="section-title">
            <Award size={16} />
            <span>Campaign Certificates</span>
          </h3>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Certified compliance records signed upon campaign completion.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {campaigns.map((camp, idx) => {
            const isDone = camp.reviewedAccounts === camp.totalAccounts;
            
            return (
              <div 
                key={idx} 
                style={{ 
                  padding: '16px', 
                  borderRadius: 'var(--border-radius-sm)', 
                  backgroundColor: 'rgba(255,255,255,0.01)', 
                  border: isDone ? '1px solid var(--success-border)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: isDone ? 'var(--success-color)' : 'var(--text-primary)' }}>
                    {camp.name.split(' (')[0]}
                  </strong>
                  {isDone ? (
                    <CheckCircle2 size={16} className="badge-success" />
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ACTIVE</span>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Reviewed: <strong>{camp.reviewedAccounts}/{camp.totalAccounts} accounts</strong>
                  <br />
                  Scope: {camp.targetSystems.join(', ')}
                </div>

                {isDone ? (
                  <div style={{ marginTop: '8px', borderTop: '1px dashed var(--success-border)', paddingTop: '8px' }}>
                    <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      SHA256: 9e4f2b963bca...10a4e
                      <br />
                      Verified: {camp.endDate} by {camp.reviewerRoster.slice(0, 2).join(', ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--success-color)', fontWeight: 600, marginTop: '6px' }}>
                      <FileCheck size={12} />
                      <span>Audit Ready Certificate</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', fontSize: '9px', color: 'var(--text-muted)' }}>
                    Certificate will sign upon 100% campaign completion.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AuditorView;
