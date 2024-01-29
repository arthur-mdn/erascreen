import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {FaTrash} from "react-icons/fa6";
import { useDropzone } from 'react-dropzone';
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";

function PhotosManager({ screenId, initialPhotos, onPhotosChange }) {
    const [photos, setPhotos] = useState(initialPhotos);
    const [isLoading, setIsLoading] = useState(false);
    const uploadPhoto = async (file) => {
        const formData = new FormData();
        formData.append('photos', file);

        try {
            const response = await axios.post(`${config.serverUrl}/screens/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            return response.data.screen;
        } catch (error) {
            console.error('Erreur lors du téléchargement de la photo:', error);
            throw error;
        }
    };

    const onDrop = async (acceptedFiles) => {
        setIsLoading(true);

        try {
            for (const file of acceptedFiles) {
                try {
                    const updatedConfWithNewPhotos = await uploadPhoto(file);
                    setPhotos(updatedConfWithNewPhotos.photos);
                    onPhotosChange(updatedConfWithNewPhotos);
                    toast.success("Photo ajoutée avec succès !");
                } catch (error) {
                    toast.error("Erreur lors de l'ajout d'une photo");
                }
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout des photos");
        } finally {
            setIsLoading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': ['.jpeg', '.jpg', '.png', '.gif']}, multiple: true });

    const handleDelete = async (photoName) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`${config.serverUrl}/screens/photos`, {
                data: { photoName },
                withCredentials: true
            });
            setPhotos(response.data.screen.photos);
            onPhotosChange(response.data.screen);
            toast.success("Photo supprimée avec succès !");
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo:', error);
            toast.error("Erreur lors de la suppression de la photo");
        } finally {
            setIsLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        setIsLoading(true);

        const items = Array.from(photos);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        try {
            const response = await axios.post(`${config.serverUrl}/screens/photos/reorder`, { newOrder: items }, {
                withCredentials: true
            });
            setPhotos(response.data.screen.photos);
            onPhotosChange(response.data.screen);
            toast.success("Photos réordonnées avec succès !");
        } catch (error) {
            console.error('Erreur lors de la réorganisation des photos:', error);
            toast.error("Erreur lors de la réorganisation des photos");
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
                <Droppable droppableId="droppable-photos">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {photos.map((icon, index) => (
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
                <div {...getRootProps()} style={{ marginTop: '20px', border: '2px dashed #ccc', padding: '10px', textAlign: 'center' }}>
                    <input type={"file"} {...getInputProps()} />
                    Glissez et déposez des photos ici, ou cliquez pour sélectionner des photos
                </div>
            </div>
        </>

    );
}

export default PhotosManager;
