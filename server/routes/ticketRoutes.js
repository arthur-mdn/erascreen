const Profile = require("../models/Profile");
const Ticket = require("../models/Ticket");
const express = require("express");
const router = express.Router();
const verifyToken = require('../others/verifyToken');
const TicketUsage = require("../models/TicketUsage");
let ticketLocks = {};

function parseDuration(durationString) {
    const [amount, unit] = durationString.split(' ');
    switch (unit) {
        case 'hour':
        case 'hours':
            return amount * 60 * 60 * 1000;
        case 'day':
        case 'days':
            return amount * 24 * 60 * 60 * 1000;
        default:
            return 0;
    }
}

router.post('/tickets/use', verifyToken, async (req, res) => {
    const { ticketId, scanData } = req.body;

    if (ticketLocks[ticketId]) {
        return res.status(429).json({ message: 'Ce ticket est actuellement en cours de traitement' });
    }
    ticketLocks[ticketId] = true;

    try {
        const ticket = await Ticket.findById(ticketId).populate('priceId').populate({
            path: 'usages',
            options: { sort: { 'date': -1 } }
        });
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        if (ticket.usages.length >= ticket.priceId.maxUse) {
            return res.status(400).json({ message: 'Limite d\'utilisation du ticket atteinte' });
        }

        if (ticket.usages.length > 0) {
            const lastUsageTime = new Date(ticket.usages[0].date).getTime();
            const currentTime = new Date().getTime();
            if (currentTime - lastUsageTime < 1000) {
                return res.status(400).json({ message: 'Un usage a déjà été enregistré récemment' });
            }
        }

        const maxTime = parseDuration(ticket.priceId.maxTime);
        const cutoffTime = new Date(new Date().getTime() - maxTime);

        const existingUsage = await TicketUsage.findOne({
            ticketId: ticket._id,
            date: { $gte: cutoffTime }
        });

        if (existingUsage) {
            return res.status(400).json({ message: 'Usage déjà enregistré dans la période définie' });
        }
        const newUsage = new TicketUsage({
            ticketId,
            scanData
        });
        await newUsage.save();

        await Ticket.findByIdAndUpdate(ticketId, {
            $push: { usages: newUsage._id }
        });
        delete ticketLocks[ticketId];
        res.json({ message: 'Usage enregistré avec succès', usage: newUsage });
    } catch (error) {
        delete ticketLocks[ticketId];
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});


router.get('/tickets/:ticketId', verifyToken, async (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const userId = req.user.userId;
        const profileId = req.cookies['selectedScreen'];

        const ticket = await Ticket.findOne({
            _id: ticketId,
            'profileId': profileId
        }).populate('priceId').populate('usages');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé ou non associé à ce profil' });
        }
        const profile = await Profile.findOne({
            _id: profileId,
            'userId': userId
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profil non trouvé ou non associé à cet utilisateur' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});

router.delete('/tickets/:ticketId', verifyToken, async (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const userId = req.user.userId;
        const profileId = req.cookies['selectedScreen'];

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé' });
        }

        const profile = await Profile.findOne({ _id: profileId, 'userId': userId });
        if (!profile || ticket.profileId.toString() !== profileId) {
            return res.status(403).json({ message: 'Accès non autorisé à ce ticket' });
        }

        await Ticket.findByIdAndDelete(ticketId);
        res.status(200).json({ message: 'Ticket supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error.message });
    }
});

router.delete('/tickets', verifyToken, async (req, res) => {
    try {
        const profileId = req.cookies['selectedScreen'];

        const profile = await Profile.findOne({ _id: profileId, 'userId': req.user.userId });
        if (!profile) {
            return res.status(403).json({ message: 'Profil non trouvé ou non associé à cet utilisateur' });
        }

        const result = await Ticket.deleteMany({ profileId: profile._id });

        res.status(200).json({ message: `Tickets supprimés avec succès`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error.message });
    }
});



module.exports = router;