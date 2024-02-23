import React, {useEffect, useState} from 'react';
import {FaArrowRight, FaCopy, FaPlus, FaTrash} from "react-icons/fa6";
import {toast} from 'react-toastify';
import Modal from "./Modal.jsx";

function TimeRangeSelector({onRangesChange, initialRanges, timeRangeName = "", additionalInputs = []}) {
    const [ranges, setRanges] = useState(initialRanges || []);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRangeIndex, setSelectedRangeIndex] = useState(null);

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
        setIsAddOpen(true);
    };

    const openEditModal = (index) => {
        setSelectedRangeIndex(index);
        setNewRange({ ...ranges[index] });
        setIsEditOpen(true);
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

        // Convertir les heures en minutes pour la comparaison
        const startMinutes = timeToMinutes(newRange.start);
        const endMinutes = newRange.end === "00:00" ? 24 * 60 : timeToMinutes(newRange.end); // Minuit est traité comme la fin de la journée

        // Vérifier si l'heure de début est avant l'heure de fin
        if (startMinutes >= endMinutes) {
            toast.error("L'heure de fin doit être postérieure à l'heure de début.");
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
        setIsAddOpen(false); // Fermer le modal si ouvert
        toast.info("Vous devez enregistrer les modifications pour qu'elles soient prises en compte.");
    };

    const updateRange = () => {
        if (selectedRangeIndex === null) return;

        // Exclure la plage actuellement en modification pour la vérification des chevauchements
        const rangesExcludingCurrent = ranges.filter((_, index) => index !== selectedRangeIndex);

        if (isOverlapping(newRange, rangesExcludingCurrent)) {
            toast.error("La plage horaire modifiée se chevauche avec une existante.");
            return;
        }

        const updatedRanges = ranges.map((range, index) => {
            if (index === selectedRangeIndex) {
                return { ...newRange };
            }
            return range;
        });

        setRanges(updatedRanges);
        onRangesChange(updatedRanges);
        setIsEditOpen(false); // Fermer le modal de modification
        toast.info("Modifications enregistrées. N'oubliez pas de sauvegarder.");
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
                            <button onClick={() => openEditModal(index)}><FaArrowRight/></button>
                            <button onClick={() => duplicateRange(range)}><FaCopy/></button>
                            <button onClick={() => removeRange(index)}><FaTrash/></button>
                        </div>
                    </div>
                ))}
            </div>

            <br/>

            <div>



                    <button onClick={()=>{setIsAddOpen(true)}} className={"fr ai-c g0-5 jc-c"}><FaPlus/> Ajouter</button>

                <br/>
            </div>
            <Modal isOpen={isAddOpen} setIsOpen={setIsAddOpen} title={"Ajouter une plage horaire"} onClose={()=>{setIsAddOpen(false)}}>
                <div className={"fc g1 jc-sb fw-w"}>
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
                    <button type={"button"} onClick={addNewRange}>Ajouter</button>
                </div>
            </Modal>
            <Modal isOpen={isEditOpen} setIsOpen={setIsEditOpen} title={"Modifier une plage horaire"} onClose={()=>{setIsEditOpen(false)}}>
                <div className={"fc g1 jc-sb fw-w"}>
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
                    <button type={"button"} onClick={updateRange}>Modifier</button>
                </div>
            </Modal>
        </div>
    );
}

export default TimeRangeSelector;
