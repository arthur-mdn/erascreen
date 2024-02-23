import React, { useState, useEffect } from 'react';
import Modal from "./Modal.jsx";
import EditScreenAttribute from "./EditScreenAttribute.jsx";
import IconManager from "./Settings/IconManager.jsx";
import MeteoViewer from "./MeteoViewer.jsx";
import DirectionsManager from "./Settings/DirectionsManager.jsx";
import PhotosManager from "./Settings/PhotosManager.jsx";
import {
    FaArrowRightArrowLeft, FaChevronRight, FaCircleHalfStroke,
    FaCopyright,
    FaHeading,
    FaIcons,
    FaImages, FaSun, FaTextWidth,
    FaUmbrella
} from "react-icons/fa6";
import {FaCogs, FaSignOutAlt} from "react-icons/fa";
import ConfigManager from "./Settings/ConfigManager.jsx";
import DarkModeManager from "./Settings/DarkModeManager.jsx";
import TimeIndicator from "./TimeIndicator.jsx";
import DelScreen from "./Settings/DelScreen.jsx";
import TextSlidesManager from "./Settings/TextSlidesManager.jsx";

function Settings({ screen, onScreenUpdate, onRemoveScreenSelected }) {
    const [editNameOpen, setEditNameOpen] = useState(false);
    const [editLogoOpen, setEditLogoOpen] = useState(false);
    const [editIconsOpen, setEditIconsOpen] = useState(false);
    const [editMeteoOpen, setEditMeteoOpen] = useState(false);
    const [editDirectionsOpen, setEditDirectionsOpen] = useState(false);
    const [editPhotosOpen, setEditPhotosOpen] = useState(false);
    const [editDarkMode, setEditDarkMode] = useState(false);
    const [editTextSlidesOpen, setEditTextSlidesOpen] = useState(false);
    const [editSettingsOpen, setEditSettingsOpen] = useState(false);

    console.log(screen)
    const buttons = [
        { id: "nom", label: "Nom de l'écran", icon: <FaHeading/>, onClick: () => setEditNameOpen(true) },
        { id: "logo", label: "Logo", icon: <FaCopyright/>, onClick: () => setEditLogoOpen(true) },
        { id: "icons", label: "Icônes", icon: <FaIcons/>, onClick: () => setEditIconsOpen(true) },
        { id: "meteo", label: "Météo de ville", icon: <FaUmbrella/>, onClick: () => setEditMeteoOpen(true) },
        { id: "directions", label: "Directions", icon: <FaArrowRightArrowLeft/>, onClick: () => setEditDirectionsOpen(true) },
        { id: "photos", label: "Galerie de photos", icon: <FaImages/>, onClick: () => setEditPhotosOpen(true) },
        { id: "dark_mode", label: "Mode sombre", icon: <FaSun/>, onClick: () => setEditDarkMode(true)},
        { id: "text_slides", label: "Textes défilants", icon: <FaTextWidth/>, onClick: () => setEditTextSlidesOpen(true)},
        { id: "config", label: "Paramètres avancés", icon: <FaCogs/>, onClick: () => setEditSettingsOpen(true) }
    ];

    let allowedButtons = []
    if (screen.permissions && screen.permissions.length > 0) {
        allowedButtons = buttons.filter(button => screen.permissions.includes(button.id) || screen.permissions.includes("creator"));
    }
    return (
        <div style={{height:'100%'}} className={"fc jc-sb"}>
            <div>
                {allowedButtons.map((button, index) => (
                    <button
                        key={button.id}
                        type={"button"}
                        onClick={button.onClick}
                        className={"setting_element"}
                    >
                        <div className={"fr g1 ai-c"} style={{textAlign:"left"}}>
                            {button.icon}
                            {button.label}
                        </div>
                        <FaChevronRight style={{marginLeft:"auto"}}/>
                    </button>
                ))}

            </div>
            <Modal isOpen={editNameOpen} title={"Modifier le nom"} onClose={()=> {setEditNameOpen(false)}}>
                <EditScreenAttribute
                    screenId={screen._id}
                    attribute="nom"
                    value={screen.nom}
                    onSave={(screenObj) => {onScreenUpdate(screenObj)}}
                />
            </Modal>
            <Modal isOpen={editLogoOpen} title={"Modifier le logo"} onClose={()=> {setEditLogoOpen(false)}}>
                <EditScreenAttribute
                    screenId={screen._id}
                    attribute="logo"
                    value={screen.logo}
                    onSave={(screenObj) => {onScreenUpdate(screenObj)}}
                    inputType="file"
                />
            </Modal>
            <Modal isOpen={editMeteoOpen} title={"Modifier la météo"} onClose={()=> {setEditMeteoOpen(false)}}>
                <MeteoViewer screen={screen}/>
                <EditScreenAttribute
                    screenId={screen._id}
                    attribute="meteo.city"
                    value={(screen.meteo && screen.meteo.weatherId) ? screen.meteo.data.name : ""}
                    onSave={(screenObj) => {onScreenUpdate(screenObj)}}
                />
            </Modal>

            <Modal isOpen={editIconsOpen} title={"Modifier les icônes"} onClose={()=> {setEditIconsOpen(false)}}>
                <IconManager
                    screenId={screen._id}
                    initialIcons={screen.icons}
                    onIconsChange={(newConfig) => {onScreenUpdate(newConfig)}}
                />
            </Modal>

            <Modal isOpen={editDirectionsOpen} title={"Modifier les directions"} onClose={()=> {setEditDirectionsOpen(false)}}>
                <DirectionsManager
                    screenId={screen._id}
                    initialDirections={screen.directions}
                    onDirectionsChange={(newConfig) => {onScreenUpdate(newConfig)}}
                />
            </Modal>

            <Modal isOpen={editPhotosOpen} title={"Modifier les photos"} onClose={()=> {setEditPhotosOpen(false)}}>
                <PhotosManager
                    screenId={screen._id}
                    initialPhotos={screen.photos}
                    onPhotosChange={(newConfig) => {onScreenUpdate(newConfig)}}
                />
            </Modal>

            <Modal isOpen={editSettingsOpen} title={"Modifier les paramètres avancés"} onClose={()=> {setEditSettingsOpen(false)}}>
                <ConfigManager
                    screen={screen}
                    initialConfig={screen.config}
                    onConfigChange={(newConfig) => {onScreenUpdate(newConfig)}}
                    onRemoveScreenSelected={()=>{onRemoveScreenSelected()}}
                />
            </Modal>

            <Modal isOpen={editDarkMode} title={"Modifier le mode sombre"} onClose={()=> {setEditDarkMode(false)}}>
                <TimeIndicator ranges={screen.dark_mode.ranges}/>
                <DarkModeManager
                    screenId={screen._id}
                    initialDarkMode={screen.dark_mode}
                    onConfigChange={(newConfig) => {onScreenUpdate(newConfig)}}
                />
            </Modal>

            <Modal isOpen={editTextSlidesOpen} title={"Modifier les textes défilants"} onClose={()=> {setEditTextSlidesOpen(false)}}>
                <TimeIndicator ranges={screen.text_slides.ranges}/>
                <TextSlidesManager
                    screenId={screen._id}
                    initialTextSlides={screen.text_slides}
                    onConfigChange={(newConfig) => {onScreenUpdate(newConfig)}}
                />
            </Modal>


            <button type={"button"} className={"setting_element"} onClick={()=>{window.location = "/logout"}} style={{color:"red", alignItems:"center" ,justifyContent:"center"}}>
                <FaSignOutAlt/>
                Se déconnecter
            </button>

        </div>

    );
}

export default Settings;
