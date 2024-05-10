//about/screenRoutes.js
const Screen = require("../models/Screen")
const User = require("../models/User")
const express = require("express");
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const checkUserPermissions = require("../others/checkUserPermissions");
const cityList = require("../datas/villesFR_NoDoubles.json");
const multer = require("multer");
const path = require("path");
const socketUtils = require('../utils/socketUtils');
const axios = require("axios");
const Meteo = require("../models/Meteo");
const { updateWeatherData } = require("../utils/weatherUtils");
const mongoose = require("mongoose");


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


function processScreenObj(screen, currentUserId) {
    const screenObj = screen.toObject();

    // Trouver l'utilisateur et ajuster les permissions
    const user = screen.users.find(user => user.user._id.toString() === currentUserId);
    if (user && user.role === "creator") {
        screenObj.permissions = ["creator"];
    } else {
        screenObj.permissions = user.permissions;
    }

    // Filtrer l'utilisateur actuel de la liste des utilisateurs
    screenObj.users = screenObj.users.filter(user => user.user._id.toString() !== currentUserId);

    // Supprimer les informations sensibles des comptes utilisateurs (password, socketId, birthDate)
    // tout en conservant le "role" et "creation"
    screenObj.users = screenObj.users.map(user => {
        const { password, socketId, birthDate, user: userInfo, ...rest } = user;
        const { _id, email, firstName, lastName } = userInfo; // Ajustez ceci en fonction des champs que vous souhaitez conserver
        return {
            ...rest,
            user: {
                _id,
                email,
                firstName,
                lastName,
                // Incluez explicitement les champs que vous souhaitez conserver
                role: user.role,
                creation: user.creation,
            }
        };
    });

    return screenObj;
}



router.get('/screens', verifyToken,  async (req, res) => {
    const screens = await Screen.find({ "users.user": req.user.userId }).populate('meteo');
    if(screens) {
        res.send({ success: true, screens });
    }else{
        res.status(404).send({ error: 'Aucun écran trouvé' });
    }
});

router.get('/screens/:id', verifyToken,  async (req, res) => {
    const { id } = req.params;
    const screen = await Screen.findOne({ _id: id, "users.user": req.user.userId }).populate('meteo').populate('users.user');
    if (screen) {
        const screenObj = processScreenObj(screen, req.user.userId);
        res.send({ success: true, screenObj });
    } else {
        res.status(404).send({ error: 'Écran non trouvé' });
    }
});

const hasPermission = async (userId, screenId, attribute) => {
    const screen = await Screen.findById(screenId).populate('users.user');
    const user = screen.users.find(u => u.user._id.toString() === userId);
    if (!user) return false;

    // creators have all permissions
    if (user.role === 'creator') return true;

    return user.permissions.includes(attribute);
};

router.post('/screens/update', verifyToken, upload.single('logo'), async (req, res) => {
    const screenId = req.selectedScreen;
    const userId = req.user.userId;
    try {
        let screen = await Screen.findOne({ _id: screenId, "users.user": userId }).populate('meteo');
        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé' });
        }

        if (req.file && req.file.fieldname === 'logo') {
            if (!await hasPermission(userId, screenId, "logo")) {
                return res.status(403).send({ error: 'Permission refusée' });
            }
            screen.logo = `${req.file.path}`;
        }

        const { attribute, value } = req.body;
        if (attribute) {
            if (attribute === "meteo.city") {
                if (!await hasPermission(userId, screenId, "meteo")) {
                    return res.status(403).send({ error: 'Permission refusée' });
                }
                screen = await updateWeatherData(screenId, value);
            } else if (attribute === 'dark_mode') {
                if (!await hasPermission(userId, screenId, "dark_mode")) {
                    return res.status(403).send({ error: 'Permission refusée' });
                }
                if (value && value.ranges) {
                    screen.dark_mode = value;
                }
            } else if (attribute === 'textSlides') {
                if (!await hasPermission(userId, screenId, "text_slides")) {
                    return res.status(403).send({ error: 'Permission refusée' });
                }
                if (value && value.ranges) {
                    screen.text_slides = value;
                }
            } else if (attribute === 'nom') {
                if (!await hasPermission(userId, screenId, "nom")) {
                    return res.status(403).send({ error: 'Permission refusée' });
                }
                if (value) {
                    screen.nom = value;
                }
            } else {
                return res.status(400).send({ error: 'Attribut non pris en charge' });
            }
        }

        const updatedScreen = await screen.save();
        const screenObj = processScreenObj(updatedScreen, userId);
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        res.send({ success: true, screenObj: screenObj });
    } catch (error) {
        console.error('Erreur lors de la mise à jour :', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});


// Suppression d'un écran
router.delete('/screens/', verifyToken, async (req, res) => {
    const screenId = req.selectedScreen

    try {
        const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

        if (!screen) {
            return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
        }

        await Screen.findByIdAndDelete(screenId);

        socketUtils.emitScreenDeletion(screenId);

        res.send({ success: true, message: 'Écran supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'écran:', error);
        res.status(500).send({ error: 'Erreur serveur lors de la suppression de l\'écran' });
    }
});




router.post('/screens/icons', verifyToken, upload.array('icon', 10), checkUserPermissions(["icons"]), async (req, res) => {
    const screenId = req.selectedScreen

    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }

    if (req.files) {
        const iconPaths = req.files.map(file => file.path);
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { $push: { icons: { $each: iconPaths } } }, { new: true }).populate('meteo');
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        const screenObj = processScreenObj(updatedScreen, req.user.userId);
        res.send({ success: true, screen: screenObj });
    } else {
        res.status(400).send({ error: 'Aucun fichier fourni' });
    }
});

router.delete('/screens/icons', verifyToken, checkUserPermissions(["icons"]), async (req, res) => {
    const screenId = req.selectedScreen;

    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');
    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }

    const { iconName } = req.body;

    if (!iconName) {
        return res.status(400).send({ error: 'Paramètres manquants' });
    }

    try {
        screen.icons = screen.icons.filter(icon => icon !== iconName);
        await screen.save();

        socketUtils.emitConfigUpdate(screenId, screen);
        const screenObj = processScreenObj(screen, req.user.userId);
        res.send({ success: true, screenObj });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'icone:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});


router.post('/screens/icons/reorder', verifyToken, checkUserPermissions(["icons"]), async (req, res) => {
    const screenId = req.selectedScreen
    const { newOrder } = req.body;

    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }

    try {
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { 'icons': newOrder }, { new: true }).populate('meteo');
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        const screenObj = processScreenObj(updatedScreen, req.user.userId);
        res.send({ success: true, screen: screenObj });
    } catch (error) {
        console.error('Erreur lors de la réorganisation des icônes:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});


router.post('/screens/directions', verifyToken, checkUserPermissions(["directions"]), async (req, res) => {
    const screenId = req.selectedScreen
    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }
    try {
        const newDirection = req.body;
        screen.directions.push(newDirection);
        await screen.save();
        socketUtils.emitConfigUpdate(screenId, screen);
        const screenObj = processScreenObj(screen, req.user.userId);
        res.send({ success: true, screenObj });
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'une direction:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});

router.delete('/screens/directions/:directionIndex', verifyToken, checkUserPermissions(["directions"]), async (req, res) => {
    const screenId = req.selectedScreen;
    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }
    try {
        screen.directions.splice(req.params.directionIndex, 1);
        await screen.save();
        socketUtils.emitConfigUpdate(screenId, screen);
        const screenObj = processScreenObj(screen, req.user.userId);
        res.send({ success: true, screenObj });
    } catch (error) {
        console.error('Erreur lors de la suppression d\'une direction:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});

router.post('/screens/directions/reorder', verifyToken, checkUserPermissions(["directions"]), async (req, res) => {
    const screenId = req.selectedScreen;
    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }
    try {
        screen.directions = req.body.newOrder;
        await screen.save();
        socketUtils.emitConfigUpdate(screenId, screen);
        const screenObj = processScreenObj(screen, req.user.userId);
        res.send({ success: true, screenObj });
    } catch (error) {
        console.error('Erreur lors de la réorganisation des directions:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});

router.post('/screens/photos', verifyToken, checkUserPermissions(["photos"]), upload.array('photos', 10), async (req, res) => {
    const screenId = req.selectedScreen;
    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }
    if (req.files) {
        const photoPaths = req.files.map(file => file.path);
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { $push: { photos: { $each: photoPaths } } }, { new: true }).populate('meteo');
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        const screenObj = processScreenObj(updatedScreen, req.user.userId);
        res.send({ success: true, screen: screenObj });
    } else {
        res.status(400).send({ error: 'Aucun fichier fourni' });
    }
});

router.delete('/screens/photos', verifyToken, checkUserPermissions(["photos"]), async (req, res) => {
    const screenId = req.selectedScreen;
    const { photoName } = req.body;
    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }
    try {
        screen.photos = screen.photos.filter(photo => photo !== photoName);
        await screen.save();

        socketUtils.emitConfigUpdate(screenId, screen);
        const screenObj = processScreenObj(screen, req.user.userId);
        res.send({ success: true, screenObj });
    } catch (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});


router.post('/screens/photos/reorder', verifyToken, checkUserPermissions(["photos"]), async (req, res) => {
    const screenId = req.selectedScreen;
    const { newOrder } = req.body;
    const screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }

    try {
        const updatedScreen = await Screen.findByIdAndUpdate(screenId, { 'photos': newOrder }, { new: true }).populate('meteo');
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        const screenObj = processScreenObj(updatedScreen, req.user.userId);
        res.send({ success: true, screen: screenObj});
    } catch (error) {
        console.error('Erreur lors de la réorganisation des photos:', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});



router.post('/screens/updateConfig', verifyToken, checkUserPermissions(["config"]), async (req, res) => {
    const screenId = req.selectedScreen;
    const configUpdates = req.body;
    let screen = await Screen.findOne({ _id: screenId, "users.user": req.user.userId }).populate('meteo');

    if (!screen) {
        return res.status(404).send({ error: 'Écran non trouvé ou non autorisé' });
    }
    try {

        for (const key in configUpdates) {
            if (configUpdates.hasOwnProperty(key)) {
                screen.config[key] = configUpdates[key];
            }
        }

        const updatedScreen = await screen.save();
        socketUtils.emitConfigUpdate(screenId, updatedScreen);
        const screenObj = processScreenObj(updatedScreen, req.user.userId);
        res.send({ success: true, screen: screenObj });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la configuration :', error);
        res.status(500).send({ error: 'Erreur serveur' });
    }
});



// Ajouter un utilisateur à un écran
router.post('/screens/users', verifyToken, checkUserPermissions(["allowed_users"]), async (req, res) => {
    const screenId = req.selectedScreen;
    const { userEmail, role, permissions } = req.body;

    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).send({ error: 'Écran non trouvé' });

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).send({ error: 'Utilisateur non trouvé' });

    // Vérifier si l'utilisateur est déjà ajouté
    const isUserAdded = screen.users.some(u => u.user.toString() === user._id.toString());
    if (isUserAdded) return res.status(400).send({ error: 'Utilisateur déjà ajouté' });

    screen.users.push({ user: user._id, role, permissions });
    await screen.save();

    res.send({ success: true, message: 'Utilisateur ajouté avec succès' });
});


// Modifier les permissions d'un utilisateur sur un écran
router.put('/screens/users/:userId', verifyToken, checkUserPermissions(["allowed_users"]), async (req, res) => {
    const { userId } = req.params;
    const screenId = req.selectedScreen;
    const { permissions } = req.body;

    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).send({ error: 'Écran non trouvé' });

    const userIndex = screen.users.findIndex(u => u.user.toString() === userId);
    if (userIndex === -1) return res.status(404).send({ error: 'Utilisateur non trouvé sur cet écran' });

    screen.users[userIndex].permissions = permissions;
    await screen.save();

    res.send({ success: true, message: 'Permissions modifiées avec succès' });
});

// Supprimer un utilisateur d'un écran
router.delete('/screens/users/:userId', verifyToken, checkUserPermissions(["allowed_users"]), async (req, res) => {
    const { userId } = req.params;
    const screenId = req.selectedScreen;

    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).send({ error: 'Écran non trouvé' });

    if (screen.users.find(u => u.user.toString() === userId).role === 'creator') {
        return res.status(403).send({ error: 'Impossible de supprimer le créateur de l\'écran' });
    }

    screen.users = screen.users.filter(u => u.user.toString() !== userId);
    await screen.save();

    res.send({ success: true, message: 'Utilisateur supprimé avec succès' });
});



module.exports = router;