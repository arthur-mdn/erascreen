import React, { useEffect } from 'react';
import { Navigate} from 'react-router-dom';
import axios from 'axios';
import {useAuth} from "../AuthContext.jsx";
import config from "../config.js";

function Logout() {
    const { setAuthStatus } = useAuth();
    const logout = async () => {
        await axios.post(`${config.serverUrl}/auth/logout`, {}, {withCredentials: true})
            .then(() => {
                setAuthStatus("unauthenticated");
            })
            .catch(error => {
                console.error('Erreur de déconnexion:', error);
            });
    };

    useEffect(() => {
        logout();
    }, []);

    return <Navigate to="/login" />;

}

export default Logout;
