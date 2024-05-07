const Screen = require("../models/Screen");

const checkUserPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const screen = await Screen.findById(req.selectedScreen).populate('users.user');
            if (!screen) {
                return res.status(404).send({ error: 'Écran non trouvé' });
            }

            const user = screen.users.find(u => u.user._id.toString() === req.user.userId);

            if (!user) {
                return res.status(403).send({ error: 'Accès refusé' });
            }

            if (user.role === 'creator') {
                return next(); // Les créateurs ont toutes les permissions
            }

            const hasPermission = requiredPermissions.every(permission => user.permissions.includes(permission));
            if (!hasPermission) {
                return res.status(403).send({ error: 'Permission refusée' });
            }

            next();
        } catch (error) {
            console.error('Erreur lors de la vérification des permissions:', error);
            res.status(500).send({ error: 'Erreur serveur' });
        }
    };
};

module.exports = checkUserPermissions;
