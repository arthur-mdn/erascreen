import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {FaTrash} from "react-icons/fa6";
import Modal from "../Modal.jsx";
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";

function AddDirection({ arrowImages, screenId, onDirectionAdd }) {
    const [isLoading, setIsLoading] = useState(false);
    const [newDirection, setNewDirection] = useState({
        arrow: { style: 'arrow.png', orientation: '0' },
        title: { color: '#000000', text: '' },
        description: ''
    });

    const addDirection = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/directions`, newDirection, {
                withCredentials: true
            });
            if (response.data.success) {
                onDirectionAdd(response.data.screen);
                toast.success("Direction ajoutée avec succès !");
            } else {
                toast.error("Erreur lors de l'ajout de la direction");
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'une direction:', error);
            toast.error("Erreur lors de l'ajout de la direction");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return (
        <Loading/>
    );

    return (
        <>
            <div>
                <label>Flèche :</label>
                <select value={newDirection.arrow.style} onChange={(e) => setNewDirection({ ...newDirection, arrow: { ...newDirection.arrow, style: e.target.value }})}>
                    {arrowImages.map((image, index) => (
                        <option key={index} value={image}>{image}</option>
                    ))}
                </select>
                <img src={`/elements/arrows/${newDirection.arrow.style}`} alt="Aperçu de la flèche" style={{ transform: `rotate(${newDirection.arrow.orientation}deg)`, width:'50px' }} />
            </div>
            <div>
                <label>Orientation :</label>
                <input type="range" min="0" max="360" value={newDirection.arrow.orientation} onChange={(e) => setNewDirection({ ...newDirection, arrow: { ...newDirection.arrow, orientation: e.target.value }})} />
            </div>
            <div>
                <label style={{ color: `${newDirection.title.color}` }}>Titre :</label>
                <input type="text" value={newDirection.title.text} onChange={(e) => setNewDirection({ ...newDirection, title: { ...newDirection.title, text: e.target.value }})} style={{ color: `${newDirection.title.color}` }} />
                <label>Couleur du titre:</label>
                <input type="color" value={newDirection.title.color} onChange={(e) => setNewDirection({ ...newDirection, title: { ...newDirection.title, color: e.target.value }})} />
            </div>

            <label>Description :</label>
            <textarea style={{minHeight:'60px', resize:"vertical", maxHeight:'140px'}} required value={newDirection.description} onChange={(e) => setNewDirection({ ...newDirection, description: e.target.value })}></textarea>

            <button onClick={() => addDirection(newDirection)}>Ajouter la direction</button>
        </>
    );
}

export default AddDirection;
