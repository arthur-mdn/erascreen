import {FaSignOutAlt} from "react-icons/fa";
import React from "react";

function Profil() {


    return (
        <>
            <button type={"button"} className={"setting_element"} onClick={()=>{window.location = "/logout"}} style={{color:"red", alignItems:"center" ,justifyContent:"center"}}>
                <FaSignOutAlt/>
                Se déconnecter
            </button>
        </>
    );

}

export default Profil;
