import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Explore from '../pages/Explore';
import ProjectDetail from '../pages/ProjectDetail';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from './PrivateRoute';
import PasswordReset from '../pages/PasswordReset';
import Feed from '../pages/Feed';
import UserProfile from '../pages/UserProfile';
import Groups from '../groups/Groups';
import GroupDetail from '../groups/GroupDetail';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Explore />
                        </MainLayout>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <MainLayout>
                            <Login />
                        </MainLayout>
                    }
                />
                <Route
                    path="/password-reset"
                    element={
                        <MainLayout>
                            <PasswordReset />
                        </MainLayout>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <MainLayout>
                            <Register />
                        </MainLayout>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Profile />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/feed"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Feed />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/user/:id"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <UserProfile />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                {/* Detalle de proyecto es PÚBLICO */}
                <Route
                    path="/project/:id"
                    element={
                        <MainLayout>
                            <ProjectDetail />
                        </MainLayout>
                    }
                />
                <Route
                    path="/groups"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Groups />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/groups/:id"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <GroupDetail />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
