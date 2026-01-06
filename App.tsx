
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './screens/Dashboard';
import { Menu } from './screens/Menu';
import { FloorPlan } from './screens/FloorPlan';
import { Inventory } from './screens/Inventory';
import { Settings } from './screens/Settings';
import { Login } from './screens/Login';
import { Orders } from './screens/Orders';
import { View } from './types';
import { CurrencyProvider } from './CurrencyContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { supabase } from './supabase';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('login');
  const { brightness } = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleRedirectAfterLogin(session.user);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleRedirectAfterLogin(session.user);
      } else {
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRedirectAfterLogin = async (user: any) => {
    if (user.email === 'ducnt198x@gmail.com') {
      setCurrentView('dashboard');
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('floorplan');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'menu':
        return <Menu />;
      case 'floorplan':
        return <FloorPlan />;
      case 'orders':
         return <Orders />;
      case 'inventory':
        return <Inventory />;
      case 'settings':
        return <Settings onLogout={() => setCurrentView('login')} />;
      default:
        return <FloorPlan />;
    }
  };

  if (currentView === 'login') {
    return <Login onLogin={() => {}} />; // Redirection is handled by auth listener
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background text-text-main overflow-hidden relative">
      <div 
        className="fixed inset-0 z-[9999] bg-black pointer-events-none transition-opacity duration-300"
        style={{ opacity: (100 - brightness) / 100 }}
      />
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[70px] lg:pb-0 w-full transition-all duration-300">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
