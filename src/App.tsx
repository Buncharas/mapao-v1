/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { DashboardScreen } from './pages/DashboardScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { CreateEventScreen } from './pages/CreateEventScreen';
import { EventDetailScreen } from './pages/EventDetailScreen';
import { AlertsScreen } from './pages/AlertsScreen';
import { AppProvider, useApp } from './context/AppContext';

function AppRoutes() {
  const { isAuthenticated } = useApp();

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <WelcomeScreen />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <DashboardScreen /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfileScreen /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/create" 
          element={isAuthenticated ? <CreateEventScreen /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/event-detail" 
          element={isAuthenticated ? <EventDetailScreen /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/event-detail/:id" 
          element={isAuthenticated ? <EventDetailScreen /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/alerts" 
          element={isAuthenticated ? <AlertsScreen /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
