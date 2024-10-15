import React, {createContext, useContext, useEffect, useState} from 'react';
import {io} from 'socket.io-client';
import config from './config';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInstance = io(config.serverUrl, {
            reconnectionAttempts: 1500,
            reconnectionDelay: 1000,
            withCredentials: true,
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};