import { LOGIN_PATH } from "../components/common/configuration/constants/Paths";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import UserDashboard from "../pages/user/UserDashboard";





const ProtectedRoutes = () => (
    <Routes>
        <Route path="/" element={<Navigate to={LOGIN_PATH} replace />} /> { }
        <Route
            path={`${ADMIN_DASH_PATH}/*`}
            element={
                <ProtectedRoute roles={['ROLE_ADMIN']}>
                    <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path={USER_MANAGEMENT_PATH} element={<UserManagement />} />
                    </Routes>
                </ProtectedRoute>
            }
        />
        <Route
            path={`${CLIENT_DASH_PATH}/*`}
            element={
                <ProtectedRoute roles={['ROLE_USER']}>
                    <Routes>
                        <Route path="/" element={<UserDashboard />} />
                        
                    </Routes>
                </ProtectedRoute>
            }
        />
        
    </Routes>
);

export default ProtectedRoutes;