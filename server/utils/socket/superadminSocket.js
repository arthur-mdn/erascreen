// utils/adminSocket.js
const {verify} = require('jsonwebtoken');
const Screen = require('../../models/Screen');
const socketUtils = require('./socketUtils');
const {checkUserPermissionsOfThisScreen} = require('../../others/checkUserPermissions');
const config = require('../../others/config');

module.exports = (io, socket) => {
    const cookies = socket.handshake.headers.cookie || '';
    const sessionToken = cookies.split('; ').find(row => row.startsWith('session_token='))?.split('=')[1];

    if (!sessionToken) {
        console.log('Session token not found, disconnecting');
        socket.disconnect();
        return;
    }

    try {
        const decoded = verify(sessionToken, config.secretKey);
        const userId = decoded.userId;
        console.log('Admin connected:', socket.id, userId);
        socketUtils.associateAdminSocket(userId, socket.id);

        socket.on('adminAskSocketList', async () => {
            console.log('adminAskSocketList from', userId);
            const socketListArray = await socketUtils.getSocketList();
            socket.emit('adminSocketList', socketListArray);
        });

        socket.on('adminAskSocketDetails', async (socketId) => {
            console.log('adminAskSocketDetails from', userId);
            const socketDetails = await socketUtils.getSocketDetails(socketId);
            socket.emit('adminSocketDetails', socketDetails);
        });

        socket.on('adminAskSocketRefresh', async (socketId) => {
            console.log('adminAskSocketRefresh from', userId);
            try {
                const screenSocket = io.sockets.sockets.get(socketId);
                if (screenSocket) {
                    screenSocket.emit('refresh');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des détails de l\'écran:', error);
            }

        });

        socket.on('adminOrderToChangeScreenId', async (data) => {
            const socketId = data.socketId;
            const sockett = (io.sockets.sockets.get(socketId));
            if (!sockett) {
                console.log('SocketId not found');
                return
            }
            try {
                const screen = await Screen.findById(data.newScreenId);
                if (!screen) {
                    console.log('Screen not found');
                    return;
                }
            } catch (error) {
                console.log(error)
            }
            const socket = io.sockets.sockets.get(data.socketId);
            if (socket) {
                socket.emit('adminChangeScreenId', data.newScreenId);
            }

        })

        socket.on('adminOrderToResetScreen', async (data) => {
            console.log('adminOrderToResetScreen', data)
            if (!socketUtils.isSocketConnected(data.socketId)) {
                console.log('SocketId not found');
                return
            }
            const socket = io.sockets.sockets.get(data.socketId);
            if (socket) {
                socket.emit('screen_deleted');
            }
        })

        socket.on('disconnect', async () => {
            console.log(`Admin disconnected: ${userId}`);
            socketUtils.removeAdminSocketId(socket.id);
        });
    } catch (err) {
        console.log('Invalid session token, disconnecting');
        socket.disconnect();
    }
};