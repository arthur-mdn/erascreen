require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const socketUtils = require('./utils/socket/socketUtils');
const clientSocket = require('./utils/socket/clientSocket');
const adminSocket = require('./utils/socket/adminSocket');
const superadminSocket = require('./utils/socket/superadminSocket');

const Screen = require('./models/Screen');
const authRoutes = require('./routes/authRoutes');
const screenRoutes = require('./routes/screenRoutes');
const apiRoutes = require('./routes/apiRoutes');
const defaultRoutes = require('./routes/defaultRoutes');
const config = require('./others/config');
const database = require('./others/database');
const initDatabase = require("./others/initDatabase");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [config.clientUrl, config.adminUrl],
        credentials: true
    },
    pingInterval: 10000,
    pingTimeout: 5000
});
socketUtils.setIo(io);

app.use(bodyParser.json());

app.use(cors((req, callback) => {
    const allowedOrigins = [config.clientUrl, config.adminUrl];
    let corsOptions;

    if (allowedOrigins.includes(req.header('Origin'))) {
        corsOptions = {origin: true, credentials: true};
    } else {
        corsOptions = {origin: false};
    }

    callback(null, corsOptions);
}));

app.use(cookieParser({
    sameSite: 'none',
    secure: true
}));

database.connect();
initDatabase();

app.use(authRoutes);
app.use(screenRoutes);
app.use(apiRoutes);
app.use(defaultRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

io.on('connection', (socket) => {
    const origin = socket.handshake.headers.origin;

    if (origin === process.env.CLIENT_URL) {
        clientSocket(io, socket);
    } else if (origin === process.env.ADMIN_URL) {
        adminSocket(io, socket);
        superadminSocket(io, socket);
    } else {
        console.log('Unknown origin:', origin);
        socket.disconnect();
    }
});

server.listen(config.port, () => {
    console.log('Server started on port ' + config.port);
});