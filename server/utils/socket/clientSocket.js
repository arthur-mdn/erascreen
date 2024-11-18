// utils/clientSocket.js
const uuid = require('uuid');
const Screen = require('../../models/Screen');
const socketUtils = require('./socketUtils');
const {updateWeatherData} = require('../weatherUtils');

module.exports = (io, socket) => {
    console.log('Raspberry Pi connected:', socket.id);

    socket.on('associate', async (data) => {
        console.log('Associate event received:', data);
        const {screenId} = data;
        await Screen.findByIdAndUpdate(screenId, {status: "online"});
        await socketUtils.associateScreenSocket(screenId, socket.id);
    });

    socket.on('request_code', async () => {
        const [screenId, debugScreen] = await socketUtils.getScreenId(socket.id);
        try {
            await Screen.findByIdAndUpdate(screenId, {status: "offline"});
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'écran:', error);
        }
        const uniqueCode = uuid.v4();
        await socketUtils.associateSocketWaitingForConfiguration(socket.id, uniqueCode);
        socket.emit('receive_code', uniqueCode);

        await socketUtils.emitSocketListToAllAdmins();
    });

    socket.on('update_weather', async (data) => {
        const {screenId} = data;
        const screen = await Screen.findById(screenId);
        if (screen) {
            try {
                const updatedScreen = await updateWeatherData(screenId, screen.meteo.weatherId);
                await Screen.findByIdAndUpdate(screenId, {status: "online"});
                socket.emit('config_updated', updatedScreen);
            } catch (error) {
                console.error('Erreur lors de la mise à jour de la météo:', error);
            }
        } else {
            console.log('Écran non trouvé dans la base de données', screenId);
            socket.emit('error', 'Écran non trouvé dans la base de données');
        }
    });

    socket.on('update_config', async (data) => {
        console.log('update_config', data);
        try {
            const {screenId} = data;
            const screen = await Screen.findById(screenId);
            if (screen) {
                await socketUtils.associateScreenSocket(screenId, socket.id);
                await Screen.findByIdAndUpdate(screenId, {status: "online"});
                socket.emit('config_updated', screen);
                screen.users.forEach(async (user) => {
                    const socketId = await socketUtils.getAdminSocketId(user.user._id);
                    if (socketId) {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket) {
                            socket.emit('screen_status', {screenId, status: "online"});
                        }
                    }
                });
            } else {
                console.log('Écran non trouvé dans la base de données', screenId);
                socket.emit('error', 'Écran non trouvé dans la base de données');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la configuration:', error);
            socket.emit('error', 'Erreur lors de la récupération de la configuration');
        }
        await socketUtils.emitSocketListToAllAdmins();
    });
    socket.on('client_control_response', async (data) => {
        console.log('client_control_response', data);
        const [screenId, debugScreen] = await socketUtils.getScreenId(socket.id);
        if (screenId) {
            const screen = await Screen.findById(screenId);
            if (screen) {
                screen.users.forEach(async (user) => {
                    const socketId = await socketUtils.getAdminSocketId(user.user._id);
                    if (socketId) {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket) {
                            socket.emit('server_forward_client_response_to_admin', data);
                        }
                    }
                    socketUtils.emitToAllAdmins('server_forward_client_response_to_admin', data);
                });
            }
        }
    });

    socket.on('askDebug', async (screen) => {
        await socketUtils.associateSocketDebug(socket.id, JSON.parse(screen));
        await socketUtils.emitSocketListToAllAdmins();
    });


    socket.on('disconnect', async () => {
        try {
            const screenId = await socketUtils.removeSocketId(socket.id);
            if (screenId) {
                await Screen.findByIdAndUpdate(screenId, {status: "offline"});
                console.log('Screen disconnected:', screenId);
            }
            const screen = await Screen.findById(screenId);
            if (screen) {
                screen.users.forEach(async (user) => {
                    const socketId = await socketUtils.getAdminSocketId(user.user._id);
                    if (socketId) {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket) {
                            socket.emit('screen_status', {screenId, status: "offline"});
                        }
                    }
                });
            }
        } catch (error) {
            console.error('ecran non trouvé', error)
        }
        await socketUtils.emitSocketListToAllAdmins();
    });

    socket.conn.on('pingTimeout', async () => {
        const screenId = await socketUtils.removeSocketId(socket.id);
        if (screenId) {
            await Screen.findByIdAndUpdate(screenId, {status: "offline"});
        }
        await socketUtils.emitSocketListToAllAdmins();
    });
};