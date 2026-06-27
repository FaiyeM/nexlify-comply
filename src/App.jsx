import React, { useState, useContext } from 'react';
import { AppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './views/Login';
import CisoDashboard from './views/CisoDashboard';
import IssoView from './views/IssoView';
import ReviewerView from './views/ReviewerView';
import AuditorView from './views/AuditorView';

function AppContent() {
  const { currentUser } = useContext(AppContext);
  const [activePage, setActivePage] = useState('ciso');

  // If no user is logged in, show the Login screen
  if (!currentUser) {
    return <Login />;
  }

  // Page titles dictionary for Header display
  const pageTitles = {
    'ciso': 'Executive Dashboard & Compliance Overview',
    'inventory': 'Normalized System Account Inventory',
    'integrations': 'Integrations & Live Log Discovery',
    'reviewer': 'System Owner Campaign Reviews',
    'auditor': 'Compliance Auditor Evidence & Certificates'
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'ciso':
        return <CisoDashboard />;
      case 'inventory':
        return <IssoView defaultTab="inventory" />;
      case 'integrations':
        return <IssoView defaultTab="ingestion" />;
      case 'reviewer':
        return <ReviewerView />;
      case 'auditor':
        return <AuditorView />;
      default:
        return <CisoDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content">
        <Header activePageTitle={pageTitles[activePage] || 'Nexlify Comply'} />
        <main style={{ marginTop: '24px' }}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
