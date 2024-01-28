import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {FaTrash} from "react-icons/fa6";
import { useDropzone } from 'react-dropzone';
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";

function IconManager({ screenId, initialIcons, onIconsChange }) {
    const [icons, setIcons] = useState(initialIcons);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const uploadIcon = async (file) => {
        const formData = new FormData();
        formData.append('icon', file);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/icons`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            return response.data.screen;
        } catch (error) {
            console.error('Erreur lors du téléchargement de l\'icone:', error);
            throw error;
        }
    };

    const onDrop = async (acceptedFiles) => {
        setIsLoading(true);

        try {
            for (const file of acceptedFiles) {
                const updatedIcons = await uploadIcon(file);
                setIcons(updatedIcons);
                onIconsChange({ icons: updatedIcons });
            }
            toast.success("Icônes ajoutées avec succès !");
        } catch (error) {
            toast.error("Erreur lors de l'ajout des icônes");
        } finally {
            setIsLoading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*', multiple: true });

    const handleDelete = async (iconName) => {
        console.log(screenId)
        setIsLoading(true);
        try {
            const response = await axios.delete(`${config.serverUrl}/screens/icons`, {
                data: { iconName },
                withCredentials: true
            });
            setIcons(response.data.screen.icons);
            onIconsChange(response.data.screen);
            toast.success("Icône supprimée avec succès !");
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'icone:', error);
            toast.error("Erreur lors de la suppression de l'icône");
        } finally {
            setIsLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(icons);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/icons/reorder`, { newOrder: items }, {
                withCredentials: true
            });
            setIcons(response.data.screen.icons);
            onIconsChange(response.data.screen);
            toast.success("Icônes réordonnées avec succès !");
        } catch (error) {
            console.error('Erreur lors de la réorganisation des icônes:', error);
            toast.error("Erreur lors de la réorganisation des icônes");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return (
        <Loading/>
    );
    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-icons">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {icons.map((icon, index) => (
                                <Draggable key={icon} draggableId={icon} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <img src={`${config.serverUrl}/${icon}`} alt={`Icon ${index}`} style={{width:'50px'}} />
                                            <button onClick={() => handleDelete(icon)}><FaTrash/></button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <div style={{ marginTop: '20px' }}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div {...getRootProps()} style={{ marginTop: '20px', border: '2px dashed #ccc', padding: '10px', textAlign: 'center' }}>
                    <input type={"file"} {...getInputProps()} />
                    Glissez et déposez des icônes ici, ou cliquez pour sélectionner des icônes
                </div>
            </div>
        </>

    );
}

export default IconManager;
