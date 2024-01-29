import React, { useState } from 'react';
import {FaArrowRight, FaPlus, FaTrash} from "react-icons/fa6";
import { toast } from 'react-toastify';

function TimeRangeSelector({ onRangesChange, intialRanges }) {
    const [ranges, setRanges] = useState(intialRanges || []);
    const [newRange, setNewRange] = useState({ start: '', end: '' });

    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const isOverlapping = (newRange, existingRanges) => {
        const newStart = timeToMinutes(newRange.start);
        let newEnd = timeToMinutes(newRange.end);

        // Gérer le cas où la plage se termine à minuit ou s'étend sur deux jours
        if (newEnd === 0) newEnd = 24 * 60; // Convertir 00:00 en minutes pour minuit

        for (let range of existingRanges) {
            const existingStart = timeToMinutes(range.start);
            let existingEnd = timeToMinutes(range.end);
            if (existingEnd === 0) existingEnd = 24 * 60;

            if (newStart < existingEnd && newEnd > existingStart) {
                return true;
            }
        }
        return false;
    };

    const addNewRange = () => {
        if (!newRange.start || !newRange.end) {
            toast.error("Les champs de début et de fin doivent être remplis.");
            return;
        }

        if (isOverlapping(newRange, ranges)) {
            toast.error("La nouvelle plage horaire se chevauche avec une existante.");
            return;
        }

        const updatedRanges = [...ranges, newRange];
        setRanges(updatedRanges);
        setNewRange({ start: '', end: '' });
        onRangesChange(updatedRanges);
        toast.info("Vous devez enregistrer les modifications pour qu'elles soient prises en compte.")
    };

    const removeRange = (index) => {
        const updatedRanges = ranges.filter((_, i) => i !== index);
        setRanges(updatedRanges);
        onRangesChange(updatedRanges);
        toast.info("Vous devez enregistrer les modifications pour qu'elles soient prises en compte.")
    };

    return (
        <div>
            <div className={"fc g0-5"}>
                <h3>Plages horaires d'activation du mode sombre</h3>
                {ranges.map((range, index) => (
                    <div key={index} style={{boxShadow:"rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px", padding:'0.5rem 1rem', borderRadius:'0.5rem'}} className={"fr ai-c g1 jc-sb"}>
                        De {range.start} à {range.end}
                        <button onClick={() => removeRange(index)}><FaTrash/></button>
                    </div>
                ))}
            </div>

            <br/>

            <div>
                <h3>Ajouter une plage horaire</h3>
                <div style={{boxShadow:"rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px", padding:'1rem', borderRadius:'0.5rem'}} className={"fr ai-c g1 jc-sb fw-w"}>
                    <div className={"fr g1 ai-c"}>
                        <input
                            type="time"
                            value={newRange.start}
                            onChange={(e) => setNewRange({ ...newRange, start: e.target.value })}
                            style={{width:"auto"}}
                        />
                        <FaArrowRight/>
                        <input
                            type="time"
                            value={newRange.end}
                            onChange={(e) => setNewRange({ ...newRange, end: e.target.value })}
                            style={{width:"auto"}}
                        />
                    </div>

                    <button onClick={addNewRange} className={"fr ai-c g0-5 jc-c"}><FaPlus/> Ajouter</button>
                </div>
                <br/>
            </div>
        </div>
    );
}

export default TimeRangeSelector;
