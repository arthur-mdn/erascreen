import React, {useEffect, useState} from 'react';
import {FaArrowRight, FaCopy, FaPlus, FaTrash} from "react-icons/fa6";
import {toast} from 'react-toastify';

function TimeRangeSelector({onRangesChange, initialRanges, timeRangeName = "", additionalInputs = []}) {
    const [ranges, setRanges] = useState(initialRanges || []);
    const initialNewRangeState = () => {
        let initialState = {start: '', end: ''};
        additionalInputs.forEach(input => {
            initialState[input.name] = input.defaultValue || '';
        });
        return initialState;
    };
    const [newRange, setNewRange] = useState(initialNewRangeState);

    const duplicateRange = (range) => {
        setNewRange({...range});
    };

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

        const updatedRanges = [...ranges, {...newRange}];
        setRanges(updatedRanges);
        setNewRange(initialNewRangeState());
        onRangesChange(updatedRanges);
        console.log(updatedRanges)
        toast.info("Vous devez enregistrer les modifications pour qu'elles soient prises en compte.")
    };

    const removeRange = (index) => {
        const updatedRanges = ranges.filter((_, i) => i !== index);
        setRanges(updatedRanges);
        onRangesChange(updatedRanges);
        toast.info("Vous devez enregistrer les modifications pour qu'elles soient prises en compte.")
    };

    const handleInputChange = (e, inputName) => {
        setNewRange({...newRange, [inputName]: e.target.value});
    };

    return (
        <div>
            <div className={"fc g0-5"}>
                <h3>{timeRangeName}</h3>
                {ranges.map((range, index) => (
                    <div key={index} style={{
                        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem'
                    }} className={"fr ai-c g1 jc-sb"}>
                        De {range.start} à {range.end}
                        {
                            additionalInputs.map((input, index) => (
                                <div key={index} className={"fc g1 ai-c"}>
                                    {/*<label htmlFor={input.name}>{input.label}</label>*/}
                                    {
                                        input.type === "color" ? (
                                                <div style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    borderRadius: "50%",
                                                    backgroundColor: range[input.name]
                                                }}/>
                                            ) :
                                            <p style={{maxWidth:'100px', maxHeight:'50px', textOverflow:"ellipsis", overflow:"hidden"}}>{range[input.name]}</p>
                                    }
                                </div>
                            ))
                        }
                        <div className={"fr g0-5"}>
                            <button onClick={() => duplicateRange(range)}><FaCopy/></button>
                            <button onClick={() => removeRange(index)}><FaTrash/></button>
                        </div>
                    </div>
                ))}
            </div>

            <br/>

            <div>
                <h3>Ajouter une plage horaire</h3>
                <div style={{
                    boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                    padding: '1rem',
                    borderRadius: '0.5rem'
                }} className={"fc g1 jc-sb fw-w"}>
                    <div className={"fr g1 ai-c"}>
                        <input
                            type="time"
                            value={newRange.start}
                            onChange={(e) => setNewRange({...newRange, start: e.target.value})}
                            style={{width: "auto"}}
                        />
                        <FaArrowRight/>
                        <input
                            type="time"
                            value={newRange.end}
                            onChange={(e) => setNewRange({...newRange, end: e.target.value})}
                            style={{width: "auto"}}
                        />
                    </div>
                    {
                        additionalInputs.map((input, index) => (
                            <div key={index} className={"fc g1 ai-c"}>
                                <label htmlFor={input.name}>{input.label}</label>
                                {
                                    input.type === "textarea" ? (
                                        <textarea
                                            id={input.name}
                                            value={newRange[input.name]}
                                            onChange={(e) => handleInputChange(e, input.name)}
                                            style={{
                                                width: "100%",
                                                resize: "vertical",
                                                minHeight: "60px",
                                                maxHeight: "200px"
                                            }}
                                        />
                                    ) : (
                                        <input
                                            id={input.name}
                                            type={input.type}
                                            value={newRange[input.name]}
                                            onChange={(e) => handleInputChange(e, input.name)}
                                        />
                                    )
                                }
                            </div>
                        ))
                    }


                    <button onClick={addNewRange} className={"fr ai-c g0-5 jc-c"}><FaPlus/> Ajouter</button>
                </div>
                <br/>
            </div>
        </div>
    );
}

export default TimeRangeSelector;
