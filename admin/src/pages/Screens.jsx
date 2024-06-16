import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import Loading from "../components/Loading.jsx";
import Screen from "../components/Screen.jsx";
import {MonitorCheck, MonitorOff, MonitorSmartphone} from "lucide-react";
import {Link, Route, Routes} from "react-router-dom";
import AddScreen from "../components/AddScreen.jsx";
import ScreensList from "./ScreensList.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";


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

    function isActive(path, base) {
        return path === base || path.startsWith(`${base}/`);
    }

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
        <div className={"fr h100 w100 bg-blue-to-gray"}>
            <div className={"fc h100 bg-grey p1 br-l-1 fs-0 dn"}>
                <h4 className={"fw-b"}>Écrans</h4>
                <br/>
                <div className={"fc g1"} >
                    <Link to={"list"} className={`fr g0-5 ai-c ${isActive(location.pathname, '/screens/list') ? 'active' : ''}`}>
                        <MonitorCheck size={24}/>
                        <h4>Écrans associés</h4>
                    </Link>
                    <Link to={"add"} className={`fr g0-5 ai-c ${isActive(location.pathname, '/screens/add') ? 'active' : ''}`}>
                        <MonitorSmartphone size={24}/>
                        <h4>Associer un nouvel écran</h4>
                    </Link>
                    <Link to={"del"} className={`fr g0-5 ai-c ${isActive(location.pathname, '/screens/del') ? 'active' : ''}`}>
                        <MonitorOff size={24}/>
                        <h4>Dissocier un écran</h4>
                    </Link>
                </div>
            </div>
            <div className={"w100 br-l-1 bg-white bs"}>
                <Breadcrumbs/>
                <Routes>
                    <>
                        <Route path="/list/*" element={<ScreensList/>}/>
                        <Route path="/add/*" element={<AddScreen/>}/>
                        <Route path="/del/*" element={<>del</>}/>
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
            </div>

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
        </div>
    );

}

export default Home;
