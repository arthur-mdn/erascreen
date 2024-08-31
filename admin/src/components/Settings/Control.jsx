import React, { useEffect, useState } from "react";
import { useSocket } from "../../SocketContext.jsx";
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import {FaPowerOff, FaSatellite, FaSatelliteDish} from "react-icons/fa";
import {FaLocationDot, FaRotate, FaRotateLeft} from "react-icons/fa6";

export default function Control({ screen }) {
    const socket = useSocket();
    const [buttonStates, setButtonStates] = useState({});
    const [availableCommands, setAvailableCommands] = useState(null);
    const [actualScreenStatus, setActualScreenStatus] = useState(screen.status);

    const commands = {
        refresh: {
            title: "Recharger la page",
            icon: <FaRotateLeft />,
            command: "refresh",
            type: "basic"
        },
        identify: {
            title: "Identifier l'écran",
            icon: <FaLocationDot />,
            command: "identify",
            type: "basic"
        },
        shutdown: {
            title: "Éteindre l'écran",
            icon: <FaPowerOff />,
            command: "shutdown",
            type: "advanced"
        },
        reboot: {
            title: "Redémarrer l'écran",
            icon: <FaRotate />,
            command: "reboot",
            type: "advanced"
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('server_forward_client_response_to_admin', (data) => {
                console.log('server_forward_client_response_to_admin', data);
                if (data.commandId) {
                    setButtonStates(prevState => ({
                        ...prevState,
                        [data.commandId]: false
                    }));

                    if (data.response) {
                        toast.success(`Command successful: ${data.response}`);
                    } else if (data.error) {
                        toast.error(`Command failed: ${data.error}`);
                    }
                }
            });

            return () => {
                socket.off('server_forward_client_response_to_admin');
            };
        }
    }, [socket]);

    const sendControlCommand = (command) => {
        const commandId = uuidv4();
        setButtonStates(prevState => ({
            ...prevState,
            [commandId]: true
        }));

        const payload = {
            screenId: screen._id,
            command,
            commandId
        };
        console.log('admin_request_client_control', payload);
        socket.emit('admin_request_client_control', payload);
    };

    useEffect(() => {
        const commandId = uuidv4();
        setButtonStates(prevState => ({
            ...prevState,
            [commandId]: true
        }));

        socket.emit('admin_request_client_control', {
            screenId: screen._id,
            command: 'getAvailableCommands',
            commandId
        });

        socket.on('server_forward_client_response_to_admin', (data) => {
            if (data.commandId === commandId) {
                setAvailableCommands(data.response || 'basic');
                setButtonStates(prevState => ({
                    ...prevState,
                    [commandId]: false
                }));
            }
        });

        socket.on('screen_status', (updatedScreen) => {
            if (updatedScreen.screenId === screen._id) {
                setActualScreenStatus(updatedScreen.status);
            }
        });

        return () => {
            socket.off('server_forward_client_response_to_admin');
        };
    }, [socket, screen._id]);

    const isCommandAvailable = (commandType) => {
        if (availableCommands === null) {
            return false;
        }
        if (availableCommands === 'advanced') {
            return true;
        }
        return commandType === 'basic';
    };

    return (
        <div className={"p1 fc g0-5"}>
            <div className={"fc g0-5 card ai-c"}>
                <FaSatelliteDish size={30}/>
                <div className={`fr g0-5 ai-c`}>
                    <div className={`${screen.status}`}>
                    </div>
                    <span className={`${screen.status}`}>
                                        {screen.status === "online" ? "Connecté" : "Hors ligne"}
                                    </span>
                </div>
            </div>

            <div className={"fc g0-5"}>
                <h2>Contrôles basiques</h2>
                <div className={"fr g0-5"}>
                    {Object.entries(commands)
                        .filter(([key, command]) => command.type === 'basic')
                        .map(([key, command]) => (
                            <button
                                key={key}
                                type={"button"}
                                onClick={() => sendControlCommand(command.command)}
                                disabled={buttonStates[key] || !isCommandAvailable(command.type) || actualScreenStatus !== 'online'}
                            >
                                {command.icon}
                                {command.title}
                            </button>
                        ))}
                </div>
            </div>
            <div className={"fc g0-5"}>
                <h2>Contrôles avancés</h2>
                {availableCommands === 'basic' && (
                    <p style={{color:"red", fontWeight:'bold'}}>Les contrôles avancés ne sont pas disponibles pour cet écran.</p>
                )}
                <div className={"fr g0-5"}>
                    {Object.entries(commands)
                        .filter(([key, command]) => command.type === 'advanced')
                        .map(([key, command]) => (
                            <button
                                key={key}
                                type={"button"}
                                onClick={() => sendControlCommand(command.command)}
                                disabled={buttonStates[key] || !isCommandAvailable(command.type) || actualScreenStatus !== 'online'}
                            >
                                {command.icon}
                                {command.title}
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}