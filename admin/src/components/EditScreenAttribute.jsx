import React, {useEffect, useState} from 'react';
import axios from "axios";
import config from "../config.js";
import {useDropzone} from "react-dropzone";
import Loading from "./Loading.jsx";
import { toast } from 'react-toastify';
import {FaLocationDot, FaLocationPin, FaMapPin} from "react-icons/fa6";

function EditScreenAttribute({ screen, screenId, attribute, value, onSave, inputType = "text" }) {
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState([]);

    const infosAboutAttribute = {
        "name": {
            label: "Nom de l'écran",
            inputType: "text"
        },
        "logo": {
            label: "Logo",
            inputType: "file"
        },
        "meteo.city": {
            label: "Configurez la ville souhaitée pour le widget météo",
            inputType: "text"
        }
    }
    useEffect(() => {
        if (attribute === 'meteo.city' && inputValue.length >= 2) {
            axios.get(`${config.serverUrl}/autocomplete/${inputValue}`)
                .then(res => setSuggestions(res.data))
                .catch(err => console.error('Erreur d\'autocomplétion:', err));
        }
    }, [inputValue, attribute]);
    const selectCity = async (city) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/update`, {
                attribute,
                value: city
            }, {
                withCredentials: true
            });
            onSave(response.data.screenObj);
            toast.success("Ville mise à jour avec succès !");
        } catch (error) {
            console.error('Erreur lors de la modification :', error);
            toast.error("Erreur lors de la mise à jour de la ville");
        } finally {
            setIsLoading(false);
        }
    };

    const resetMeteo = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/update`, {
                attribute,
                value: ''
            }, {
                withCredentials: true
            });
            onSave(response.data.screenObj);
            toast.success("Ville supprimée avec succès !");
        } catch (error) {
            console.error('Erreur lors de la modification :', error);
            toast.error("Erreur lors de la suppression de la ville");
        } finally {
            setIsLoading(false);
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append(attribute, file);
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            onSave(response.data.screenObj);
            toast.success("Logo mis à jour avec succès !");
        } catch (error) {
            console.error('Erreur lors de la modification :', error);
            toast.error("Erreur lors de la mise à jour du logo");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSaveText = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/update`, {
                attribute,
                value: inputValue
            }, {
                withCredentials: true
            });
            onSave(response.data.screenObj);
            toast.success("Valeur mise à jour avec succès !");
        } catch (error) {
            console.error('Erreur lors de la modification :', error);
            toast.error("Erreur lors de la mise à jour de la valeur");
        } finally {
            setIsLoading(false);
        }
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append(attribute, file);
        setIsLoading(true);
        try {
            const response = await axios.post(`${config.serverUrl}/screens/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            onSave(response.data.screenObj);
            toast.success("Logo mis à jour avec succès !");
        } catch (error) {
            console.error('Erreur lors du téléchargement :', error);
            toast.error("Erreur lors de la mise à jour du logo");
        } finally {
            setIsLoading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': ['.jpeg', '.jpg', '.png', '.gif']} });

    if (isLoading) return (
        <Loading/>
    );

    if ( attribute === 'meteo.city' ) {
        return (
            <div className={"p1"}>
                {
                    infosAboutAttribute[attribute].label
                }
                {screen.meteo && (
                    <button type={"button"} onClick={resetMeteo}>Supprimer la météo</button>
                )}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Recherchez une ville..."
                />
                {suggestions.length > 0 && (
                    <div className={"city-suggestions"}>
                        {suggestions.map((suggestion, index) => (
                            <div key={index} onClick={() => selectCity(suggestion.id)} className={"city-suggestion"}>
                                <FaLocationDot/> <div>{suggestion.name}, {suggestion.country}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    if (attribute === 'logo') {
        return (
            <div className={"p1"}>
                <label>
                    { infosAboutAttribute[attribute].label }
                </label>
                {
                    value && (
                        <div>
                            <img src={`${config.serverUrl}/${value}`} alt="Image actuelle" style={{width:'150px'}} />
                        </div>
                    )
                }
                <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '10px', textAlign: 'center' }}>
                    <input {...getInputProps()} />
                    Glissez et déposez le logo ici, ou cliquez pour sélectionner un fichier
                </div>
            </div>

        );
    }
    return (
        <div className={"fc g1 p1"}>
            {
                infosAboutAttribute[attribute].label
            }
            {inputType === "file" ? (
                <>
                    {
                        value && (
                            <div>
                                <img src={`${config.serverUrl}/${value}`} alt="Image actuelle" style={{width:'150px'}} />
                            </div>
                        )
                    }
                    <input type="file" onChange={handleFileChange} />
                </>
            ) : (
                <>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleTextChange}
                    />
                    <button type={"button"} onClick={handleSaveText}>Enregistrer</button>

                </>

            )}
        </div>
    );
}
export default EditScreenAttribute;


