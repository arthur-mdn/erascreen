import React, {useEffect, useState} from 'react';
import axios from "axios";
import config from "../../config.js";
import TimeRangeSelector from "../TimeRangeSelector.jsx";
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";

function TextSlidesManager({ screenId, initialTextSlides, onConfigChange }) {
    console.log(initialTextSlides?.ranges)
    const [textSlidesRanges, setTextSlidesRanges] = useState(initialTextSlides?.ranges || []);
    const [isLoading, setIsLoading] = useState(false);

    const saveTextSlideConfig = () => {
        setIsLoading(true);
        const updatedTextSlidesConfig = textSlidesRanges.map(range => ({
            start: range.start,
            end: range.end,
            text: range.text,
            backgroundColor: range.backgroundColor,
            textColor: range.textColor,
            slideTime: range.slideTime,
            enabled: true
        }));

        axios.post(`${config.serverUrl}/screens/update`, {
            attribute: 'textSlides',
            value: { ranges: updatedTextSlidesConfig }
        }, { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    onConfigChange(response.data.screenObj);
                    toast.success("Configuration des textes défilants mise à jour avec succès !");
                } else {
                    toast.error("La mise à jour de la configuration des textes défilants a échoué.");
                }
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour des textes défilants :', error);
                toast.error("Erreur lors de la mise à jour des textes défilants.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (isLoading) return <Loading />;

    return (
        <div className={"fc g1 p1"}>
            <TimeRangeSelector onRangesChange={setTextSlidesRanges} initialRanges={textSlidesRanges} timeRangeName={"Plages horaires des textes défilants"} additionalInputs={[{name:"text", type: "textarea", label: "Texte défilant",defaultValue:"Texte défilant"}, {name: "backgroundColor", type: "color", label: "Couleur de fond",defaultValue:"#0062FF"}, {name: "textColor", type: "color", label: "Couleur du texte",defaultValue:"#ffffff"}, {name: "slideTime", type: "number", label: "Temps de défilement du texte (en secondes)",defaultValue:"120"}]} />
            <button type="button" onClick={saveTextSlideConfig}>Enregistrer</button>
        </div>
    );
}

export default TextSlidesManager;
