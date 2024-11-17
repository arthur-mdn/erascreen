// utils/socketUtils.js
const Screen = require("../models/Screen");
let io = null;
const socketMap = {};
const adminSocketMap = {};

const setIo = (newIo) => {
    io = newIo;
};

const emitConfigUpdate = (screenId, updatedScreen) => {
    const socketId = getSocketId(screenId);
    if (socketId && io.sockets.sockets.get(socketId)) {
        io.to(socketId).emit('config_updated', updatedScreen);
    }
};
const emitScreenDeletion = (screenId) => {
    const socketId = getSocketId(screenId);
    if (socketId && io.sockets.sockets.get(socketId)) {
        io.to(socketId).emit('screen_deleted');
    }
};

const associateScreenSocket = (screenId, socketId) => {
    socketMap[socketId] = {screenId, added: Date.now()};
};

const associateSocketDebug = (socketId, debugScreen) => {
    socketMap[socketId] = {screenId: debugScreen._id, debugScreen, added: Date.now()};
}

const associateSocketWaitingForConfiguration = (socketId, associationCode) => {
    socketMap[socketId] = {associationCode, added: Date.now()};
}

const associateAdminSocket = (adminId, socketId) => {
    adminSocketMap[socketId] = adminId;
}

const getAdminSocketId = (adminId) => {
    for (const socketId in adminSocketMap) {
        if (adminSocketMap[socketId] === adminId.toString()) {
            return socketId;
        }
    }
    return null;
}

const getAdminId = (socketId) => {
    return adminSocketMap[socketId] ?? null;
}

const removeAdminSocketId = (socketId) => {
    if(adminSocketMap[socketId]){
        const adminId = adminSocketMap[socketId];
        delete adminSocketMap[socketId];
        return adminId
    }
    return null;
}

const getSocketId = (lookingForThisScreenId) => {
    for (const socketId in socketMap) {
        if (socketMap[socketId].screenId === lookingForThisScreenId) {
            return socketId;
        }
    }
    return null;
};

const getScreenId = (lookingForThisSocketId) => {
    if (!socketMap[lookingForThisSocketId]) {
        return [null, null];
    }
    const screenId = socketMap[lookingForThisSocketId].screenId ?? null;
    const debugScreen = socketMap[lookingForThisSocketId].debugScreen ?? null;
    return [screenId, debugScreen];
};

const removeSocketId = (socketId) => {
    if(socketMap[socketId]){
        const [screenId, debugScreen] = getScreenId(socketId);
        delete socketMap[socketId];
        return screenId
    }
    return null;
};

const getScreenSocketMap = () => {
    return socketMap;
}

const isSocketConnected = (socketId) => {
    if (socketMap[socketId]) {
        return true;
    }
    return false;
}

const getSocketIdWithThisAssociationCode = (associationCode) => {
    for (const socketId in socketMap) {
        if (socketMap[socketId].associationCode === associationCode) {
            return socketId;
        }
    }
    return null;
}

async function getSocketList() {
    let socketList = getScreenSocketMap();
    const socketListArray = []
    for (const socketId in socketList) {
        const socketDetails = await getSocketDetails(socketId);
        socketListArray.push(socketDetails);
    }
    return socketListArray;
}

async function getAdminSocketList() {
    let socketList = adminSocketMap;
    const socketListArray = []
    for (const socketId in socketList) {
        socketListArray[socketId] = socketList[socketId];
    }
    return socketListArray;
}

async function getSocketDetails(socketId) {
    if (!socketMap[socketId]){
        return false;
    }
    const [screenId, debugScreen] = getScreenId(socketId);

    if (debugScreen) {
        return {socketId, debugScreen, added: socketMap[socketId].added};
    }
    if(socketMap[socketId].associationCode){
        return {socketId, associationCode: socketMap[socketId].associationCode, added: socketMap[socketId].added};
    }
    try {
        const screen = await Screen.findById(screenId).populate('users.user');
        return {socketId, screen, added: socketMap[socketId].added};
    } catch (error) {
        return {socketId, screen: {name: 'Écran inconnu', status: 'offline', added: socketMap[socketId].added}};
    }
}


module.exports = { setIo, emitConfigUpdate, associateScreenSocket, associateSocketDebug, associateSocketWaitingForConfiguration, isSocketConnected, removeSocketId, getScreenId, getSocketId, emitScreenDeletion, getScreenSocketMap, getSocketList, getSocketDetails, getSocketIdWithThisAssociationCode, associateAdminSocket, getAdminSocketId, getAdminId, removeAdminSocketId, getAdminSocketList };
