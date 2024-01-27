// utils/socketUtils.js
let io = null;
const screenSocketMap = {};

const setIo = (newIo) => {
    io = newIo;
};

const emitConfigUpdate = (screenId, updatedScreen) => {
    const socketId = getSocketId(screenId);
    if (socketId && io.sockets.sockets.get(socketId)) {
        io.to(socketId).emit('config_updated', updatedScreen);
    }
};

const associateScreenSocket = (screenId, socketId) => {
    screenSocketMap[screenId] = socketId;
};

const getSocketId = (screenId) => {
    return screenSocketMap[screenId];
};

const removeSocketId = (socketId) => {
    for (const screenId in screenSocketMap) {
        if (screenSocketMap[screenId] === socketId) {
            delete screenSocketMap[screenId];
            break;
        }
    }
};

module.exports = { setIo, emitConfigUpdate, associateScreenSocket, removeSocketId };
