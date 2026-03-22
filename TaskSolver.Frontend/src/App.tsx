import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { OAuthSuccessHandler } from './components/Auth/OAuthSuccessHandler';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import AuthForms from './components/Auth/AuthForms';
import { ProfileView } from './components/Profile/ProfileView';
import { ProfileSettings } from './components/Profile/ProfileSettings';
import { ProgrammingLanguagesAdmin } from './components/admin/ProgrammingLanguagesAdmin';
import { ProgrammingTasksAdmin } from './components/admin/ProgrammingTasksAdmin';
import { TaskCatalog } from './components/Tasks/TaskCatalog';
import { TaskPage } from './components/Tasks/TaskPage';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { MatchPage } from './components/Matchmaking/MatchPage';
import UsersAdmin from './components/admin/UsersAdmin';
import StatisticsAdmin from './components/admin/StatisticsAdmin';
import ServerMonitoring from './components/admin/ServerMonitoring';
import LogsViewer from './components/admin/LogsViewer';
import ConstructorPage from './components/Constructor/ConstructorPage';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkAdmin } = useAuth();

  if (!checkAdmin()) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path='/auth'
        element={
          <AuthForms onSuccess={() => navigate('/', { replace: true })} />
        }
      />
      <Route path='/auth/success' element={<OAuthSuccessHandler />} />
      {isAuthenticated && isAdmin && (
        <>
          <Route
            path='/admin/languages'
            element={
              <AdminRoute>
                <Layout>
                  <ProgrammingLanguagesAdmin />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path='/admin/tasks'
            element={
              <AdminRoute>
                <Layout>
                  <ProgrammingTasksAdmin />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path='/admin/users'
            element={
              <AdminRoute>
                <Layout>
                  <UsersAdmin />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path='/admin/statistics'
            element={
              <AdminRoute>
                <Layout>
                  <StatisticsAdmin />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path='/admin/resources'
            element={
              <AdminRoute>
                <Layout>
                  <ServerMonitoring />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path='/admin/logs'
            element={
              <AdminRoute>
                <Layout>
                  <LogsViewer />
                </Layout>
              </AdminRoute>
            }
          />
        </>
      )}
      {isAuthenticated && !isAdmin && (
        <>
          <Route
            path='/'
            element={
              <Layout>
                <TaskCatalog />
              </Layout>
            }
          />
          <Route
            path='/tasks/:taskId'
            element={
              <Layout>
                <TaskPage />
              </Layout>
            }
          />
          <Route
            path='/profile'
            element={
              <Layout>
                <ProfileView />
              </Layout>
            }
          />
          <Route
            path='/profile/settings'
            element={
              <Layout>
                <ProfileSettings />
              </Layout>
            }
          />
          <Route
            path='/profile/:userId'
            element={
              <Layout>
                <ProfileView />
              </Layout>
            }
          />
          <Route
            path='/leaderboard'
            element={
              <Layout>
                <Leaderboard />
              </Layout>
            }
          />
          <Route
            path='/matchmaking'
            element={
              <Layout>
                <MatchPage />
              </Layout>
            }
          />

          <Route
            path='/match/:matchId'
            element={
              <Layout>
                <MatchPage />
              </Layout>
            }
          />

          <Route
            path='/constructor'
            element={
              <Layout>
                <ConstructorPage />
              </Layout>
            }
          />
        </>
      )}

      {isAuthenticated && isAdmin && (
        <Route path='*' element={<Navigate to='/admin/users' />} />
      )}
      {isAuthenticated && !isAdmin && (
        <Route path='*' element={<Navigate to='/' />} />
      )}
      {!isAuthenticated && <Route path='*' element={<Navigate to='/auth' />} />}
    </Routes>
  );
};

export default App;
