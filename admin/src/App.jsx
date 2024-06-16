// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Accueil from './pages/Accueil.jsx';
import Loading from "./components/Loading.jsx";
import Register from "./pages/Register.jsx";
import AddScreen from "./components/AddScreen.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "./components/NavBar.jsx";
import Screens from "./pages/Screens.jsx";
import Programmes from "./pages/Programmes.jsx";
import Profil from "./pages/Profil.jsx";

const AuthenticatedApp = () => {
    const { authStatus } = useAuth();

    return (
        <Router>
            {authStatus === "loading" ? (
                <Loading />
            ) : (
                <>
                    <NavBar/>
                    <ToastContainer/>
                    <div className={"fc w100 content"}>
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
                                </>
                            )}

                            <Route path="*"
                                   element={<Navigate to={authStatus === "unauthenticated" ? "/login" : "/"}/>}/>
                        </Routes>
                    </div>
                    <div style={{minHeight: '110px',width:"100%"}} className={"hide-desktop"}></div>
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
