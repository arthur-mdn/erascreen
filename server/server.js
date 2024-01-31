require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const uuid = require('uuid');
const cityList = require('./datas/villesFR_NoDoubles.json');
const socketUtils = require('./utils/socketUtils');

const Screen = require('./models/Screen');
const authRoutes = require('./routes/authRoutes');
const screenRoutes = require('./routes/screenRoutes');
const config = require('./others/config');
const database = require('./others/database');
const verifyToken = require("./others/verifyToken");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.clientUrl,
        credentials: true
    }
});
socketUtils.setIo(io);

app.use(bodyParser.json());
app.use(cookieParser({
    sameSite: 'none',
    secure: true
}));
app.use(cors((req, callback) => {
    const allowedOrigins = [config.clientUrl, config.adminUrl];
    let corsOptions;

    if (allowedOrigins.includes(req.header('Origin'))) {
        corsOptions = { origin: true, credentials: true };
    } else {
        corsOptions = { origin: false };
    }

    callback(null, corsOptions);
}));


database.connect();

app.use(authRoutes);
app.use(screenRoutes);
app.use('/uploads', express.static('uploads'));

const activeSockets = {};

io.on('connection', (socket) => {
    console.log('Raspberry Pi connected:', socket.id);

    socket.on('associate', async (data) => {
        const { screenId } = data;
        socketUtils.associateScreenSocket(screenId,socket.id);
    });

    socket.on('request_code', () => {
        const uniqueCode = uuid.v4();
        activeSockets[uniqueCode] = socket.id;
        socket.emit('receive_code', uniqueCode);
        console.log('Unique code sent:', uniqueCode);
    });

    socket.on('update_config', async (data) => {
        try {
            const { screenId } = data;

            const screen = await Screen.findById(screenId).populate('meteo');
            if (screen) {
                socketUtils.associateScreenSocket(screenId, socket.id);
                socket.emit('config_updated', screen);
            } else {
                socket.emit('error', 'Écran non trouvé dans la base de données');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la configuration:', error);
            socket.emit('error', 'Erreur lors de la récupération de la configuration');
        }
    });

    socket.on('disconnect', () => {
       socketUtils.removeSocketId(socket.id);
    });
});


app.post('/associate-screen', verifyToken,  async (req, res) => {
    const { code } = req.body;

    const socketId = activeSockets[code];
    if (socketId) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            const newScreen = new Screen({ code, user: req.user.userId });
            await newScreen.save();

            const screen = await Screen.findOne({ code, user: req.user.userId });

            socket.emit('associate', screen);
            res.send({ success: true, screen: screen, message: 'Écran associé avec succès.' });
        } else {
            res.status(500).send({ error: 'Connexion socket non trouvée' });
        }
    } else {
        res.status(404).send({ error: 'Code non trouvé' });
    }
});

app.get('/autocomplete/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    if (query.length < 2) {
        return res.json([]);
    }

    const filteredCities = cityList
        .filter(city => city.name.toLowerCase().startsWith(query) && city.country === 'FR')
        .map(city => ({ id: city.id, name: city.name, country: city.country }));

    res.json(filteredCities);
});


app.use((err, req, res, next) => {
    if (err) {
        res.status(400).json({ error: err.message });
    } else {
        next();
    }
});

server.listen(config.port, () => {
    console.log('Server started on port ' + config.port );
});