import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, Link} from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import config from '../config';

function Login() {
    const { setAuthStatus } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const login = (email, password) => {
        axios.post(`${config.serverUrl}/auth/login`, { email, password }, { withCredentials: true })
            .then(response => {
                setAuthStatus("authenticated");
            })
            .catch(error => {
                if (error.response) {
                    setErrorMessage(error.response.data.message || 'Erreur de connexion');
                } else {
                    setErrorMessage('Erreur de connexion');
                }
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        login(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className={"form"} id={"login_form"}>
            <h2>Connexion</h2>
            {errorMessage && <div style={{color:"red",fontWeight:"bold"}}>{errorMessage}</div>}
            <div className={"input_container"}>
                <label htmlFor="email">Email</label>
                <input
                    id={"email"}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className={"input_container"}>
                <label htmlFor="password">Mot de passe</label>
                <input
                    id={"password"}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <Link to={"/mot-de-passe-oublie"} type={"button"} className={"forgot_password_button"}>Mot de passe oublié ?</Link>
            <button type="submit" className={"main_button"}>Connexion</button>
            <p>Vous n'avez pas de compte ?</p>
            <Link to={'/register'} className={"force_button_style sub_button"}>Créer un compte</Link>
        </form>
    );

}

export default Login;
