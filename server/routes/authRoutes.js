const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const config = require('../others/config');

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
        }

        user.lastLogin = Date.now();
        await user.save();

        const token = jwt.sign({ userId: user._id }, config.secretKey, { expiresIn: '365d' });
        res.cookie('session_token', token, { httpOnly: true,  maxAge: 365 * 24 * 60 * 60 * 1000 });
        res.json({ message: 'Authentification réussie'});

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, lastName, firstName } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Un compte avec cette adresse e-mail existe déjà.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            lastName,
            firstName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, config.secretKey, { expiresIn: '365d' });
        res.cookie('session_token', token, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 }); // 365d

        res.status(201).json({ message: 'Inscription réussie' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur: ' + error });
    }
});


router.get('/auth/validate-session', async (req, res) => {
    const token = req.cookies['session_token'];
    if (!token) {
        return res.json({isAuthenticated: false});
    }
    try {
        const decoded = jwt.verify(token, config.secretKey);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.json({isAuthenticated: false, message: 'Utilisateur non trouvé'});
        }

        if (user.status && ['disabled', 'pending', 'blocked'].includes(user.status)) {
            return res.json({isAuthenticated: false, message: 'Compte désactivé'});
        }

        user.lastLogin = Date.now();
        await user.save();

        res.json({isAuthenticated: true});
    } catch (err) {
        res.json({isAuthenticated: false});
    }
});

router.post('/auth/logout', (req, res) => {
    res.clearCookie('session_token');
    res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;