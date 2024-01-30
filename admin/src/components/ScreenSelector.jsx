import React, { useState, useEffect } from 'react';
import axios from "axios";
import config from "../config.js";
import {useCookies} from "react-cookie";
import Modal from "./Modal.jsx";
import AddScreen from "./AddScreen.jsx";
import Loading from "./Loading.jsx";
import {toast} from "react-toastify";
function ScreenSelector({ onSelectScreen }) {
    const [screens, setScreens] = useState([]);
    const [cookies, setCookie] = useCookies(['selectedScreen']);
    const [addScreenModalIsOpen, setAddScreenModalIsOpen] = useState(false);
    const selectedScreenId = cookies.selectedScreen;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        axios.get(`${config.serverUrl}/screens`, { withCredentials: true })
            .then(response => {
                setScreens(response.data.screens);
            })
            .catch(error => {
                console.log(error || 'Erreur lors de la récupération des écrans');
                toast.error("Erreur lors de la récupération des écrans.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleScreenAdd = (screen) => {
        setScreens([...screens, screen]);
        setAddScreenModalIsOpen(false);
    }
    const handleScreenSelect = (screen) => {
        setCookie('selectedScreen', screen._id, { path: '/', domain: config.cookieDomain });
        onSelectScreen(screen);
        toast.success(`Écran "${screen.nom}" sélectionné.`);
    };

    if (isLoading) return <Loading />;

    return (
        <>
            <div style={{padding:"1rem", height:'100%'}} className={"fc jc-sb"}>
                <div className={"fc g0-5"}>
                    {screens.map(screen => (
                        <button key={screen._id} onClick={() => handleScreenSelect(screen)} className={"profile"}>
                            <input
                                type={"radio"}
                                name={"radio-screen"}
                                className={"radio-screen"}
                                id={`radio-screen-${screen._id}`}
                                checked={screen._id === selectedScreenId}
                                onChange={() => handleScreenSelect(screen)}
                            />
                            <label htmlFor={`radio-screen-${screen._id}`}>
                            </label>
                            <div className={"fc ai-fs"} >
                                <h3>
                                    {screen.nom}
                                </h3>
                                <p style={{opacity:0.4}}>
                                    {screen._id}
                                </p>
                            </div>

                        </button>
                    ))}
                </div>

                <button
                    type={"button"}
                    onClick={() => setAddScreenModalIsOpen(true)}
                >
                    Ajouter un écran
                </button>
            </div>
            <Modal isOpen={addScreenModalIsOpen} onClose={() => setAddScreenModalIsOpen(false)}>
                <AddScreen onScreenAdd={(newScreen)=>{handleScreenAdd(newScreen)}}/>
            </Modal>
        </>

    );
}

export default ScreenSelector;
