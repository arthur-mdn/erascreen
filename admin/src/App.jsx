// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Home from './pages/Home.jsx';
import Loading from "./components/Loading.jsx";
import Register from "./pages/Register.jsx";
import AddScreen from "./components/AddScreen.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthenticatedApp = () => {
    const { authStatus } = useAuth();

    return (
        <Router>
            {authStatus === "loading" ? (
                <Loading />
            ) : (
                <>
                    <ToastContainer/>
                    <Routes>
                        {authStatus === "unauthenticated" ? (
                            <>
                                {/* Routes publiques */}
                                <Route path="/" element={<Login />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                            </>
                        ) : (
                            <>
                                {/* Routes privées */}
                                <Route path="/" element={<Home />} />
                                <Route path="/add" element={<AddScreen />} />
                                <Route path="/logout" element={<Logout />} />
                            </>
                        )}

                        <Route path="*" element={<Navigate to={authStatus === "unauthenticated" ? "/login" : "/"} />} />
                    </Routes>
                </>
            )}
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AuthenticatedApp />
        </AuthProvider>
    );
};

export default App;
