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
    FaImages, FaSun,
    FaUmbrella
} from "react-icons/fa6";
import {FaCogs} from "react-icons/fa";
import ConfigManager from "./Settings/ConfigManager.jsx";
import DarkModeManager from "./Settings/DarkModeManager.jsx";
import TimeIndicator from "./TimeIndicator.jsx";

function Settings({ screen, onScreenUpdate }) {
    const [editNameOpen, setEditNameOpen] = useState(false);
    const [editLogoOpen, setEditLogoOpen] = useState(false);
    const [editIconsOpen, setEditIconsOpen] = useState(false);
    const [editMeteoOpen, setEditMeteoOpen] = useState(false);
    const [editDirectionsOpen, setEditDirectionsOpen] = useState(false);
    const [editPhotosOpen, setEditPhotosOpen] = useState(false);
    const [editDarkMode, setEditDarkMode] = useState(false);
    const [editSettingsOpen, setEditSettingsOpen] = useState(false);

    const buttons = [
        { label: "Nom de l'écran", icon: <FaHeading/>, onClick: () => setEditNameOpen(true) },
        { label: "Logo", icon: <FaCopyright/>, onClick: () => setEditLogoOpen(true) },
        { label: "Icônes", icon: <FaIcons/>, onClick: () => setEditIconsOpen(true) },
        { label: "Météo de ville", icon: <FaUmbrella/>, onClick: () => setEditMeteoOpen(true) },
        { label: "Directions", icon: <FaArrowRightArrowLeft/>, onClick: () => setEditDirectionsOpen(true) },
        { label: "Galerie de photos", icon: <FaImages/>, onClick: () => setEditPhotosOpen(true) },
        { label: "Mode sombre", icon: <FaCircleHalfStroke/>, onClick: () => setEditDarkMode(true)},
        { label: "Paramètres avancés", icon: <FaCogs/>, onClick: () => setEditSettingsOpen(true) },
    ];
    return (
        <>
            <div>
                {buttons.map((button, index) => (
                    <button
                        key={index}
                        type={"button"}
                        onClick={button.onClick}
                        className={"setting_element"}
                    >
                        <div className={"fr g1 ai-c"}>
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
                    value={screen.meteo && screen.meteo.city ? screen.meteo.city : ""}
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
                    screenId={screen._id}
                    initialConfig={screen.config}
                    onConfigChange={(newConfig) => {onScreenUpdate(newConfig)}}
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
        </>

    );
}

export default Settings;
