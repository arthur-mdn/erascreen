import config from "../../config.js";
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";

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
            } catch (error) {
                console.error('Erreur lors de la modification :', error);
                toast.error("Erreur lors de la mise à jour de l'image en avant");
            }
        }
    };

    useEffect(() => {
        if (permissions && permissions.length > 0) {
            setAllowedToEdit(permissions.includes("featured_image") || permissions.includes("creator"));
        }
    }, [permissions]);

    return (
        <>
            {allowedToEdit ?
            <>
                <img
                    src={`${config.serverUrl}/${featured_image}`}
                    alt="Screen"
                    onClick={handleImageClick}
                    className={"edit-avilable"}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                    accept="image/*"
                />
            </> :

            <>
                <img
                    src={`${config.serverUrl}/${featured_image}`}
                    alt="Screen"
                />
            </>
            }
        </>
    )
}