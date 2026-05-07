import React, { useState } from 'react';
import { useFishingApp } from './hooks/useFishingApp';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CreateSession from './components/CreateSession';
import ActiveSession from './components/ActiveSession';
import Checkout from './components/Checkout';
import { Toaster } from 'react-hot-toast';

function App() {
  const appState = useFishingApp();
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  if (!appState.user) {
    if (showLogin) return <Login onLogin={appState.login} />;
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  const navigateTo = (view, sessionId = null) => {
    setActiveSessionId(sessionId);
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontSize: '0.9rem', borderRadius: '12px' } }} />
      {currentView === 'dashboard' && (
        <Dashboard 
          appState={appState} 
          onNavigate={navigateTo} 
        />
      )}
      {(currentView === 'reports' || currentView === 'catalog' || currentView === 'customers' || currentView === 'settings' || currentView === 'active_list') && (
        <Dashboard 
          appState={appState} 
          onNavigate={navigateTo} 
          initialTab={currentView === 'active_list' ? 'sessions' : currentView}
        />
      )}
      {currentView === 'create' && (
        <CreateSession 
          appState={appState} 
          onNavigate={navigateTo} 
        />
      )}
      {currentView === 'active' && activeSessionId && (
        <ActiveSession 
          session={appState.sessions.find(s => s.id === activeSessionId)}
          appState={appState} 
          onNavigate={navigateTo} 
        />
      )}
      {currentView === 'checkout' && activeSessionId && (
        <Checkout 
          session={appState.sessions.find(s => s.id === activeSessionId)}
          appState={appState} 
          onNavigate={navigateTo} 
        />
      )}
    </div>
  );
}

export default App;
