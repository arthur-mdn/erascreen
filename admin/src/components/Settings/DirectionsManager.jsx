import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {FaTrash} from "react-icons/fa6";
import Modal from "../Modal.jsx";
import AddDirection from "./AddDirection.jsx";
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";

function DirectionsManager({ screenId, initialDirections, onDirectionsChange }) {
    const [newDirectionOpen, setNewDirectionOpen] = useState(false);
    const [directions, setDirections] = useState(initialDirections || []);

    const [isLoading, setIsLoading] = useState(false);

    const handleAddDirection = (newConfig) => {
        setDirections(newConfig.directions);
        onDirectionsChange(newConfig);
        setNewDirectionOpen(false);
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(directions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/directions/reorder`, { newOrder: items }, { withCredentials: true });
            setDirections(response.data.screen.directions);
            onDirectionsChange(response.data.screen);
            toast.success("Directions réordonnées avec succès !");
        } catch (error) {
            console.error('Erreur lors de la réorganisation des directions:', error);
            toast.error("Erreur lors de la réorganisation des directions");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteDirection = async (directionIndex) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`${config.serverUrl}/screens/directions/${directionIndex}`, { withCredentials: true });
            setDirections(response.data.screen.directions);
            onDirectionsChange(response.data.screen);
            toast.success("Direction supprimée avec succès !");
        } catch (error) {
            console.error('Erreur lors de la suppression d\'une direction:', error);
            toast.error("Erreur lors de la suppression de la direction");
        } finally {
            setIsLoading(false);
        }
    };

    const arrowImages = ['arrow.png', 'arrow_bold.png', 'left-turn.png', 'turn.png'];

    if (isLoading) return (
        <Loading/>
    );

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-directions">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {directions.map((direction, index) => (
                                <Draggable key={index} draggableId={`direction-${index}`} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                ...provided.dragHandleProps.style,
                                                padding:'1rem',
                                                borderRadius:'0.5rem',
                                                backgroundColor:'white',
                                                marginBottom:'1rem'
                                            }}
                                        >
                                            <div className={"fr ai-c jc-sb"}>
                                                <div className={"fr ai-c g1"}>
                                                    <img src={`/elements/arrows/${direction.arrow.style}`} alt="Flèche" style={{ transform: `rotate(${direction.arrow.orientation}deg)`, width: '50px' }} />
                                                    <div>
                                                        <h3 style={{ color: `${direction.title.color}` }}>
                                                            {direction.title.text}
                                                        </h3>
                                                        <p>
                                                            {direction.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button onClick={() => deleteDirection(index)}><FaTrash/></button>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button type={"button"} onClick={() => setNewDirectionOpen(true)}>Ajouter une direction</button>

            <Modal isOpen={newDirectionOpen} title={"Ajouter une direction"} onClose={()=> {setNewDirectionOpen(false)}}>
                <AddDirection
                    screenId={screenId}
                    arrowImages={arrowImages}
                    onDirectionAdd={(newConfig) => {handleAddDirection(newConfig)}}
                />
            </Modal>
        </>
    );
}

export default DirectionsManager;
