// App.jsx
import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {AuthProvider, useAuth} from './AuthContext';
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Accueil from './pages/Accueil.jsx';
import Loading from "./components/Loading.jsx";
import Register from "./pages/Register.jsx";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "./components/NavBar.jsx";
import Screens from "./pages/Screens.jsx";
import Programmes from "./pages/Programmes.jsx";
import Profil from "./pages/Profil.jsx";
import {SocketProvider} from "./SocketContext.jsx";
import Admin from "./pages/Admin.jsx";

const AuthenticatedApp = () => {
    const {authStatus, user} = useAuth();

    return (
        <Router>
            {authStatus === "loading" ? (
                <Loading/>
            ) : (
                <>
                    <NavBar hidden={authStatus === "unauthenticated"}/>
                    <ToastContainer pauseOnFocusLoss={false} closeOnClick={true}/>
                    <div
                        className={`fc w100 h100 content ofy-h ${authStatus === "unauthenticated" ? "logged-out" : ""}`}>
                        <Routes>
                            {authStatus === "unauthenticated" ? (
                                <>
                                    {/* Routes publiques */}
                                    <Route path="/" element={<Login/>}/>
                                    <Route path="/login" element={<Login/>}/>
                                    <Route path="/register" element={<Register/>}/>
                                    <Route path="/screens/add/:screenId" element={<Login/>}/>
                                </>
                            ) : (
                                <>
                                    {/* Routes privées */}
                                    <Route path="/" element={<Accueil/>}/>
                                    <Route path="/screens/*" element={<Screens/>}/>
                                    {/*<Route path="/screens/list" element={<Screens/>}/>*/}
                                    {/*<Route path="/screens/add/:screenId" element={<AddScreen fromUrl={true}/>}/>*/}
                                    <Route path="/programmes" element={<Programmes/>}/>
                                    <Route path="/profil" element={<Profil/>}/>
                                    <Route path="/logout" element={<Logout/>}/>
                                    {
                                        user && user.userRole === 'superadmin' &&
                                        <Route path="/admin" element={<Admin/>}/>
                                    }
                                </>
                            )}

                            <Route path="*"
                                   element={<Navigate to={authStatus === "unauthenticated" ? "/login" : "/"}/>}/>
                        </Routes>
                    </div>
                    {authStatus === "authenticated" &&
                        <div style={{minHeight: '100px', width: "100%"}} className={`hide-desktop`}></div>
                    }
                </>
            )}
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <SocketProvider>
                <AuthenticatedApp/>
            </SocketProvider>
        </AuthProvider>
    );
};

export default App;
