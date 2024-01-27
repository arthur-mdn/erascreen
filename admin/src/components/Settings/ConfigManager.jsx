import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";

function ConfigManager({ screenId, initialConfig, onConfigChange }) {
    const [currentConfig, setCurrentConfig] = useState(initialConfig);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (key, value) => {
        const updatedConfig = { ...currentConfig, [key]: value };
        setCurrentConfig(updatedConfig);

        setIsLoading(true);
        axios.post(`${config.serverUrl}/screens/${screenId}/updateConfig`, { [key]: value }, {
            withCredentials: true
        })
            .then(response => {
                if (response.data.success) {
                    onConfigChange(response.data.screen);
                    toast.success(`${key} mis à jour avec succès !`);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour de la configuration :', error);
                toast.error(`Erreur lors de la mise à jour de ${key}`);
            })
            .finally(() => setIsLoading(false));
    };

    if (isLoading) return (
        <Loading/>
    );

    return (
        <div>
            {Object.keys(currentConfig).map((key) => {
                const value = currentConfig[key];

                if (key === 'photos_interval') {
                    return (
                        <div key={key}>
                            <label htmlFor={key}>{key} (1-60)</label>
                            <input
                                type="range"
                                id={key}
                                min="1"
                                max="60"
                                value={value}
                                onChange={(e) => setCurrentConfig({ ...currentConfig, [key]: parseInt(e.target.value) })}
                                onMouseUp={(e) => handleInputChange(key, parseInt(e.target.value))}
                                onTouchEnd={(e) => handleInputChange(key, parseInt(e.target.value))}
                            />
                            <span>{value}</span>
                        </div>
                    );
                }

                return (
                    <div key={key}>
                        <label>{key}</label>
                        {typeof value === 'boolean' ? (
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleInputChange(key, e.target.checked)}
                            />
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ConfigManager;
