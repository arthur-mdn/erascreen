import React, { useState, useEffect } from 'react';
import ScreenSelector from "../components/ScreenSelector.jsx";
import Modal from "../components/Modal.jsx";
import {useCookies} from "react-cookie";
import axios from "axios";
import config from "../config.js";
import Loading from "../components/Loading.jsx";
import Settings from "../components/Settings.jsx";


function Home() {
    const [screenSelectorOpen, setScreenSelectorOpen] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['selectedScreen']);
    const [screenSelected, setScreenSelected] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (cookies.selectedScreen) {
            axios.get(`${config.serverUrl}/screens/${cookies.selectedScreen}`, { withCredentials: true })
                .then(response => {
                    setScreenSelected(response.data.screenObj);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de l\'écran :', error);
                    if (error.response && error.response.status === 404) {
                        removeCookie('selectedScreen', { path: '/' });
                    }
                });
        }else{
            setIsLoading(false);
        }
    }, [cookies.selectedScreen, removeCookie]);


    if (isLoading) return (
        <Loading/>
    );

    return (
        <>
            {
                !screenSelected &&
                <>
                    <div className={"no_profile_selected"} style={{textAlign:"center"}}>
                        <h3>Aucun écran sélectionné</h3>
                        <p>Veuillez sélectionner un écran pour le configurer.</p>
                        <button type={"button"} onClick={() => setScreenSelectorOpen(true)}>Choisir un écran</button>
                    </div>
                </>
            }

            {
                screenSelected &&
                <>
                    <div className={"actual_profile_selector"}>
                        <h4>
                            {screenSelected.nom}
                        </h4>
                        <div onClick={()=>{setScreenSelectorOpen(true)}}>
                            <img src={"/elements/icons/arrows.svg"} style={{width:'15px'}} alt={"->"}/>
                        </div>
                    </div>
                    <div className={"screen_selected"} style={{height:'100%'}}>
                        <Settings screen={screenSelected} onScreenUpdate={(screenObj) => {setScreenSelected(screenObj)}} onRemoveScreenSelected={()=>{setScreenSelected(null)}}/>
                    </div>
                </>
            }

            <Modal isOpen={screenSelectorOpen} onClose={() => setScreenSelectorOpen(false)} title={"Sélectionnez votre écran"} padding={"0"}>
                <ScreenSelector onSelectScreen={() => setScreenSelectorOpen(false)}/>
            </Modal>
        </>
    );

}

export default Home;
