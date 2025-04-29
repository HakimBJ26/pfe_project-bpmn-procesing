import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';

// Workflow Pages
import WorkflowList from '../pages/workflow/WorkflowList';
import WorkflowEditor from '../pages/workflow/WorkflowEditor';

// DMN Pages
import DmnList from '../pages/dmn/DmnList';
import DmnEditor from '../pages/dmn/DmnEditor';

// Form Pages
import FormList from '../pages/forms/FormList';
import FormEditor from '../pages/forms/FormEditor';

// Error Pages
import NotFound from '../pages/error/NotFound';

// Authentification
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

const AppRouter = () => {
  // Vérifier si l'utilisateur est authentifié (à adapter selon votre système d'authentification)
  const isAuthenticated = true; // Temporairement toujours true pour le développement

  // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de connexion
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Routes pour les workflows */}
          <Route path="workflows" element={<WorkflowList />} />
          <Route path="workflows/new" element={<WorkflowEditor />} />
          <Route path="workflows/edit/:id" element={<WorkflowEditor />} />
          <Route path="workflows/view/:id" element={<WorkflowEditor />} />
          
          {/* Routes pour les DMN */}
          <Route path="dmn" element={<DmnList />} />
          <Route path="dmn/new" element={<DmnEditor />} />
          <Route path="dmn/edit/:id" element={<DmnEditor />} />
          <Route path="dmn/view/:id" element={<DmnEditor />} />
          
          {/* Routes pour les formulaires */}
          <Route path="forms" element={<FormList />} />
          <Route path="forms/new" element={<FormEditor />} />
          <Route path="forms/edit/:formKey" element={<FormEditor />} />
          <Route path="forms/view/:formKey" element={<FormEditor />} />
          
          {/* Page d'erreur 404 à l'intérieur du layout */}
          <Route path="404" element={<NotFound />} />
          
          {/* Redirection pour les routes non reconnues */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
        
        {/* Routes en dehors du layout principal */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 