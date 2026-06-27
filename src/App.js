import React from 'react';
import { BuilderProvider, useBuilder } from './context/BuilderContext';
import Navbar from './components/ui/Navbar';
import ToastNotification from './components/ui/ToastNotification';
import HomeView from './components/dashboard/HomeView';
import SelectionView from './components/selection/SelectionView';
import BuilderView from './components/builder/BuilderView';
import DashboardView from './components/dashboard/DashboardView';
import './styles/globals.css';

/* ============================================================
   AppRouter — View switcher based on Context state
   No external router needed; state-driven navigation
   ============================================================ */
function AppRouter() {
  const { state } = useBuilder();
  const { activeView } = state.ui;

  const renderView = () => {
    switch (activeView) {
      case 'home':       return <HomeView />;
      case 'selection':  return <SelectionView />;
      case 'builder':    return <BuilderView />;
      case 'dashboard':  return <DashboardView />;
      default:           return <HomeView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        {renderView()}
      </div>
      <ToastNotification />
    </div>
  );
}

/* ============================================================
   App — Root component, wraps with context provider
   ============================================================ */
export default function App() {
  return (
    <BuilderProvider>
      <AppRouter />
    </BuilderProvider>
  );
}
