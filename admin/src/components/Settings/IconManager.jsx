import React, {useState} from 'react';
import axios from 'axios';
import config from '../../config';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {useDropzone} from 'react-dropzone';
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";
import {FaTimes} from "react-icons/fa";
import DisplayImage from "../DisplayImage.jsx";

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
                try {
                    const updatedConfWithNewIcons = await uploadIcon(file);
                    setIcons(updatedConfWithNewIcons.icons);
                    onIconsChange(updatedConfWithNewIcons);
                    toast.success("Icône ajouté avec succès !");
                } catch (error) {
                    toast.error("Erreur lors de l'ajout d'un icône");
                }
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout des icônes");
        } finally {
            setIsLoading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': ['.jpeg', '.jpg', '.png', '.gif']}, multiple: true });

    const handleDelete = async (iconId) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`${config.serverUrl}/screens/icons`, {
                data: { iconId },
                withCredentials: true
            });
            setIcons(response.data.screenObj.icons);
            onIconsChange(response.data.screenObj);
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
        <div className={"fc g1 p1"}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable-icons" direction="horizontal">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className={"fr g0-5 ofy-s"}>
                            {icons.map((icon, index) => (
                                <Draggable key={icon._id} draggableId={icon._id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={"fr g0-5 ai-c pr "}
                                        >
                                            <DisplayImage image={icon} alt={`Icon ${index}`} width={'4rem'}/>
                                            <button type={"button"} className={"actionButton quickDel"} onClick={() => handleDelete(icon._id)}>
                                                <FaTimes size={12}/>
                                            </button>
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
        </div>

    );
}

export default IconManager;
