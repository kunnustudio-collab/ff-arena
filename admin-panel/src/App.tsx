import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Tournaments } from './pages/Tournaments';
import { Users } from './pages/Users';
import { KYCQueue } from './pages/KYCQueue';
import { Withdrawals } from './pages/Withdrawals';
import { AntiFraud } from './pages/AntiFraud';
import { Disputes } from './pages/Disputes';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { AdminApi } from './services/api';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for instant demo access
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const handleLogout = () => {
    AdminApi.clearToken();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex bg-background min-h-screen text-gray-100 font-sans">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar currentTab={currentTab} />

        <main className="p-8 flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && <Dashboard />}
          {currentTab === 'tournaments' && <Tournaments />}
          {currentTab === 'users' && <Users />}
          {currentTab === 'kyc' && <KYCQueue />}
          {currentTab === 'withdrawals' && <Withdrawals />}
          {currentTab === 'antifraud' && <AntiFraud />}
          {currentTab === 'disputes' && <Disputes />}
          {currentTab === 'audit' && <AuditLogs />}
          {currentTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default App;
