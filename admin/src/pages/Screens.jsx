import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import Loading from "../components/Loading.jsx";
import Screen from "../components/Screen.jsx";
import {MonitorCheck, MonitorOff, MonitorSmartphone} from "lucide-react";
import {Link, Route, Routes} from "react-router-dom";
import AddScreen from "../components/AddScreen.jsx";
import ScreensList from "./ScreensList.jsx";


function Home() {
    const [screenSelectorOpen, setScreenSelectorOpen] = useState(false);
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
                    <Route path="/list" element={<ScreensList/>}/>
                    <Route path="/screen/:screenId" element={<Screen/>}/>
                    <Route path="/add/*" element={<AddScreen/>}/>
                    <Route path="/del" element={<>del</>}/>
                </>
                <Route path="*" element={<div className={"fr g0-5 p1"}>
                    <Link to={"list"} className={"setting-button"}>
                        <MonitorCheck size={24}/>
                        <h4>Écrans associés</h4>
                    </Link>

                    <Link to={"add"} className={"setting-button"}>
                        <MonitorSmartphone size={24}/>
                        <h4>Associer un nouvel écran</h4>
                    </Link>

                    <Link to={"del"} className={"setting-button"}>
                        <MonitorOff size={24}/>
                        <h4>Dissocier un écran</h4>
                    </Link>
                </div>}/>
            </Routes>
            {/*{*/}
            {/*    !screenSelected &&*/}
            {/*    <>*/}
            {/*        <div className={"no_profile_selected"} style={{textAlign: "center"}}>*/}
            {/*            <h3>Aucun écran sélectionné</h3>*/}
            {/*            <p>Veuillez sélectionner un écran pour le configurer.</p>*/}
            {/*            <button type={"button"} onClick={() => setScreenSelectorOpen(true)}>Choisir un écran</button>*/}
            {/*        </div>*/}
            {/*    </>*/}
            {/*}*/}

            {/*{*/}
            {/*    screenSelected &&*/}
            {/*    <>*/}
            {/*        <div className={"actual_profile_selector"}>*/}
            {/*            <h4>*/}
            {/*                {screenSelected.nom}*/}
            {/*            </h4>*/}
            {/*            <div onClick={()=>{setScreenSelectorOpen(true)}}>*/}
            {/*                <img src={"/elements/icons/arrows.svg"} style={{width:'15px'}} alt={"->"}/>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className={"screen_selected"} style={{height:'100%'}}>*/}
            {/*            <Screen screen={screenSelected} onScreenUpdate={(screenObj) => {setScreenSelected(screenObj)}} onRemoveScreenSelected={()=>{setScreenSelected(null)}}/>*/}
            {/*        </div>*/}
            {/*    </>*/}
            {/*}*/}

            {/*<Modal isOpen={screenSelectorOpen} onClose={() => setScreenSelectorOpen(false)} title={"Sélectionnez votre écran"} padding={"0"}>*/}
            {/*    <ScreenSelector onSelectScreen={() => setScreenSelectorOpen(false)}/>*/}
            {/*</Modal>*/}
        </>
    );

}

export default Home;
