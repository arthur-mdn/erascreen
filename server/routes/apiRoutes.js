const verifyToken = require("../others/verifyToken");
const Screen = require("../models/Screen");
const express = require("express");
const router = express.Router();
const Image = require("../models/Image");

router.get('/api/defaultIcons', verifyToken, async (req, res) => {
    try {
        const defaultIcons = await Image.find({system: 'default-icon', type: 'icon'});
        if (defaultIcons) {
            res.send({success: true, defaultIcons});
        } else {
            res.status(404).send({error: 'Aucun icône par défaut trouvé'});
        }
    } catch (error) {
        console.error('Error getting default icons:', error);
        res.status(500).json({error: 'Erreur lors de la récupération des icônes par défaut'});
    }
});

module.exports = router;
