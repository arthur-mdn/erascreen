import React, { useEffect } from 'react';
import { Navigate} from 'react-router-dom';
import axios from 'axios';
import {useAuth} from "../AuthContext.jsx";
import config from "../config.js";
import {useCookies} from "react-cookie";

function Logout() {
    const { setAuthStatus } = useAuth();
    const [cookies, setCookie, removeCookie] = useCookies(['selectedScreen', 'pendingScreenId']);
    const logout = async () => {
        await axios.post(`${config.serverUrl}/auth/logout`, {}, {withCredentials: true})
            .then(() => {
                setAuthStatus("unauthenticated");
                removeCookie('selectedScreen', { path: '/' });
                removeCookie('pendingScreenId', { path: '/' });
            })
            .catch(error => {
                console.error('Erreur de déconnexion:', error);
            });
    };

    useEffect(() => {
        logout();
    }, []);

}

export default Logout;
