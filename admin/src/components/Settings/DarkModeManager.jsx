import React, { useState } from 'react';
import axios from "axios";
import config from "../../config.js";
import TimeRangeSelector from "../TimeRangeSelector.jsx";
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";

function DarkModeManager({ screenId, initialDarkMode, onConfigChange }) {
    const [darkModeRanges, setDarkModeRanges] = useState(initialDarkMode?.ranges || []);
    const [isLoading, setIsLoading] = useState(false);
    console.log(darkModeRanges)
    const saveDarkModeConfig = () => {
        setIsLoading(true);
        const updatedDarkModeConfig = darkModeRanges.map(range => ({
            start: range.start,
            end: range.end,
            enabled: true
        }));

        axios.post(`${config.serverUrl}/screens/update`, {
            attribute: 'dark_mode',
            value: { ranges: updatedDarkModeConfig }
        }, { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    onConfigChange(response.data.screenObj);
                    toast.success("Configuration du mode sombre mise à jour avec succès !");
                } else {
                    toast.error("La mise à jour de la configuration du mode sombre a échoué.");
                }
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour du mode sombre :', error);
                toast.error("Erreur lors de la mise à jour du mode sombre.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (isLoading) return <Loading />;

    return (
        <div className={"fc g1"}>
            <TimeRangeSelector onRangesChange={(newRanges) => {setDarkModeRanges(newRanges)}} initialRanges={darkModeRanges} timeRangeName={"Plages horaires d'activation du mode sombre"} />
            <button type={"button"} onClick={saveDarkModeConfig}>Enregistrer</button>
        </div>
    );
}

export default DarkModeManager;
