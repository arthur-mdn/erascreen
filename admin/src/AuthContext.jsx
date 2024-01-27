import React, {createContext, useState, useContext, useEffect} from 'react';
import axios from "axios";
import config from './config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authStatus, setAuthStatus] = useState("loading");
    useEffect(() => {
        axios.get(`${config.serverUrl}/auth/validate-session`, { withCredentials: true })
            .then(response => {
                setAuthStatus(response.data.isAuthenticated ? "authenticated" : "unauthenticated");
            })
            .catch(() => {
                setAuthStatus("unauthenticated");
            });
    }, []);
    return (
        <AuthContext.Provider value={{ authStatus, setAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
