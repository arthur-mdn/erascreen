import config from "../../config.js";
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {FaTimes} from "react-icons/fa";
import DisplayImage from "../DisplayImage.jsx";

export default function FeaturedImage({featured_image, permissions, onSave}) {
    const [allowedToEdit, setAllowedToEdit] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('featured_image', file);

            try {
                const response = await axios.post(`${config.serverUrl}/screens/update`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                });

                onSave(response.data.screenObj);
                toast.success("Image en avant mise à jour avec succès !");
                fileInputRef.current.value = '';
            } catch (error) {
                console.error('Erreur lors de la modification :', error);
                toast.error("Erreur lors de la mise à jour de l'image en avant");
            }
        }
    };

    const handleImageDelete = async () => {
        try {
            const response = await axios.post(`${config.serverUrl}/screens/update`, {
                featured_image: "DELETE-FEATURED-IMAGE"
            }, {
                withCredentials: true
            });

            onSave(response.data.screenObj);
            toast.success("Image en avant supprimée avec succès !");
            fileInputRef.current.value = '';
        } catch (error) {
            console.error('Erreur lors de la suppression :', error);
            toast.error("Erreur lors de la suppression de l'image en avant");
        }
    }

    useEffect(() => {
        if (permissions && permissions.length > 0) {
            setAllowedToEdit(permissions.includes("featured_image") || permissions.includes("creator"));
        }
    }, [permissions]);
    return (
        <>
            {allowedToEdit ?
                <div className={"pr"}>
                    <div onClick={handleImageClick} className={"edit-avilable"}>
                        <DisplayImage image={featured_image} />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{display: 'none'}}
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    {
                        featured_image.system !== "default-featured-image" &&
                        <button type={"button"} className={"actionButton quickDel"} onClick={handleImageDelete}>
                            <FaTimes size={12}/>
                        </button>
                    }
                </div> :
                <>
                    <DisplayImage image={featured_image} />
                </>
            }
        </>
    )
}