import React, {createContext, useContext, useEffect, useState} from 'react';
import axios from "axios";
import config from './config';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [authStatus, setAuthStatus] = useState("loading");
    useEffect(() => {
        axios.get(`${config.serverUrl}/auth/validate-session`, {withCredentials: true})
            .then(response => {
                setAuthStatus(response.data.isAuthenticated ? "authenticated" : "unauthenticated");
                if (response.data.user) {
                    const {password, ...user} = response.data.user;
                    setUser(user);
                }
            })
            .catch(() => {
                setAuthStatus("unauthenticated");
            });
    }, []);
    return (
        <AuthContext.Provider value={{authStatus, setAuthStatus, user}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
