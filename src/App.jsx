import React, { useState } from 'react';
import { useFishingApp } from './hooks/useFishingApp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateSession from './components/CreateSession';
import ActiveSession from './components/ActiveSession';
import Checkout from './components/Checkout';

function App() {
  const appState = useFishingApp();
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, create, active, checkout
  const [activeSessionId, setActiveSessionId] = useState(null);

  if (!appState.user) {
    return <Login onLogin={appState.login} />;
  }

  const navigateTo = (view, sessionId = null) => {
    setActiveSessionId(sessionId);
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      {currentView === 'dashboard' && (
        <Dashboard 
          appState={appState} 
          onNavigate={navigateTo} 
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
