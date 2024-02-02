import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import config from './config';
import Screen from './components/Screen';
import {FaCloudDownloadAlt} from "react-icons/fa";
import useDarkMode from './hooks/useDarkMode';
import useTextSlides from './hooks/useTextSlides';
import {QRCodeCanvas, QRCodeSVG} from 'qrcode.react';

function App() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('connecting');
  const [configData, setConfigData] = useState(null);
  const [showUpdateIcon, setShowUpdateIcon] = useState(false);
  const isDarkModeActive = useDarkMode(configData);
  const textSlide = useTextSlides(configData);

  useEffect(() => {
    const savedConfig = localStorage.getItem('screenConfig');
    const socket = io(`${config.serverUrl}`, {
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    let intervalId;

    socket.on('connect', () => {
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setStatus('updating_config');
        console.log('Updating config...')
        socket.emit('update_config', { screenId: parsedConfig._id });

        socket.emit('update_weather', { screenId: parsedConfig._id });

        if (!intervalId) {
          intervalId = setInterval(() => {
            console.log("refreshing weather");
            socket.emit('update_weather', { screenId: parsedConfig._id });
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

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      socket.disconnect();
    };
  }, []);

  const renderContent = () => {
    console.log(`${config.adminUrl}/add/${code}`)
    switch (status) {
      case 'connecting':
        return <p>Connexion au serveur...</p>;
      case 'connection_failed':
        return <p>Impossible de se connecter au serveur. Veuillez vérifier votre connexion.</p>;
      case 'requesting_code':
        return <p>Récupération d'un code à usage unique...</p>;
      case 'code_received':
        return (
          <div className={"fc g1 ai-c jc-c"}>
            <h2>Scannez le QRCode pour associer cet écran à votre compte</h2>
            <QRCodeCanvas value={`https://${config.adminUrl}/add/${code}`} size={512}/>
            <h2>Ou saisissez manuellement le code suivant</h2>
            <h1 style={{fontWeight:"bold", userSelect:"all"}}>{code}</h1>
          </div>
        );
      case 'configured':
        return (
            <>
              {showUpdateIcon &&
                  <div style={{position:"absolute", top:0, right:0, margin:'1rem', zIndex: 9999}}>
                    <FaCloudDownloadAlt size={'2rem'}/>
                  </div>
              }
              <Screen configData={configData}/>
            </>
          );
      case 'disconnected':
        return <p>Connexion perdue. Tentative de reconnexion...</p>;
      default:
        return <p>État inconnu</p>;
    }
  }

  return (
      <div className={`App`}>
        {
          (configData && isDarkModeActive) &&
            <style>
              {
                `
                body, html, #root{
                  background-color: rgb(32, 35, 37);
                }
                .card{
                  color: white;
                  background-color: rgb(24, 26, 27);
                }
                img[alt="Flèche"]{
                  filter: invert(1);
                }
              `
              }
            </style>
        }
        {renderContent()}

        {(configData && textSlide) && (
            <div className="messagedefilant" style={{ backgroundColor: textSlide.backgroundColor, color: textSlide.textColor }}>
              <div>
                {textSlide.text + " " + textSlide.text} {/* Duplication du texte */}
              </div>
              <style>
                {
                  `
                .messagedefilant div {
                  animation: scrollText ${textSlide.slideTime / 2}s linear infinite;
                }
              `
                }
              </style>
            </div>
        )}

      </div>
  );
}

export default App;
