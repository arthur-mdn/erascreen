import ScreenSelector from "../components/ScreenSelector.jsx";
import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";

function Accueil() {
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(['pendingScreenId']);

    useEffect(() => {
        if (cookies.pendingScreenId) {
            window.location.href = `/screens/add/${cookies.pendingScreenId}`;
        }
    }, []);
    return (
        <>
           Accueil
            <div>
                <ScreenSelector onSelectScreen={(screen) => navigate(`/screens`)}/>
            </div>
        </>
    );

}

export default Accueil;
