import React, {Fragment, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import './App.css';
import config from './config';
import Screen from './components/Screen';
import {FaArrowCircleDown, FaCloud, FaCloudDownloadAlt, FaSlash} from "react-icons/fa";
import useDarkMode from './hooks/useDarkMode';
import useTextSlides from './hooks/useTextSlides';
import {QRCodeCanvas} from 'qrcode.react';
import {FaArrowRotateLeft, FaKeyboard, FaLocationDot, FaMobileScreenButton, FaRightToBracket} from "react-icons/fa6";
import Pub from "./components/Pub.jsx";
import { cacheImages, deleteDatabases } from "./utils/cacheUtils";

function App() {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('connecting');
    const [configData, setConfigData] = useState(null);
    const [showUpdateIcon, setShowUpdateIcon] = useState(false);
    const [showOffline, setShowOffline] = useState(false);
    const isDarkModeActive = useDarkMode(configData);
    const textSlide = useTextSlides(configData);
    const [error, setError] = useState(null);
    const [showIdentify, setShowIdentify] = useState(false);
    const identifyTimerRef = useRef(null);

    useEffect(() => {
        let savedConfig = localStorage.getItem('screenConfig');
        const socket = io(`${config.serverUrl}`, {
            reconnectionAttempts: 1500, reconnectionDelay: 1000,
        });

        let intervalId;

        socket.on('connect', () => {
            setShowOffline(false);
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                setStatus('updating_config');
                console.log('Updating config...')
                socket.emit('update_config', {screenId: parsedConfig._id});
                // if meteo weatherId is set, update weather data
                if (parsedConfig.meteo && parsedConfig.meteo.weatherId){
                    socket.emit('update_weather', {screenId: parsedConfig._id});
                    if (!intervalId) {
                        intervalId = setInterval(() => {
                            console.log("refreshing weather");
                            socket.emit('update_weather', {screenId: parsedConfig._id});
                        }, 3600000); // 3600000 ms = 1 heure
                    }
                }
            } else {
                setStatus('requesting_code');
                socket.emit('request_code');
            }
        });

        socket.on('config_updated', async (updatedConfig) => {
            localStorage.setItem('screenConfig', JSON.stringify(updatedConfig));
            setConfigData(updatedConfig);
            console.log('Config updated:', updatedConfig)
            setStatus('configured');
            setShowUpdateIcon(true);
            setTimeout(() => setShowUpdateIcon(false), 5000);

            if (!intervalId) {
                intervalId = setInterval(() => {
                    console.log("refreshing weather");
                    socket.emit('update_weather', {screenId: parsedConfig._id});
                }, 3600000); // 3600000 ms = 1 heure
            }
        });

        socket.on('receive_code', (uniqueCode) => {
            setCode(uniqueCode);
            setStatus('code_received');
        });

        socket.on('associate', (data) => {
            localStorage.setItem('screenConfig', JSON.stringify(data));
            window.location.reload();
        });

        socket.on('screen_deleted', async () => {
            localStorage.removeItem('screenConfig');
            setConfigData(null);
            savedConfig = null;
            setStatus('requesting_code');
            socket.emit('request_code');
            setShowUpdateIcon(true);
            setTimeout(() => setShowUpdateIcon(false), 5000);
            await deleteDatabases();
        });

        socket.on('disconnect', () => {
            if (savedConfig) {
                setConfigData(JSON.parse(savedConfig));
                setStatus('configured');
                console.log('Disconnected, but using saved config');
                setShowOffline(true);
            } else {
                setStatus('disconnected');
            }
        });

        socket.on('connect_error', () => {
            if (savedConfig) {
                if(!configData){
                    setConfigData(JSON.parse(savedConfig));
                    setStatus('configured');
                }
                console.log('Connect error, but using saved config');
                setShowOffline(true);
            } else {
                setStatus('connection_failed');
            }
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            setStatus('error');
            setError(error);
        })

        socket.on('server_send_control_to_client', async (data) => {
            console.log('server_send_control_to_client', data);
            let availableCommands = [];
            let defaultValues = {};
            let appVersion = null;

            try {
                const response = await fetch('http://localhost:3002');
                if (response.ok) {
                    const data = await response.json();
                    availableCommands = data.availableCommands;
                    defaultValues = data.defaultValues;
                    appVersion = data.appVersion;

                    if (appVersion && availableCommands.length > 0) {
                        console.log('Advanced commands available, app version:', appVersion);
                    } else {
                        console.log('App version not found, using basic commands');
                    }
                } else {
                    console.error('Failed to fetch from localhost:3002, response status:', response.status);
                }
            } catch (error) {
                console.error('Error while fetching localhost:3002:', error);
            }

            if(!availableCommands.includes('refresh')){
                availableCommands.push('refresh');
            }
            if (!availableCommands.includes('identify')) {
                availableCommands.push('identify');
            }

            if (data.command === 'getAvailableCommands') {
                socket.emit('client_control_response', {commandId : data.commandId, command: data.command, response: "Commands retrieved", appVersion, availableCommands, defaultValues});
            } else if (data.command === 'refresh') {
                socket.emit('client_control_response', {commandId : data.commandId, response: 'Refreshing...'});
                window.location.reload();
            } else if (data.command === 'identify') {
                socket.emit('client_control_response', {commandId : data.commandId, response: 'Identifying...'});
                identify();
            } else if (data.command === 'reboot') {
                if (!availableCommands.includes('reboot')) {
                    socket.emit('client_control_response', {commandId : data.commandId, error: 'Advanced commands not available'});
                    return;
                }
                socket.emit('client_control_response', {commandId : data.commandId, response: 'Rebooting...'});
                const response = await fetch('http://localhost:3002/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({command: 'reboot'}),
                });
            } else if (data.command === 'shutdown') {
                if (!availableCommands.includes('shutdown')) {
                    socket.emit('client_control_response', {commandId : data.commandId, error: 'Advanced commands not available'});
                    return;
                }
                socket.emit('client_control_response', {commandId : data.commandId, response: 'Shutting down...'});
                const response = await fetch('http://localhost:3002/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({command: 'shutdown'}),
                });
            } else if (data.command === 'update') {
                if (!availableCommands.includes('update')) {
                    socket.emit('client_control_response', {commandId : data.commandId, error: 'Advanced commands not available'});
                    return;
                }
                const response = await fetch('http://localhost:3002/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({command: 'update'}),
                });
                const responseData = await response.json();
                socket.emit('client_control_response', {commandId : data.commandId, response: responseData.message});
            } else if (data.command === 'brightness') {
                if (!availableCommands.includes('brightness')) {
                    socket.emit('client_control_response', {commandId : data.commandId, error: 'Brightness command not available'});
                    return;
                }
                const response = await fetch('http://localhost:3002/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({command: 'brightness', value: data.value}),
                });
                const responseData = await response.json();
                socket.emit('client_control_response', {commandId : data.commandId, response: responseData.message, valueConfirmed: responseData.valueConfirmed});
            } else {
                socket.emit('client_control_response', {commandId : data.commandId, error: 'Command not found'});
            }
        })
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            socket.disconnect();
        };
    }, []);

    const identify = () => {
        const audio = new Audio('/elements/sounds/find-sound.mp3');
        audio.play().catch((err) => console.error('Audio play failed:', err));

        if (identifyTimerRef.current) {
            clearTimeout(identifyTimerRef.current);
        }

        setShowIdentify(true);

        identifyTimerRef.current = setTimeout(() => {
            setShowIdentify(false);
        }, 11000);
    };

    const renderContent = () => {
        console.log("render", status)
        switch (status) {
            case 'connecting':
                return <div className={"fc ai-c g1"}>
                    <img src={"/elements/icons/wifi-connecting.svg"} style={{width: "8rem"}}/>
                    <p>Connexion au serveur...</p>
                </div>;
            case 'connection_failed':
                return <div className={"fc ai-c g1"}>
                    <img src={"/elements/icons/wifi-error.svg"} style={{width:"8rem"}}/>
                    <p>Impossible de se connecter au serveur. Veuillez vérifier votre connexion.</p>
                    <button type={"button"} onClick={() => {
                        window.location.reload();
                    }}>
                        <FaArrowRotateLeft/>
                        Réessayer
                    </button>
                </div>;
            case 'requesting_code':
                return <p>Récupération d'un code à usage unique...</p>;
            case 'code_received':
                return (<div className={"fc g0-5 ai-c jc-c p1"}>

                <img src={"/elements/logo.svg"} style={{height: "4rem", marginBottom:"1rem", marginRight:"auto"}}/>

                    <div className={"fc ai-c g1"}>
                        <QRCodeCanvas value={`${config.adminUrl}/screens/add/${code}`} size={512} style={{maxWidth:"100%", height:'auto', width:'35vh'}}/>
                        <h1 style={{fontWeight: "bold", userSelect: "all"}}>{code}</h1>
                    </div>

                    <div style={{padding: "1rem"}} className={"fc g1"}>
                        <div className={" fr ai-c g1 bg-white p1 br0-5 ta-l"}>
                            <FaMobileScreenButton size={'2rem'} style={{flexShrink: 0}}/>
                            <div>
                                Scannez le QRCode avec votre appareil mobile pour associer cet écran à votre compte DisplayHub.
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
                                Cliquez sur Choisir un écran, ensuite sur Ajouter un écran, et saisissez manuellement le code pour associer cet écran à votre compte DisplayHub.
                            </div>
                        </div>
                    </div>

                </div>);
            case 'configured':
                return (<>
                    {showUpdateIcon &&
                        <div className={"iconIndicator p0-5 br0-5 of-h"} style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            margin: '1rem',
                            zIndex: 9999,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <div className={""} style={{position: "relative", width: "32px", height: "32px"}}>
                                <FaCloudDownloadAlt size={'2rem'}/>
                            </div>
                        </div>
                    }
                    {showOffline &&
                        <div className={"p0-5 br0-5 of-h"} style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            margin: '1rem',
                            zIndex: 9999,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <div className={""} style={{position:"relative", width:"32px", height:"32px"}}>
                                <FaCloud size={'2rem'} style={{color: "#d8d8d8"}}/>
                                <FaSlash size={'2rem'} style={{color: "white", position: "absolute", top: 0, right: 0}}/>
                            </div>
                        </div>
                    }
                    {showIdentify && <div className="fc g4 identify-overlay">
                        <div className={"identify-progress"}>
                            <div></div>
                        </div>
                        <div className="outer-circle">
                            <div className="green-scanner"></div>
                        </div>
                        <h1 style={{fontSize:"2.5rem", color:"black"}} className={"fw-b"}>Identification de l'écran</h1>
                        <div className={"g1 fr p1 shadow bg-white br0-5"}>
                            <img src={`${config.serverUrl}/${configData.featured_image}`} style={{width: "6rem", borderRadius:'0.5rem'}}/>
                            <div className={"fc g0-5 ai-fs"}>
                                <h2 style={{fontSize: "2rem", color:"black"}} className={"fw-b"}>{configData.name}</h2>
                                <p style={{color:"black"}}>{configData._id}</p>
                            </div>
                        </div>
                    </div>}
                    <Screen configData={configData}/>
                    <Pub displayTime={12000} animationTime={2000} intervalTime={18000} />
                    </>);
            case 'disconnected':
                return <p>Connexion perdue. Tentative de reconnexion...</p>;
            case 'error':
                return <>
                    <p>{`Une erreur s'est produite. ${error} `}</p>
                    <button type={"button"} onClick={() => {
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
