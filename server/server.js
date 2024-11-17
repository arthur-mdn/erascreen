require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const uuid = require('uuid');
const cityList = require('./datas/villesFR_NoDoubles.json');
const socketUtils = require('./utils/socketUtils');

const Screen = require('./models/Screen');
const Image = require('./models/Image');
const authRoutes = require('./routes/authRoutes');
const screenRoutes = require('./routes/screenRoutes');
const apiRoutes = require('./routes/apiRoutes');
const config = require('./others/config');
const database = require('./others/database');
const verifyToken = require("./others/verifyToken");
const {updateWeatherData} = require("./utils/weatherUtils");
const {verify} = require("jsonwebtoken");
const {checkUserPermissionsOfThisScreen} = require("./others/checkUserPermissions");
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
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));


// set all screens "offline"
Screen.updateMany({}, {status: "offline"})
    .then(() => console.log("Tous les écrans sont maintenant hors ligne"))
    .catch((error) => console.error("Erreur lors de la mise à jour des écrans:", error));

async function emitToAllAdmins(message, data) {
    const adminSocketList = await socketUtils.getAdminSocketList();
    Object.keys(adminSocketList).forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.emit(message,data);
        }
    })
}

async function emitSocketListToAllAdmins() {
    const socketListArray = await socketUtils.getSocketList();
    await emitToAllAdmins('adminSocketList', socketListArray);
}

io.on('connection', async (socket) => {
    const origin = socket.handshake.headers.origin;
    const cookies = socket.handshake.headers.cookie || '';
    const sessionToken = cookies.split('; ').find(row => row.startsWith('session_token='))?.split('=')[1];
    // ip address console.log(socket.handshake.address)
    if (origin === config.clientUrl) {
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
            await emitSocketListToAllAdmins();
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
                console.log('Écran non trouvé dans la base de données', screenId)
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
                    console.log('Écran non trouvé dans la base de données', screenId)
                    socket.emit('error', 'Écran non trouvé dans la base de données');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de la configuration:', error);
                socket.emit('error', 'Erreur lors de la récupération de la configuration');
            }
            await emitSocketListToAllAdmins();
        });

        socket.on('client_control_response', async (data) => {
            console.log('client_control_response', data);
            const [screenId, debugScreen] = await socketUtils.getScreenId(socket.id);
            if (screenId) {
                const screen = await Screen.findById(screenId);
                if (screen) {
                    console.log('screen.users', screen.users);
                    screen.users.forEach(async (user) => {
                        const socketId = await socketUtils.getAdminSocketId(user.user._id);
                        if (socketId) {
                            const socket = io.sockets.sockets.get(socketId);
                            if (socket) {
                                socket.emit('server_forward_client_response_to_admin', data);
                            }
                        }
                        emitToAllAdmins('server_forward_client_response_to_admin', data);
                    });
                }
            }
        });

        socket.on('askDebug', async (screen) => {
            await socketUtils.associateSocketDebug(socket.id, JSON.parse(screen));
            await emitSocketListToAllAdmins();
        })

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
            await emitSocketListToAllAdmins();
        });

        socket.conn.on('pingTimeout', async () => {
            const screenId = await socketUtils.removeSocketId(socket.id);
            if (screenId) {
                await Screen.findByIdAndUpdate(screenId, {status: "offline"});
            }
        });

    } else if (origin === config.adminUrl) {

        if (!sessionToken) {
            console.log('Session token not found, disconnecting');
            socket.disconnect();
            return;
        }

        try {
            const decoded = verify(sessionToken, config.secretKey);
            const userId = decoded.userId;
            console.log('Admin connected:', socket.id, userId);
            await socketUtils.associateAdminSocket(userId, socket.id);

            const screens = await Screen.find();
            screens.forEach(screen => {
                socket.emit('screen_status', {screenId: screen._id, status: screen.status});
            });

            socket.on('admin_request_client_control', async (data) => {
                console.log('admin_request_client_control', data);
                const {screenId, command, commandId, value} = data;
                const screen = await Screen.findById(screenId);

                const permissionGranted = await checkUserPermissionsOfThisScreen("control", screenId, userId);

                if (!permissionGranted) {
                    socket.emit('server_forward_client_response_to_admin', {commandId, error: 'Permission refusée'});
                    return;
                }

                if (screen) {
                    const socketId = socketUtils.getSocketId(screenId);
                    if (socketId) {
                        const screenSocket = io.sockets.sockets.get(socketId);
                        if (screenSocket) {
                            screenSocket.emit('server_send_control_to_client', {command, commandId, value});
                        } else {
                            socket.emit('server_forward_client_response_to_admin', {
                                commandId,
                                error: 'Écran non connecté'
                            });
                        }
                    } else {
                        console.log('Screen not connected');
                        socket.emit('server_forward_client_response_to_admin', {
                            commandId,
                            error: 'Écran non connecté'
                        });
                    }
                } else {
                    console.log('Screen not found');
                    socket.emit('server_forward_client_response_to_admin', {commandId, error: 'Écran non trouvé'});
                }
            });

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

                if(!sockett){
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
                console.log('adminOrderToResetScreen',data)

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
                const socketId = socketUtils.getAdminSocketId(userId);
                console.log('disco', socketId)
                if (socketId) {
                    console.log(await socketUtils.getAdminSocketList())
                    await socketUtils.removeAdminSocketId(socketId);
                    console.log('removes')
                    console.log(await socketUtils.getAdminSocketList())
                }
            });

        } catch (err) {
            console.log('Invalid session token, disconnecting');
            socket.disconnect();
        }

    } else {
        console.log('Unknown origin:', origin);
        socket.disconnect();
    }
});


app.post('/associate-screen', verifyToken, async (req, res) => {
    const {code} = req.body;

    try {
        // Vérifier si un écran est déjà associé à ce code
        const existingScreen = await Screen.findOne({code});
        if (existingScreen) {
            return res.status(400).send({error: 'Ce code est déjà associé à un écran.'});
        }

        const socketId = socketUtils.getSocketIdWithThisAssociationCode(code);
        if (socketId) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
                const defaultLogo = await Image.findOne({system: 'default-logo'});
                const newScreen = new Screen({
                    code,
                    users: [{user: req.user.userId, role: "creator"}],
                    logo: defaultLogo._id
                });
                await newScreen.save();

                // Associer l'écran et émettre l'événement
                const screen = await Screen.findById(newScreen._id).populate('users.user');

                socket.emit('associate', screen);
                res.send({success: true, screen: screen, message: 'Écran associé avec succès.'});
            } else {
                res.status(500).send({error: 'Connexion socket non trouvée'});
            }
        } else {
            res.status(404).send({error: 'Code non trouvé'});
        }
    } catch (error) {
        console.error('Erreur lors de l\'association de l\'écran:', error);
        res.status(500).send({error: 'Erreur serveur'});
    }
});


app.get('/autocomplete/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    if (query.length < 2) {
        return res.json([]);
    }

    const filteredCities = cityList
        .filter(city =>
            city.name.toLowerCase().replace(/\s+/g, '-').startsWith(query.replace(/\s+/g, '-')) &&
            city.country === 'FR'
        )
        .map(city => ({id: city.id, name: city.name, country: city.country}));

    res.json(filteredCities);
});


app.use((err, req, res, next) => {
    if (err) {
        res.status(400).json({error: err.message});
    } else {
        next();
    }
});

server.listen(config.port, () => {
    console.log('Server started on port ' + config.port);
});