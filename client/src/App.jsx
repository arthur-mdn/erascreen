import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import config from './config';
import Screen from './components/Screen';
import {FaCloudDownloadAlt} from "react-icons/fa";

function App() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('connecting');
  const [configData, setConfigData] = useState(null);
  const [showUpdateIcon, setShowUpdateIcon] = useState(false);

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

  const [isDarkModeActive, setIsDarkMode] = useState(false);

  const checkDarkMode = () => {
    if (!configData?.dark_mode?.ranges) {
      setIsDarkMode(false);
      return;
    }

    const currentDateTime = new Date();
    const currentTime = currentDateTime.toTimeString().substr(0, 5); // "HH:MM" format

    const isWithinRange = (range) => {
      const [startHours, startMinutes] = range.start.split(':');
      const [endHours, endMinutes] = range.end.split(':');
      const startTime = new Date(currentDateTime);
      startTime.setHours(startHours, startMinutes, 0, 0);
      const endTime = new Date(currentDateTime);
      endTime.setHours(endHours, endMinutes, 0, 0);

      // Si la fin est le lendemain (ex: 23:00-01:00), ajouter un jour à endTime
      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      return currentDateTime >= startTime && currentDateTime < endTime;
    };

    const isDarkModeActived = configData.dark_mode.ranges.some(isWithinRange);
    setIsDarkMode(isDarkModeActived);

    // Trouver le temps jusqu'à la prochaine activation ou désactivation
    const nextCheckTime = Math.min(
        ...configData.dark_mode.ranges.flatMap(range => {
          const [startHours, startMinutes] = range.start.split(':');
          const [endHours, endMinutes] = range.end.split(':');
          const startTime = new Date(currentDateTime);
          startTime.setHours(startHours, startMinutes, 0, 0);
          const endTime = new Date(currentDateTime);
          endTime.setHours(endHours, endMinutes, 0, 0);

          // Si la fin est le lendemain, ajouter un jour à endTime
          if (endTime <= startTime) {
            endTime.setDate(endTime.getDate() + 1);
          }

          // Si la plage horaire est passée aujourd'hui, ajouter un jour à startTime
          if (startTime < currentDateTime && endTime < currentDateTime) {
            startTime.setDate(startTime.getDate() + 1);
          }

          return [startTime - currentDateTime, endTime - currentDateTime].filter(t => t > 0);
        })
    );

    if (nextCheckTime > 0) {
      setTimeout(checkDarkMode, nextCheckTime);
    }
  };

  useEffect(() => {
    if (configData?.dark_mode?.ranges) {
      checkDarkMode();
    }
    if (configData?.text_slides?.ranges) {
      checkTextSlides();
    }
  }, [configData]);


  const [textSlide, setTextSlide] = useState(null);

  const checkTextSlides = () => {
    if (!configData?.text_slides?.ranges) {
      setTextSlide(null);
      return;
    }

    const currentDateTime = new Date();
    const currentTime = currentDateTime.toTimeString().substr(0, 5); // "HH:MM" format

    const activeSlide = configData.text_slides.ranges.find(range => {
      const [startHours, startMinutes] = range.start.split(':');
      const [endHours, endMinutes] = range.end.split(':');
      const startTime = new Date(currentDateTime);
      startTime.setHours(startHours, startMinutes, 0, 0);
      const endTime = new Date(currentDateTime);
      endTime.setHours(endHours, endMinutes, 0, 0);

      // Ajuster pour la fin le lendemain si nécessaire
      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      return currentDateTime >= startTime && currentDateTime < endTime;
    });

    if (activeSlide) {
      setTextSlide({
        text: activeSlide.text,
        textColor: activeSlide.textColor,
        backgroundColor: activeSlide.backgroundColor,
      });
    } else {
      setTextSlide(null);
    }
  };

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
