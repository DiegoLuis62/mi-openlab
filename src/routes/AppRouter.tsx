import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Explore from '../pages/Explore';
import ProjectDetail from '../pages/ProjectDetail';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from './PrivateRoute';


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
                    path="/project/:id"
                    element={
                        <MainLayout>
                            <ProjectDetail />
                        </MainLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
