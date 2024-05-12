import ScreenSelector from "../components/ScreenSelector.jsx";
import React from "react";
import {useNavigate} from "react-router-dom";

function Accueil() {
    const navigate = useNavigate();
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
