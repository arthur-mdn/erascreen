import React, { useState, useEffect } from 'react';
import axios from "axios";
import config from "../config.js";
import {useCookies} from "react-cookie";
import Modal from "./Modal.jsx";
import AddScreen from "./AddScreen.jsx";
import Loading from "./Loading.jsx";
import {toast} from "react-toastify";
import {FaTv} from "react-icons/fa6";
import {Link} from "react-router-dom";
import {useSocket} from "../SocketContext.jsx";
import {MonitorSmartphone, MonitorX} from "lucide-react";

function ScreenSelector({ onSelectScreen }) {
    const [cookies, setCookie] = useCookies(['selectedScreen']);
    const [screens, setScreens] = useState([]);
    const [addScreenModalIsOpen, setAddScreenModalIsOpen] = useState(false);
    const selectedScreenId = cookies.selectedScreen;
    const [isLoading, setIsLoading] = useState(false);
    const socket = useSocket();

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

    useEffect(() => {
        if (socket) {
            socket.on('screen_status', (updatedScreen) => {
                setScreens((prevScreens) =>
                    prevScreens.map((screen) =>
                        screen._id === updatedScreen.screenId ? { ...screen, status: updatedScreen.status } : screen
                    )
                );
            });

            return () => {
                socket.off('screen_status');
            };
        }
    }, [socket]);

    if (isLoading) return <Loading />;

    return (
        <>
            <div style={{padding:"1rem", height:'100%'}} className={"fc jc-sb"}>
                <div className={"fc g0-5"}>
                    {screens.map(screen => (
                        <Link to={`/screens/list/${screen._id}`} key={screen._id} className={"screen"}>
                            <img src={`${config.serverUrl}/${screen.featured_image}`}/>
                            <div className={"fc ai-fs g0-25 h100"}>
                                <h3 className={"fw-b"}>
                                    {screen.name}
                                </h3>
                                <div className={`fr g0-5 ai-c`}>
                                    <div className={`${screen.status}`}>
                                    </div>
                                    <span className={`${screen.status}`}>
                                        {screen.status === "online" ? "En ligne" : "Hors ligne"}
                                    </span>
                                </div>
                                <p style={{opacity: 0.4}}>
                                    {screen._id}
                                </p>
                            </div>

                        </Link>
                    ))}
                    {(screens.length === 0) && <div className={"fc jc-c ai-c g1"} style={{height:'100%'}}>
                        <MonitorX size={86} style={{opacity:0.4}}/>
                        <h2 style={{opacity:0.4}}>Aucun écran</h2>
                        <br/>
                        <Link to={"/screens/add"} className={`w100 setting-button fr g0-5 ai-c`}>
                            <MonitorSmartphone size={24}/>
                            <h4>Associer un nouvel écran</h4>
                        </Link>
                    </div>}
                </div>
            </div>
        </>

    );
}

export default ScreenSelector;
