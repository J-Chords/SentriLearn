// =============================================
// APP ROOT - ROUTER CONFIGURATION
// =============================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Layout } from './components/layout/Layout.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Training from './pages/Training.jsx';
import TrainingModule from './pages/TrainingModule.jsx';
import Assessments from './pages/Assessments.jsx';
import AssessmentRunner from './pages/AssessmentRunner.jsx';
import Simulation from './pages/Simulation.jsx';
import Campaigns from './pages/Campaigns.jsx';
import Report from './pages/Report.jsx';
import Progress from './pages/Progress.jsx';
import Admin from './pages/Admin.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/training" element={<RequireAuth><Training /></RequireAuth>} />
      <Route path="/training/:moduleId" element={<RequireAuth><TrainingModule /></RequireAuth>} />
      <Route path="/assessments" element={<RequireAuth><Assessments /></RequireAuth>} />
      <Route path="/assessments/:assessmentId" element={<RequireAuth><AssessmentRunner /></RequireAuth>} />
      <Route path="/simulation" element={<RequireAuth><Simulation /></RequireAuth>} />
      <Route path="/campaigns" element={<RequireAuth><Campaigns /></RequireAuth>} />
      <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
      <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgb(var(--color-surface-raised))',
                color: 'rgb(var(--color-tx-primary))',
                border: '1px solid rgb(var(--color-surface-border))',
                fontSize: '13px',
                fontFamily: 'Inter, system-ui, sans-serif',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
              success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
