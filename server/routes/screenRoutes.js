//routes/screenRoutes.js
const Screen = require("../models/Screen")
const express = require("express");
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const cityList = require("../datas/villesFR_NoDoubles.json");
const multer = require("multer");
const path = require("path");
const socketUtils = require('../utils/socketUtils');
const axios = require("axios");

async function updateWeatherData(screenId, city) {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const encodedCity = encodeURIComponent(city);
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric&lang=fr`;
        const weatherResponse = await axios.get(url);
        const weatherData = weatherResponse.data;
        const screen = await Screen.findById(screenId);
        if (!screen) {
            throw new Error('Écran non trouvé');
        }
        screen.meteo = screen.meteo || {};
        screen.meteo.date = Date.now();
        screen.meteo.city = city;
        screen.meteo.data = weatherData;

        return await screen.save();
    } catch (error) {
        console.error('Erreur lors de la mise à jour des données météo:', error);
        throw error;
    }
}

const imageFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Seuls les fichiers image sont autorisés!'), false);
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: imageFilter
});


router.get('/screens', verifyToken,  async (req, res) => {
    const screens = await Screen.find({ user: req.user.userId });
    if(screens) {
        res.send({ success: true, screens });
    }else{
        res.status(404).send({ error: 'Aucun écran trouvé' });
    }
});

router.get('/screens/:id', verifyToken,  async (req, res) => {
    const { id } = req.params;
    const screen = await Screen.findOne({ _id: id, user: req.user.userId });
    if(screen) {
        const screenObj  = screen.toObject();

        res.send({ success: true, screenObj });
    }else{
        res.status(404).send({ error: 'Écran non trouvé' });
    }
});



router.post('/screens/update', verifyToken, upload.single('logo'), async (req, res) => {
    const screenId = req.selectedScreen

    try {
        let screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }

        if (req.file && req.file.fieldname === 'logo') {
            screen.logo = `${req.file.path}`;
        }

        const { attribute, value } = req.body;
        if (attribute) {
            if (attribute === "meteo.city") {
                screen = await updateWeatherData(screenId, value);
            } else if (attribute === 'dark_mode') {
                if (value && value.ranges) {
                    screen.dark_mode = value;
                }
            } else {
                screen[attribute] = value;
            }
        }

        const updatedScreen = await screen.save();
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        res.send({ success: true, screenObj: updatedScreen });
    } catch (error) {
        console.error('Erreur lors de la mise à jour :', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});



router.post('/screens/icons', verifyToken, upload.array('icon', 10), async (req, res) => {
    const screenId = req.selectedScreen
    if (req.files) {
        const iconPaths = req.files.map(file => file.path);
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { $push: { icons: { $each: iconPaths } } }, { new: true });
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        res.send({ success: true, screen: updatedScreen });
    } else {
        res.status(400).send({ error: 'Aucun fichier fourni' });
    }
});

router.delete('/screens/icons', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen;
    const { iconName } = req.body;

    if (!screenId || !iconName) {
        return res.status(400).send({ error: 'Paramètres manquants' });
    }

    try {
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }

        screen.icons = screen.icons.filter(icon => icon !== iconName);
        await screen.save();

        socketUtils.emitConfigUpdate(screenId, screen);
        res.send({ success: true, screen });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'icone:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});


router.post('/screens/icons/reorder', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen
    const { newOrder } = req.body;

    try {
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { 'icons': newOrder }, { new: true });
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        res.send({ success: true, screen: updatedScreen });
    } catch (error) {
        console.error('Erreur lors de la réorganisation des icônes:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});


router.post('/screens/directions', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen
    try {
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }
        const newDirection = req.body;
        screen.directions.push(newDirection);
        await screen.save();
        socketUtils.emitConfigUpdate(screenId, screen);
        res.send({ success: true, screen });
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'une direction:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});

router.delete('/screens/directions/:directionIndex', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen
    try {
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }
        screen.directions.splice(req.params.directionIndex, 1);
        await screen.save();
        socketUtils.emitConfigUpdate(screenId, screen);
        res.send({ success: true, screen });
    } catch (error) {
        console.error('Erreur lors de la suppression d\'une direction:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});

router.post('/screens/directions/reorder', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen
    try {
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }
        screen.directions = req.body.newOrder;
        await screen.save();
        socketUtils.emitConfigUpdate(screenId, screen);
        res.send({ success: true, screen });
    } catch (error) {
        console.error('Erreur lors de la réorganisation des directions:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});

router.post('/screens/photos', verifyToken, upload.array('photos', 10), async (req, res) => {
    const screenId = req.selectedScreen
    if (req.files) {
        const photoPaths = req.files.map(file => file.path);
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { $push: { photos: { $each: photoPaths } } }, { new: true });
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        res.send({ success: true, screen: updatedScreen });
    } else {
        res.status(400).send({ error: 'Aucun fichier fourni' });
    }
});

router.delete('/screens/photos', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen
    const { photoName } = req.body;

    try {
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }

        screen.photos = screen.photos.filter(photo => photo !== photoName);
        await screen.save();

        socketUtils.emitConfigUpdate(screenId, screen);
        res.send({ success: true, screen });
    } catch (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});


router.post('/screens/photos/reorder', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen
    const { newOrder } = req.body;

    try {
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { 'photos': newOrder }, { new: true });
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        res.send({ success: true, screen: updatedScreen });
    } catch (error) {
        console.error('Erreur lors de la réorganisation des photos:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});



router.post('/screens/updateConfig', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen
    const configUpdates = req.body;

    try {
        let screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }

        for (const key in configUpdates) {
            if (configUpdates.hasOwnProperty(key)) {
                screen.config[key] = configUpdates[key];
            }
        }

        const updatedScreen = await screen.save();
        socketUtils.emitConfigUpdate(screenId, updatedScreen);

        res.send({ success: true, screen: updatedScreen });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la configuration :', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});



module.exports = router;