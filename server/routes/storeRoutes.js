const Ticket = require("../models/Ticket");
const express = require("express");
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const Price = require("../models/Price");

router.get('/store/prices', verifyToken, async (req, res) => {
    try {
        const prices = await Price.find({});
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});

router.post('/store/buy', verifyToken, async (req, res) => {
    const profileId = req.cookies['selectedScreen'];
    try {
        const panier = req.body.panier;
        let ticketsToCreate = [];

        for (let item of panier) {
            const priceItem = await Price.findById(item.id);
            if (!priceItem) {
                return res.status(404).json({ message: `Article non trouvé: ${item.id}` });
            }

            const numberOfTickets = item.quantity * (priceItem.multiple || 1);

            for (let i = 0; i < numberOfTickets; i++) {
                ticketsToCreate.push({
                    profileId: profileId,
                    priceId: item.id
                });
            }
        }

        await Ticket.insertMany(ticketsToCreate);
        res.json({ message: 'Achat réussi', tickets: ticketsToCreate });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});

module.exports = router;