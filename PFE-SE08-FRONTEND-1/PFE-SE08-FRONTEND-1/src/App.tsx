import { Navigate, useLocation, useRoutes } from "react-router-dom";
import BpmnModelerContainer from "./views/bpmn-modeler/modeler";
import { NotFoundPage } from "./components/404-page";
import Layout from "./views/layout";
import FormBuilder from "./views/form-builder/form-builder";
import DmnBuilder from "./views/dmn-builder/dmn-builder";
import Task from "./views/task/task";
import { useAuthStore } from "./stores/auth.store";
import DashboardPage from "./components/dashboard/page";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import TaskPage from "./views/tasks/page";
import ProcessPage from "./views/processes/page";
import WorkflowPage from "./views/workflows/page";
import WorkflowBuilderContainer from "./views/workflow-builder/modeler";
import WorkflowConfig from "./views/workflows/config/WorkflowConfig";
import FormsPage from "./views/forms/page";
import DmnsPage from "./views/dmns/page";
import AdminPage from "./views/admin/page";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If not authenticated and trying to access a protected route, redirect to login
  if (
    !isAuthenticated &&
    !["/register", "/login"].includes(location.pathname)
  ) {
    // Save the attempted URL for redirecting after successful login
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/login" />;
  }

  // If authenticated and trying to access login page, redirect to home or saved redirect URL
  if (isAuthenticated && ["/login", "/register"].includes(location.pathname)) {
    const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';
    sessionStorage.removeItem('redirectUrl'); // Clear the stored URL
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{children}</>;
};

function App() {
  const routes = useRoutes([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <DashboardPage />,
        },
        {
          path: "/tasks",
          element: <TaskPage />,
        },
        {
          path: "task/:taskId",
          element: <Task />,
        },
        {
          path: "processes",
          element: <ProcessPage />,
        },
        {
          path: "workflows",
          element: <WorkflowPage />,
        },
        {
          path: "forms",
          element: <FormsPage />,
        },
        {
          path: "dmns",
          element: <DmnsPage />,
        },
        {
          path: "workflow/:workflowId/config",
          element: <WorkflowConfig />,
        },
        {
          path: "/form-builder",
          element: <FormBuilder />,
        },
        {
          path: "/form-builder/:formKey",
          element: <FormBuilder />,
        },
        {
          path: "/dmn-builder",
          element: <DmnBuilder />,
        },
        {
          path: "/dmn-builder/:dmnId",
          element: <DmnBuilder />,
        },
        {
          path: "/workflow-builder",
          element: <WorkflowBuilderContainer />,
        },
        {
          path: "/process-builder",
          element: <BpmnModelerContainer />,
        },
        {
          path: "/admin",
          element: <AdminPage />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginForm />,
    },
    {
      path: "/register",
      element: <RegisterForm />,
    },
    {
      path: "/*",
      element: <NotFoundPage />,
    },
  ]);
  return <ProtectedRoute>{routes}</ProtectedRoute>;
}

export default App;
