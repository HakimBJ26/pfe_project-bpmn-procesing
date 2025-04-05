import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import UserManagement from './pages/admin/UserManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Import des pages BPMN
import DmnModeler from './components/bpmn/DmnModeler';
import BpmnModeler from './components/bpmn/BpmnModeler';
import StartProcessPage from './components/process/StartProcessPage';
// Import des composants de gestion des tâches
import TaskList from './components/tasks/TaskList';
import TaskForm from './components/tasks/TaskForm';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['ROLE_ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={['ROLE_ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Routes BPMN */}

                <Route
                  path="/process/start"
                  element={
                    <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                      <StartProcessPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dmn-modeler"
                  element={
                    <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                      <DmnModeler />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/bpmn-modeler"
                  element={
                    <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                      <BpmnModeler />
                    </ProtectedRoute>
                  }
                />

                {/* Routes de gestion des tâches */}
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                      <TaskList />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/tasks/:taskId"
                  element={
                    <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                      <TaskForm />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/tasks/:taskId/complete"
                  element={
                    <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                      <TaskForm />
                    </ProtectedRoute>
                  }
                />

                {/* Routes Utilisateur */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute roles={['ROLE_USER', 'ROLE_ADMIN']}>
                      {({ user }) =>
                        user.role === 'ROLE_ADMIN' ? <Navigate to="/admin" /> : <UserDashboard />
                      }
                    </ProtectedRoute>
                  }
                />

                {/* Route par défaut */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </Layout>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
