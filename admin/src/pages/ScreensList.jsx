import React, { useState, useEffect } from 'react';
import ScreenSelector from "../components/ScreenSelector.jsx";
import Modal from "../components/Modal.jsx";
import {useCookies} from "react-cookie";
import axios from "axios";
import config from "../config.js";
import Loading from "../components/Loading.jsx";
import Screen from "../components/Screen.jsx";
import {MonitorCheck, MonitorOff, MonitorSmartphone} from "lucide-react";
import {Link, Navigate, Route, Routes} from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Accueil from "./Accueil.jsx";
import AddScreen from "../components/AddScreen.jsx";
import Programmes from "./Programmes.jsx";
import Profil from "./Profil.jsx";
import Logout from "./Logout.jsx";
import Screens from "./Screens.jsx";
import {Monitor} from "lucide-react";


function ScreensList() {
    const [cookies, setCookie, removeCookie] = useCookies(['selectedScreen', 'pendingScreenId']);
    const [screenSelected, setScreenSelected] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (cookies.pendingScreenId) {
            window.location.href = `/screens/add/${cookies.pendingScreenId}`;
        }
    }, []);

    // useEffect(() => {
    //     if (cookies.selectedScreen) {
    //         axios.get(`${config.serverUrl}/screens/${cookies.selectedScreen}`, { withCredentials: true })
    //             .then(response => {
    //                 setScreenSelected(response.data.screenObj);
    //                 setIsLoading(false);
    //             })
    //             .catch(error => {
    //                 console.error('Erreur lors de la récupération de l\'écran :', error);
    //                 if (error.response && error.response.status === 404) {
    //                     removeCookie('selectedScreen', { path: '/' });
    //                 }
    //             });
    //     }else{
    //         setIsLoading(false);
    //     }
    // }, [cookies.selectedScreen, removeCookie]);


    if (isLoading) return (
        <Loading/>
    );

    return (
        <>
            <Routes>
                <>
                    <Route path="/:screenId" element={<Screen/>}/>
                    <Route path="/add/*" element={<AddScreen/>}/>
                    <Route path="/del" element={<>del</>}/>
                </>
                <Route path="*" element={<>
                    <ScreenSelector/>
                </>}/>
            </Routes>

        </>
    );

}

export default ScreensList;
