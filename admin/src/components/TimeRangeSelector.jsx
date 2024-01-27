import React, { useState } from 'react';
import { FaTrash } from "react-icons/fa6";
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
    };

    const removeRange = (index) => {
        const updatedRanges = ranges.filter((_, i) => i !== index);
        setRanges(updatedRanges);
        onRangesChange(updatedRanges);
    };

    return (
        <div>
            {ranges.map((range, index) => (
                <div key={index}>
                    {range.start} à {range.end}
                    <button onClick={() => removeRange(index)}><FaTrash/></button>
                </div>
            ))}
            <div>
                <input
                    type="time"
                    value={newRange.start}
                    onChange={(e) => setNewRange({ ...newRange, start: e.target.value })}
                />
                -
                <input
                    type="time"
                    value={newRange.end}
                    onChange={(e) => setNewRange({ ...newRange, end: e.target.value })}
                />
                <button onClick={addNewRange}>Ajouter une plage horaire</button>
            </div>
        </div>
    );
}

export default TimeRangeSelector;
