import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import config from './config';
import Screen from './components/Screen';
import {FaCloudDownloadAlt} from "react-icons/fa";
import useDarkMode from './hooks/useDarkMode';
import useTextSlides from './hooks/useTextSlides';

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

    socket.on('connect', () => {
      if (savedConfig) {
        const { _id } = JSON.parse(savedConfig);
        setStatus('updating_config');
        console.log('Updating config...')
        socket.emit('update_config', { screenId: _id });
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
      socket.disconnect();
    };
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'connecting':
        return <p>Connexion au serveur...</p>;
      case 'connection_failed':
        return <p>Impossible de se connecter au serveur. Veuillez vérifier votre connexion.</p>;
      case 'requesting_code':
        return <p>Récupération d'un code à usage unique...</p>;
      case 'code_received':
        return <div><p>Votre code unique: {code}</p></div>;
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
            isDarkModeActive &&
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

        {textSlide && (
            <div style={{
              color: textSlide.textColor,
              backgroundColor: textSlide.backgroundColor,
              // Autres styles pour le texte défilant
            }}>
              {textSlide.text}
            </div>
        )}
      </div>
  );
}

export default App;
