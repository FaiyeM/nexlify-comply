import React, { createContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const AppContext = createContext();

const INITIAL_ACCOUNTS = [
  {
    id: "act-01",
    name: "jdoe",
    type: "Human user",
    hostSystem: "Active Directory",
    systemOwner: "Enterprise Directory Team",
    assignedOwner: "John Doe",
    lastLogin: "2026-06-25",
    passwordChanged: "2026-05-10",
    lastReviewDate: "2025-12-15",
    reviewer: "Alice Smith",
    privilegeLevel: "Standard user",
    mfaEnrolled: true,
    status: "Active",
    outsideProvisioning: false,
  },
  {
    id: "act-02",
    name: "admin-root",
    type: "admin / privileged",
    hostSystem: "Active Directory",
    systemOwner: "Enterprise Directory Team",
    assignedOwner: "Sarah Jenkins",
    lastLogin: "2026-06-26",
    passwordChanged: "2026-04-12",
    lastReviewDate: "2026-03-10",
    reviewer: "Director of Identity",
    privilegeLevel: "super-user/system administrator",
    mfaEnrolled: true,
    status: "Active",
    outsideProvisioning: false,
  },
  {
    id: "act-03",
    name: "service-invoice-bot",
    type: "service account",
    hostSystem: "ServiceNow",
    systemOwner: "Finance IT Team",
    assignedOwner: "None", // Flag: No Owner
    lastLogin: "2026-06-25",
    passwordChanged: "2025-06-20", // Flag: Password age exceeded
    lastReviewDate: "Never", // Flag: Never Reviewed
    reviewer: "None",
    privilegeLevel: "Standard user",
    mfaEnrolled: false, // Flag: MFA not enrolled
    status: "Active",
    outsideProvisioning: false,
  },
  {
    id: "act-04",
    name: "aws-infra-deployer",
    type: "machine identity",
    hostSystem: "AWS IAM",
    systemOwner: "Cloud Infrastructure Team",
    assignedOwner: "Mark Thompson", // departed
    lastLogin: "2026-06-20",
    passwordChanged: "2026-03-01",
    lastReviewDate: "2026-03-15",
    reviewer: "Cloud SecOps",
    privilegeLevel: "privileged/elevated",
    mfaEnrolled: true,
    status: "Orphaned", // Flag: Orphaned
    outsideProvisioning: false,
  },
  {
    id: "act-05",
    name: "okta-sync-token",
    type: "API token",
    hostSystem: "Okta",
    systemOwner: "Information Security Team",
    assignedOwner: "Sarah Jenkins",
    lastLogin: "2026-06-26",
    passwordChanged: "2026-05-18",
    lastReviewDate: "2025-11-20", // Flag: Review Overdue
    reviewer: "Alice Smith",
    privilegeLevel: "privileged/elevated",
    mfaEnrolled: true,
    status: "Active",
    outsideProvisioning: false,
  },
  {
    id: "act-06",
    name: "mcompliance-auditor",
    type: "Human user",
    hostSystem: "Microsoft Entra ID",
    systemOwner: "Information Security Team",
    assignedOwner: "Matthew Comply",
    lastLogin: "2026-02-14", // Flag: Dormant
    passwordChanged: "2026-01-10",
    lastReviewDate: "2026-03-01",
    reviewer: "Alice Smith",
    privilegeLevel: "Standard user",
    mfaEnrolled: true,
    status: "Dormant",
    outsideProvisioning: false,
  },
  {
    id: "act-07",
    name: "infra-firewall-ssh",
    type: "shared account",
    hostSystem: "Linux Servers",
    systemOwner: "Cloud Infrastructure Team",
    assignedOwner: "None", // Flag: No Owner
    lastLogin: "2026-05-20", // Flag: Dormant
    passwordChanged: "2025-08-12", // Flag: Password age exceeded
    lastReviewDate: "2025-09-10", // Flag: Review Overdue
    reviewer: "Cloud SecOps",
    privilegeLevel: "administrator",
    mfaEnrolled: false, // Flag: MFA not enrolled
    status: "Dormant",
    outsideProvisioning: false,
  },
  {
    id: "act-08",
    name: "jira-api-read-only",
    type: "API token",
    hostSystem: "Jira",
    systemOwner: "Finance IT Team",
    assignedOwner: "David Miller",
    lastLogin: "2026-06-25",
    passwordChanged: "2026-05-30",
    lastReviewDate: "2026-03-10",
    reviewer: "Finance Sec Lead",
    privilegeLevel: "Standard user",
    mfaEnrolled: false,
    status: "Active",
    outsideProvisioning: false,
  },
  {
    id: "act-10",
    name: "legacy-payroll-usr",
    type: "legacy system ID",
    hostSystem: "ServiceNow",
    systemOwner: "Finance IT Team",
    assignedOwner: "David Miller",
    lastLogin: "2026-06-01",
    passwordChanged: "2024-06-01", // Flag: Password age exceeded
    lastReviewDate: "Never", // Flag: Never Reviewed
    reviewer: "None",
    privilegeLevel: "Standard user",
    mfaEnrolled: false, // Flag: MFA not enrolled
    status: "Active",
    outsideProvisioning: false,
  }
];

const INITIAL_CAMPAIGNS = [
  {
    id: "camp-01",
    name: "Annual Full Account Review (FISMA AC-2)",
    type: "Annual Full Review",
    status: "Active",
    startDate: "2026-06-01",
    endDate: "2026-09-01",
    targetSystems: ["Active Directory", "Microsoft Entra ID", "ServiceNow", "Jira"],
    totalAccounts: 8,
    reviewedAccounts: 4,
    reviewerRoster: ["Sarah Jenkins", "David Miller", "Alice Smith"],
  },
  {
    id: "camp-02",
    name: "Q2 Privileged Account Review (NIST AC-2(j))",
    type: "Quarterly Privileged Account Review",
    status: "Active",
    startDate: "2026-06-15",
    endDate: "2026-07-15",
    targetSystems: ["AWS IAM", "Linux Servers", "CyberArk"],
    totalAccounts: 5,
    reviewedAccounts: 1,
    reviewerRoster: ["Sarah Jenkins", "Cloud SecOps", "Director of Identity"],
  }
];

const INITIAL_CONNECTORS = [
  { name: "Active Directory", type: "Native API", active: true, accountsCount: 2, lastPoll: "2026-06-26 04:00" },
  { name: "Microsoft Entra ID", type: "Native API", active: true, accountsCount: 1, lastPoll: "2026-06-26 04:05" },
  { name: "Okta", type: "Native API", active: true, accountsCount: 1, lastPoll: "2026-06-26 04:10" },
  { name: "AWS IAM", type: "Native API", active: true, accountsCount: 1, lastPoll: "2026-06-26 03:50" },
  { name: "CyberArk", type: "Native API", active: false, accountsCount: 0, lastPoll: "Never" },
  { name: "Linux Servers", type: "Log-Based", active: true, accountsCount: 1, lastPoll: "2026-06-26 03:00" },
  { name: "ServiceNow", type: "Native API", active: true, accountsCount: 2, lastPoll: "2026-06-26 04:15" },
  { name: "Jira", type: "Native API", active: true, accountsCount: 1, lastPoll: "2026-06-26 04:20" },
];

const RAW_MOCK_LOGS = [
  { timestamp: "04:20:15", system: "Linux Servers", type: "warning", message: "SSH Logon: Successful connection from user 'ssh-tunnel-bot' on IP 192.168.10.45. Key fingerprint parsed." },
  { timestamp: "04:20:45", system: "Active Directory", type: "info", message: "Windows Security Event ID 4624: Account 'jdoe' logged on successfully from workstation DESKTOP-481A." },
  { timestamp: "04:21:05", system: "Microsoft Entra ID", type: "info", message: "Azure AD Poll: Federated logon for 'sarah.jenkins@nexlify.gov' via Okta IDP. MFA verified." },
  { timestamp: "04:21:30", system: "AWS IAM", type: "danger", message: "API Call: UpdateAccessKey executed by role 'aws-infra-deployer' from unrecognized IP 203.0.113.12." },
  { timestamp: "04:22:00", system: "Active Directory", type: "warning", message: "Windows Security Event ID 4720: User Account Created: 'temp-consultant-acc'. Creator: 'admin-root'. Outside provisioning ticket." }
];

const INITIAL_AI_RECOMMENDATIONS = [
  {
    id: "rec-01",
    targetAccountId: "act-03",
    accountName: "service-invoice-bot",
    recommendedOwner: "David Miller",
    reason: "Logon activity correlates 94% with David Miller's Finance IT workspace IPs.",
    system: "ServiceNow"
  },
  {
    id: "rec-02",
    targetAccountId: "act-04",
    accountName: "aws-infra-deployer",
    recommendedOwner: "Sarah Jenkins",
    reason: "CloudTrail access signatures match Sarah Jenkins' active developer keys.",
    system: "AWS IAM"
  }
];

const INITIAL_PERIOD_CHANGES = {
  added: [],
  removed: ["legacy-db-user-old", "bot-oauth-expired"],
  modified: ["infra-firewall-ssh (Active ➜ Dormant)"]
};

// Check if Gemini API key is configured
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export const AppProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('nc_accounts_v2');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('nc_campaigns_v2');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [connectors, setConnectors] = useState(() => {
    const saved = localStorage.getItem('nc_connectors_v2');
    return saved ? JSON.parse(saved) : INITIAL_CONNECTORS;
  });

  const [aiRecommendations, setAiRecommendations] = useState(() => {
    const saved = localStorage.getItem('nc_ai_recs_v2');
    return saved ? JSON.parse(saved) : INITIAL_AI_RECOMMENDATIONS;
  });

  const [periodChanges, setPeriodChanges] = useState(() => {
    const saved = localStorage.getItem('nc_period_changes_v2');
    return saved ? JSON.parse(saved) : INITIAL_PERIOD_CHANGES;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('nc_audit_logs_v2');
    if (saved) return JSON.parse(saved);
    
    return [
      { id: "aud-01", timestamp: "2026-06-25 10:15:30", reviewer: "System Scheduler", action: "API connector Active Directory polled successfully", details: "Retrieved 2 account records. No changes.", system: "Active Directory", referenceControl: "NIST AC-2(a)" },
      { id: "aud-02", timestamp: "2026-06-25 14:30:10", reviewer: "Sarah Jenkins", action: "Reviewed Account 'admin-root'", details: "Validated account necessity. Justification: Core domain admin for internal directory synchronization.", system: "Active Directory", referenceControl: "NIST AC-2(j)" },
      { id: "aud-03", timestamp: "2026-06-26 01:10:45", reviewer: "System Scheduler", action: "Campaign Manager flagged campaign Quarterly Privileged Review progress", details: "Campaign progress currently at 20%. Roster notified.", system: "Campaign Manager", referenceControl: "NIST AU-12" }
    ];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nc_user_v2');
    return saved ? JSON.parse(saved) : { username: "sarah.jenkins@nexlify.gov", role: "ISSO", name: "Sarah Jenkins" };
  });

  const [simulatedLogs, setSimulatedLogs] = useState([
    { timestamp: "04:15:10", system: "Active Directory", type: "info", message: "Audit logging initialized. Watching Active Directory event log streams..." },
    { timestamp: "04:16:30", system: "AWS IAM", type: "info", message: "Listening for CloudTrail Event logs..." }
  ]);

  const [logIndex, setLogIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nc_accounts_v2', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('nc_campaigns_v2', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('nc_connectors_v2', JSON.stringify(connectors));
  }, [connectors]);

  useEffect(() => {
    localStorage.setItem('nc_ai_recs_v2', JSON.stringify(aiRecommendations));
  }, [aiRecommendations]);

  useEffect(() => {
    localStorage.setItem('nc_period_changes_v2', JSON.stringify(periodChanges));
  }, [periodChanges]);

  useEffect(() => {
    localStorage.setItem('nc_audit_logs_v2', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('nc_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  // Auth Functions
  const login = (username, role) => {
    const nameMap = {
      "CISO": "CISO Exec (David)",
      "ISSO": "Sarah Jenkins",
      "Auditor": "Matthew Comply",
      "System Owner": "David Miller"
    };
    const user = { username, role, name: nameMap[role] || "System User" };
    setCurrentUser(user);
    logAuditEvent(user.name, `User logged in with role: ${role}`, `Session established securely. Client IP: 10.0.8.140`, "Auth", "NIST AC-2(g)");
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent(currentUser.name, `User logged out`, `Session terminated.`, "Auth", "NIST AC-2(g)");
    }
    setCurrentUser(null);
  };

  const switchRole = (role) => {
    const nameMap = {
      "CISO": "CISO Exec (David)",
      "ISSO": "Sarah Jenkins",
      "Auditor": "Matthew Comply",
      "System Owner": "David Miller"
    };
    const updated = { ...currentUser, role, name: nameMap[role] || "System User" };
    setCurrentUser(updated);
    logAuditEvent(updated.name, `Switched dashboard perspective`, `Active role set to ${role}. Filtered system privileges.`, "Auth", "NIST AC-2(a)");
  };

  const logAuditEvent = (reviewer, action, details, system, referenceControl) => {
    const newLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewer,
      action,
      details,
      system,
      referenceControl,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Policy-based flags checker
  const computeFlags = (account) => {
    const flags = [];
    if (!account.assignedOwner || account.assignedOwner === "None") {
      flags.push({ type: "noOwner", label: "No Assigned Owner", severity: "danger" });
    }
    const today = new Date("2026-06-26"); 
    const loginDate = new Date(account.lastLogin);
    const diffDays = Math.floor((today - loginDate) / (1000 * 60 * 60 * 24));
    
    const isAdmin = account.type.toLowerCase().includes("admin") || account.type.toLowerCase().includes("privileged") || account.privilegeLevel.toLowerCase().includes("admin") || account.privilegeLevel.toLowerCase().includes("super-user");
    if (isAdmin && diffDays > 30) {
      flags.push({ type: "dormant", label: `Dormant (>30d: ${diffDays}d)`, severity: "warning" });
    } else if (!isAdmin && diffDays > 90) {
      flags.push({ type: "dormant", label: `Dormant (>90d: ${diffDays}d)`, severity: "warning" });
    }
    
    const pwdDate = new Date(account.passwordChanged);
    const pwdDiffDays = Math.floor((today - pwdDate) / (1000 * 60 * 60 * 24));
    if (pwdDiffDays > 90) {
      flags.push({ type: "passwordAgeExceeded", label: `Password Expired (${pwdDiffDays}d)`, severity: "warning" });
    }
    if (account.lastReviewDate === "Never") {
      flags.push({ type: "neverReviewed", label: "Never Reviewed", severity: "warning" });
    }
    if (account.lastReviewDate !== "Never") {
      const reviewDate = new Date(account.lastReviewDate);
      const revDiffDays = Math.floor((today - reviewDate) / (1000 * 60 * 60 * 24));
      if (revDiffDays > 180) {
        flags.push({ type: "reviewOverdue", label: `Review Overdue (${revDiffDays}d)`, severity: "danger" });
      }
    }
    if (account.assignedOwner === "Mark Thompson") {
      flags.push({ type: "orphaned", label: "Orphaned (Owner Departed)", severity: "danger" });
    }
    if (!account.mfaEnrolled) {
      flags.push({ type: "mfaNotEnrolled", label: "MFA Not Enrolled", severity: "danger" });
    }
    if (account.outsideProvisioning) {
      flags.push({ type: "outsideProvisioning", label: "Created Outside Workflow", severity: "warning" });
    }
    return flags;
  };

  // Ownership Assigner Action
  const assignOwner = (accountId, ownerName) => {
    setAccounts(prevAccounts => 
      prevAccounts.map(acc => {
        if (acc.id === accountId) {
          const prevStatus = acc.status;
          const updatedStatus = prevStatus === "Orphaned" ? "Active" : prevStatus;
          
          logAuditEvent(
            currentUser.name, 
            `Assigned Ownership: account '${acc.name}' mapped to ${ownerName}`,
            `Prior Owner: ${acc.assignedOwner}. Target system: ${acc.hostSystem}. Resolved orphan/unassigned flags.`,
            acc.hostSystem,
            "NIST AC-2(d)"
          );
          
          return {
            ...acc,
            assignedOwner: ownerName,
            status: updatedStatus
          };
        }
        return acc;
      })
    );
  };

  // Active Remediation action (Govern Stage)
  const remediateAccount = (accountId) => {
    setAccounts(prevAccounts => 
      prevAccounts.map(acc => {
        if (acc.id === accountId) {
          logAuditEvent(
            currentUser.name,
            `Active Governance: Disabled account '${acc.name}'`,
            `Triggered simulated remediation API lockout call on target ${acc.hostSystem}. Revoked system privileges.`,
            acc.hostSystem,
            "NIST AC-2(a)"
          );

          setPeriodChanges(prev => ({
            ...prev,
            modified: [...prev.modified.filter(m => !m.startsWith(acc.name)), `${acc.name} (Active ➜ Revoked)`]
          }));

          return {
            ...acc,
            status: "Revoked"
          };
        }
        return acc;
      })
    );
  };

  // Resolve AI Copilot suggestion
  const acceptAiRecommendation = (recId) => {
    const rec = aiRecommendations.find(r => r.id === recId);
    if (!rec) return;

    assignOwner(rec.targetAccountId, rec.recommendedOwner);
    
    logAuditEvent(
      "AI Copilot reconciliation", 
      `Accepted AI ownership recommendation for ${rec.accountName}`, 
      `AI mapping heuristics applied. User ${rec.recommendedOwner} registered as owner.`, 
      rec.system, 
      "NIST AC-2(d)"
    );

    setAiRecommendations(prev => prev.filter(r => r.id !== recId));
  };

  // Live AI Studio Reconciliation Audit (Google AI SDK calls)
  const runLiveAiAudit = async () => {
    if (!genAI) {
      // Sandbox fallback if no key configured
      setIsAiLoading(true);
      setTimeout(() => {
        setIsAiLoading(false);
        setAiRecommendations(INITIAL_AI_RECOMMENDATIONS);
        logAuditEvent("Google AI Studio", "Analyzed Identity Catalog (Sandbox)", "No Google AI Studio key found in .env. Loaded local mock correlation heuristics.", "Gemini Engine", "NIST AC-2(d)");
      }, 1500);
      return;
    }

    setIsAiLoading(true);
    logAuditEvent(currentUser.name, "Initiated live Google AI Studio Audit", "Sending unassigned/orphaned accounts catalog to Gemini model...", "Gemini Engine", "NIST AC-2(d)");

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      // Filter down to accounts needing owner assignments
      const unassignedAccounts = accounts.filter(a => a.assignedOwner === "None" || a.status === "Orphaned" || a.assignedOwner === "Mark Thompson");
      
      const prompt = `
        You are Nexlify Comply AI Reconciliation Assistant. 
        Analyze this list of unassigned or orphaned account records:
        ${JSON.stringify(unassignedAccounts)}

        Recommend a human owner from this active roster:
        Active Staff Roster: Sarah Jenkins, David Miller, John Doe, Matthew Comply, Alice Smith.

        Apply these correlation heuristics:
        1. If the account system is ServiceNow, finance systems, or logs correlate to financial IPs, recommend David Miller (Finance IT Team).
        2. If the system is AWS IAM or Cloud Infrastructure, recommend Sarah Jenkins or Alice Smith (Directory/SecOps).
        3. If the account UPN name overlaps with a user name (like jdoe), match John Doe.
        4. If the owner was Mark Thompson (departed), recommend Sarah Jenkins as the active backup supervisor.

        Format your output strictly as a JSON array of recommendation objects:
        [
          {
            "id": "rec-generated-uuid",
            "targetAccountId": "account_id_from_data",
            "accountName": "account_name_from_data",
            "recommendedOwner": "Recommended Human Name from roster",
            "reason": "Detailed justification explaining the heuristic used",
            "system": "hostSystem_from_data"
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const parsedRecommendations = JSON.parse(result.response.text());
      
      setAiRecommendations(parsedRecommendations);
      logAuditEvent(
        "Google AI Studio", 
        "Live Identity Reconciliation Audit complete", 
        `Gemini analyzed ${unassignedAccounts.length} accounts. Returned ${parsedRecommendations.length} recommendations.`, 
        "Gemini Engine", 
        "NIST AC-2(d)"
      );

    } catch (error) {
      console.error("Gemini Audit failed:", error);
      logAuditEvent("Google AI Studio", "AI Audit Failed", `Error calling generative-ai: ${error.message}. Reverting to local simulation.`, "Gemini Engine", "NIST AC-2(d)");
      setAiRecommendations(INITIAL_AI_RECOMMENDATIONS);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Review an Account
  const reviewAccount = (accountId, campaignId, decision, justification) => {
    const reviewerName = currentUser.name;
    const todayStr = "2026-06-26";
    
    setAccounts(prevAccounts => 
      prevAccounts.map(acc => {
        if (acc.id === accountId) {
          const updatedStatus = decision === "revoke" ? "Revoked" : acc.status;
          
          if (decision === "revoke") {
            setPeriodChanges(prev => ({
              ...prev,
              modified: [...prev.modified.filter(m => !m.startsWith(acc.name)), `${acc.name} (Active ➜ Revoked)`]
            }));
          }

          return {
            ...acc,
            lastReviewDate: todayStr,
            reviewer: reviewerName,
            status: updatedStatus,
          };
        }
        return acc;
      })
    );

    setCampaigns(prevCampaigns => 
      prevCampaigns.map(camp => {
        if (camp.id === campaignId) {
          return {
            ...camp,
            reviewedAccounts: Math.min(camp.reviewedAccounts + 1, camp.totalAccounts)
          };
        }
        return camp;
      })
    );

    const targetAccount = accounts.find(a => a.id === accountId);
    logAuditEvent(
      reviewerName, 
      `Reviewed account '${targetAccount.name}' during Campaign`, 
      `Decision: ${decision.toUpperCase()}. Justification: ${justification || "Validated continuation of business requirement"}. Host System: ${targetAccount.hostSystem}.`,
      targetAccount.hostSystem,
      "NIST AC-2(j)"
    );
  };

  // Toggle API Connector
  const toggleConnector = (connectorName) => {
    setConnectors(prevConnectors => 
      prevConnectors.map(conn => {
        if (conn.name === connectorName) {
          const newActive = !conn.active;
          const pollTime = newActive ? "2026-06-26 04:22" : conn.lastPoll;
          
          if (newActive) {
            setIsSyncing(true);
            setTimeout(() => {
              setIsSyncing(false);
              logAuditEvent("System Sync", `API Connector ${connectorName} synchronized successfully`, `Pulled fresh identities. State: Connected.`, connectorName, "NIST AC-2(a)");
              
              if (connectorName === "CyberArk") {
                setAccounts(prev => {
                  const exists = prev.some(a => a.name === "cyberark-vault-admin");
                  if (exists) return prev;
                  return [...prev, {
                    id: "act-09",
                    name: "cyberark-vault-admin",
                    type: "admin / privileged",
                    hostSystem: "CyberArk",
                    systemOwner: "Information Security Team",
                    assignedOwner: "Sarah Jenkins",
                    lastLogin: "2026-06-26",
                    passwordChanged: "2026-05-25",
                    lastReviewDate: "2026-03-10",
                    reviewer: "Director of Identity",
                    privilegeLevel: "super-user/system administrator",
                    mfaEnrolled: true,
                    status: "Active",
                    outsideProvisioning: false,
                  }];
                });
                
                setPeriodChanges(prev => ({
                  ...prev,
                  added: Array.from(new Set([...prev.added, "cyberark-vault-admin"]))
                }));
              }
            }, 1000);
          } else {
            logAuditEvent("System Config", `Disabled API Connector ${connectorName}`, `Integration disabled by analyst.`, connectorName, "NIST AC-2(a)");
          }

          return {
            ...conn,
            active: newActive,
            lastPoll: pollTime,
          };
        }
        return conn;
      })
    );
  };

  // Launch a new Campaign
  const launchCampaign = (campaignName, type, targetSystems, deadlineDays) => {
    const today = new Date("2026-06-26");
    const end = new Date("2026-06-26");
    end.setDate(end.getDate() + parseInt(deadlineDays));
    
    const formattedStart = today.toISOString().substring(0, 10);
    const formattedEnd = end.toISOString().substring(0, 10);
    
    const accountsInScope = accounts.filter(acc => targetSystems.includes(acc.hostSystem)).length;

    const newCamp = {
      id: `camp-${Date.now()}`,
      name: campaignName,
      type,
      status: "Active",
      startDate: formattedStart,
      endDate: formattedEnd,
      targetSystems,
      totalAccounts: accountsInScope || 3,
      reviewedAccounts: 0,
      reviewerRoster: [currentUser.name, "Alice Smith"],
    };

    setCampaigns(prev => [...prev, newCamp]);
    logAuditEvent(currentUser.name, `Launched Campaign: ${campaignName}`, `Campaign scoped to systems: ${targetSystems.join(', ')}. Target total accounts: ${newCamp.totalAccounts}. Deadline: ${formattedEnd}.`, "Campaign Manager", "NIST AC-2(j)");
  };

  // Ingest File upload
  const parseUploadedCSV = (fileContent, fileName) => {
    logAuditEvent(currentUser.name, `File upload initiated: ${fileName}`, `Parsing CSV file entries...`, "File Ingestion", "NIST AC-2(a)");
    
    try {
      const lines = fileContent.split('\n').filter(l => l.trim() !== "");
      if (lines.length <= 1) throw new Error("Empty file or missing headers");

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newDiscoveredAccounts = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;
        
        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index];
        });
        
        const name = record.username || record.name || record.account_id || `user-${i}`;
        const type = record.type || "Human user";
        const hostSystem = record.system || record.host_system || "Manual Upload";
        const systemOwner = record.system_owner || "Enterprise Operations Team";
        const assignedOwner = record.owner || record.assigned_owner || "None";
        const lastLogin = record.last_login || record.last_login_date || "2026-06-20";
        const passwordChanged = record.password_changed || record.password_last_set || "2026-04-01";
        const privilegeLevel = record.privilege || record.privilege_level || "Standard user";
        const mfaEnrolled = record.mfa === "true" || record.mfa_enrolled === "true" || record.mfa === "1" || false;

        newDiscoveredAccounts.push({
          id: `act-discovered-${Date.now()}-${i}`,
          name,
          type,
          hostSystem,
          systemOwner,
          assignedOwner,
          lastLogin,
          passwordChanged,
          lastReviewDate: "Never",
          reviewer: "None",
          privilegeLevel,
          mfaEnrolled,
          status: "Active",
          outsideProvisioning: false,
        });
      }

      if (newDiscoveredAccounts.length === 0) {
        throw new Error("No valid accounts parsed");
      }

      setAccounts(prev => {
        const filtered = prev.filter(p => 
          !newDiscoveredAccounts.some(n => n.name === p.name && n.hostSystem === p.hostSystem)
        );
        return [...filtered, ...newDiscoveredAccounts];
      });

      setPeriodChanges(prev => ({
        ...prev,
        added: Array.from(new Set([...prev.added, ...newDiscoveredAccounts.map(a => a.name)]))
      }));

      logAuditEvent(
        "System Ingestion", 
        `Successfully ingested ${newDiscoveredAccounts.length} accounts from CSV`, 
        `File: ${fileName}. Normalized and reconciled with unified inventory.`,
        "File Ingestion",
        "NIST AC-2(a)"
      );

      return { success: true, count: newDiscoveredAccounts.length };

    } catch (err) {
      logAuditEvent("System Ingestion", `File ingestion failed`, `Error: ${err.message}`, "File Ingestion", "NIST AC-2(a)");
      return { success: false, error: err.message };
    }
  };

  // Inject a simulated SIEM Log line
  const triggerNextSiemLog = () => {
    if (logIndex >= RAW_MOCK_LOGS.length) {
      setSimulatedLogs(prev => [
        ...prev,
        { timestamp: "04:23:10", system: "SIEM", type: "info", message: "All mock logs stream consumed. Loop resetting." }
      ]);
      setLogIndex(0);
      return;
    }

    const log = RAW_MOCK_LOGS[logIndex];
    setSimulatedLogs(prev => [...prev, log]);
    setLogIndex(prev => prev + 1);

    logAuditEvent("SIEM Feed", `Log Ingestion Event detected`, `System: ${log.system}. Message: ${log.message}`, "SIEM", "NIST AU-12");

    if (log.message.includes("Event ID 4720") || log.message.includes("User Account Created")) {
      setTimeout(() => {
        setAccounts(prev => {
          const exists = prev.some(a => a.name === "temp-consultant-acc");
          if (exists) return prev;
          
          logAuditEvent(
            "AI Log Analyzer", 
            `Discovered unprovisioned account: 'temp-consultant-acc'`, 
            `Extracted from AD logs (Event ID 4720). Triggers warning: outside normal provisioning workflow.`, 
            "Active Directory", 
            "NIST AC-2(d)"
          );
          
          return [
            ...prev,
            {
              id: "act-11",
              name: "temp-consultant-acc",
              type: "Human user",
              hostSystem: "Active Directory",
              systemOwner: "Enterprise Directory Team",
              assignedOwner: "None",
              lastLogin: "2026-06-26",
              passwordChanged: "2026-06-26",
              lastReviewDate: "Never",
              reviewer: "None",
              privilegeLevel: "Standard user",
              mfaEnrolled: false,
              status: "Flagged for Review",
              outsideProvisioning: true,
            }
          ];
        });

        setPeriodChanges(prev => ({
          ...prev,
          added: Array.from(new Set([...prev.added, "temp-consultant-acc"]))
        }));
      }, 800);
    }
  };

  // Reset the Database
  const resetDatabase = () => {
    localStorage.removeItem('nc_accounts_v2');
    localStorage.removeItem('nc_campaigns_v2');
    localStorage.removeItem('nc_connectors_v2');
    localStorage.removeItem('nc_ai_recs_v2');
    localStorage.removeItem('nc_period_changes_v2');
    localStorage.removeItem('nc_audit_logs_v2');
    localStorage.removeItem('nc_user_v2');
    
    setAccounts(INITIAL_ACCOUNTS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setConnectors(INITIAL_CONNECTORS);
    setAiRecommendations(INITIAL_AI_RECOMMENDATIONS);
    setPeriodChanges(INITIAL_PERIOD_CHANGES);
    setAuditLogs([
      { id: "aud-01", timestamp: "2026-06-26 04:00:00", reviewer: "System Recovery", action: "Database re-initialized to factory compliance baseline", details: "All mock accounts, review records, and audit events restored.", system: "System Manager", referenceControl: "NIST AU-2" }
    ]);
    setCurrentUser({ username: "sarah.jenkins@nexlify.gov", role: "ISSO", name: "Sarah Jenkins" });
    setSimulatedLogs([
      { timestamp: "04:15:10", system: "Active Directory", type: "info", message: "Audit logging initialized. Watching Active Directory event log streams..." },
      { timestamp: "04:16:30", system: "AWS IAM", type: "info", message: "Listening for CloudTrail Event logs..." }
    ]);
    setLogIndex(0);
    
    logAuditEvent("System Recovery", "Database Re-seeded", "Reseeded accounts list and mock integrations.", "System Manager", "NIST AU-2");
  };

  return (
    <AppContext.Provider value={{
      accounts,
      campaigns,
      connectors,
      auditLogs,
      currentUser,
      simulatedLogs,
      isSyncing,
      aiRecommendations,
      periodChanges,
      isAiLoading,
      isGeminiActive: !!genAI,
      login,
      logout,
      switchRole,
      computeFlags,
      reviewAccount,
      toggleConnector,
      launchCampaign,
      parseUploadedCSV,
      triggerNextSiemLog,
      resetDatabase,
      assignOwner,
      remediateAccount,
      acceptAiRecommendation,
      runLiveAiAudit
    }}>
      {children}
    </AppContext.Provider>
  );
};
