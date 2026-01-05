
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext.tsx';
import SplashScreen from './screens/SplashScreen.tsx';
import HomeScreen from './screens/HomeScreen.tsx';
import AddEditScreen from './screens/AddEditScreen.tsx';
import CompletedScreen from './screens/CompletedScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import Layout from './components/Layout.tsx';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <TaskProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/add" element={<AddEditScreen />} />
            <Route path="/edit/:id" element={<AddEditScreen />} />
            <Route path="/completed" element={<CompletedScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </TaskProvider>
  );
};

export default App;
