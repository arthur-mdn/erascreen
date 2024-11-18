// routes/defaultRoutes.js
const Screen = require("../models/Screen");
const express = require("express");
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const cityList = require("../datas/villesFR_NoDoubles.json");
const socketUtils = require('../utils/socket/socketUtils');
const Image = require("../models/Image");


router.post('/associate-screen', verifyToken, async (req, res) => {
    const {code} = req.body;

    try {
        // Vérifier si un écran est déjà associé à ce code
        const existingScreen = await Screen.findOne({code});
        if (existingScreen) {
            return res.status(400).send({error: 'Ce code est déjà associé à un écran.'});
        }

        const socketId = socketUtils.getSocketIdWithThisAssociationCode(code);
        if (socketId) {
            const socket = socketUtils.getSocketObject(socketId);
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
                await socketUtils.emitMessageToSocket(socketId, 'associate', screen);
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


router.get('/autocomplete/:query', (req, res) => {
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


router.use((err, req, res, next) => {
    if (err) {
        res.status(400).json({error: err.message});
    } else {
        next();
    }
});


module.exports = router;