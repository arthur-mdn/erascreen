import React, {useEffect, useState} from 'react';

function TimeViewer() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    const jourDeLaSemaine = jours[currentTime.getDay()];
    const jourDuMois = currentTime.getDate();
    const moisEnCours = mois[currentTime.getMonth()];
    const anneeEnCours = currentTime.getFullYear();

    const heures = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const secondes = currentTime.getSeconds().toString().padStart(2, '0');

    return (
        <div className={"card time"} style={{flexDirection:"column", gap:0, padding:' 1vw 1.5vw'}}>
            <p style={{fontWeight:"bold"}}>{`${jourDeLaSemaine} ${jourDuMois} ${moisEnCours} ${anneeEnCours}`}</p>
            <p style={{fontWeight:"bold"}}>{`${heures}h${minutes}:${secondes}`}</p>
        </div>
    );
}

export default TimeViewer;
