import React, {Fragment, useEffect, useState} from 'react';
import {io} from 'socket.io-client';
import './App.css';
import config from './config';
import Screen from './components/Screen';
import {FaCloudDownloadAlt} from "react-icons/fa";
import useDarkMode from './hooks/useDarkMode';
import useTextSlides from './hooks/useTextSlides';
import {QRCodeCanvas} from 'qrcode.react';
import {FaKeyboard, FaMobileScreenButton, FaRightToBracket} from "react-icons/fa6";

function App() {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('connecting');
    const [configData, setConfigData] = useState(null);
    const [showUpdateIcon, setShowUpdateIcon] = useState(false);
    const isDarkModeActive = useDarkMode(configData);
    const textSlide = useTextSlides(configData);
    const [error, setError] = useState(null);

    useEffect(() => {
        const savedConfig = localStorage.getItem('screenConfig');
        const socket = io(`${config.serverUrl}`, {
            reconnectionAttempts: 3, reconnectionDelay: 1000,
        });

        let intervalId;

        socket.on('connect', () => {
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                setStatus('updating_config');
                console.log('Updating config...')
                socket.emit('update_config', {screenId: parsedConfig._id});

                socket.emit('update_weather', {screenId: parsedConfig._id});

                if (!intervalId) {
                    intervalId = setInterval(() => {
                        console.log("refreshing weather");
                        socket.emit('update_weather', {screenId: parsedConfig._id});
                    }, 3600000); // 3600000 ms = 1 heure
                }
            } else {
                setStatus('requesting_code');
                socket.emit('request_code');
            }
        });

        socket.on('config_updated', (updatedConfig) => {
            localStorage.setItem('screenConfig', JSON.stringify(updatedConfig));
            setConfigData(updatedConfig);
            console.log('Config updated:', updatedConfig)
            setStatus('configured');
            setShowUpdateIcon(true);
            setTimeout(() => setShowUpdateIcon(false), 5000);
        });

        socket.on('receive_code', (uniqueCode) => {
            setCode(uniqueCode);
            setStatus('code_received');
        });

        socket.on('associate', (data) => {
            localStorage.setItem('screenConfig', JSON.stringify(data));
            window.location.reload();
        });

        socket.on('screen_deleted', () => {
            localStorage.removeItem('screenConfig');
            setConfigData(null);
            setStatus('requesting_code');
            socket.emit('request_code');
            setShowUpdateIcon(true);
            setTimeout(() => setShowUpdateIcon(false), 5000);
        });

        socket.on('disconnect', () => {
            if (savedConfig) {
                setConfigData(JSON.parse(savedConfig));
                setStatus('configured');
                setShowUpdateIcon(true);
                setTimeout(() => setShowUpdateIcon(false), 5000);
            } else {
                setStatus('disconnected');
            }
        });

        socket.on('connect_error', () => {
            if (savedConfig) {
                setConfigData(JSON.parse(savedConfig));
                setStatus('configured');
                setShowUpdateIcon(true);
                setTimeout(() => setShowUpdateIcon(false), 5000);
            } else {
                setStatus('connection_failed');
            }
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            setStatus('error');
            setError(error);
        })
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            socket.disconnect();
        };
    }, []);

    const renderContent = () => {
        console.log(status)
        switch (status) {
            case 'connecting':
                return <p>Connexion au serveur...</p>;
            case 'connection_failed':
                return <p>Impossible de se connecter au serveur. Veuillez vérifier votre connexion.</p>;
            case 'requesting_code':
                return <p>Récupération d'un code à usage unique...</p>;
            case 'code_received':
                return (<div className={"fc g0-5 ai-c jc-c"}>
                        <div className={"fc ai-c g1"}>
                            <h1>Associer cet écran à votre compte DisplayHub</h1>
                            <QRCodeCanvas value={`${config.adminUrl}/add/${code}`} size={512}/>
                            <h1 style={{fontWeight: "bold", userSelect: "all"}}>{code}</h1>
                        </div>


                        <div style={{padding: "1rem"}} className={"fc g1"}>
                            <div className={" fr ai-c g1 bg-white p1 br0-5 ta-l"}>
                                <FaMobileScreenButton size={'2rem'} style={{flexShrink: 0}}/>
                                <div>
                                    Scannez le QRCode avec votre appareil mobile pour associer cet écran à votre compte
                                    DisplayHub.
                                </div>
                            </div>
                            Ou
                            <div className={"fr ai-c g1 bg-white p1 br0-5 ta-l"}>
                                <FaRightToBracket size={'2rem'} style={{flexShrink: 0}}/>
                                <div>
                                    Connectez vous à votre compte sur <a href={`${config.adminUrl}`}
                                                                         style={{color: "#0b1dea"}}>{config.adminUrl}</a>
                                </div>
                            </div>
                            <div className={"fr ai-c g1 bg-white p1 br0-5 ta-l"}>
                                <FaKeyboard size={'2rem'} style={{flexShrink: 0}}/>
                                <div>
                                    Ouvre le sélecteur d'écran, cliquez sur Ajouter un écran, et saisissez manuellement
                                    le code pour associer cet écran à votre compte DisplayHub.
                                </div>
                            </div>
                        </div>

                    </div>);
            case 'configured':
                return (<>
                        {showUpdateIcon &&
                            <div style={{position: "absolute", top: 0, right: 0, margin: '1rem', zIndex: 9999}}>
                                <FaCloudDownloadAlt size={'2rem'}/>
                            </div>}
                        <Screen configData={configData}/>
                    </>);
            case 'disconnected':
                return <p>Connexion perdue. Tentative de reconnexion...</p>;
            case 'error':
                return <>
                    <p>{`Une erreur s'est produite. ${error} `}</p>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}>Réinitialiser les données locales
                    </button>
                </>;
            default:
                return <p>État inconnu</p>;
        }
    }

    return (<div className={`App`}>
            {(configData && isDarkModeActive) && <style>
                {`
                body, html, #root{
                  color: white;
                  background-color: rgb(32, 35, 37);
                }
                .card{
                  color: white;
                  background-color: rgb(24, 26, 27);
                }
                img[alt="Flèche"]{
                  filter: invert(1);
                }
              `}
            </style>}
            {renderContent()}

            {(configData && textSlide) && (<div className="messagedefilant"
                                                style={{
                                                    backgroundColor: textSlide.backgroundColor,
                                                    color: textSlide.textColor
                                                }}>
                    <div>
                        {textSlide.text + " " + textSlide.text} {/* Duplication du texte */}
                    </div>
                    <style>
                        {`
                .messagedefilant div {
                  animation: scrollText ${textSlide.slideTime / 2}s linear infinite;
                }
              `}
                    </style>
                </div>)}

        </div>);
}

export default App;
