const fs = require('fs');

fs.readFile('datas/city.list.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Erreur lors de la lecture du fichier", err);
        return;
    }

    try {
        const objets = JSON.parse(data);
        const villesUniques = {};
        const villesFR = objets.filter(objet => {
            if (objet.country === "FR" && !villesUniques.hasOwnProperty(objet.name)) {
                villesUniques[objet.name] = true;
                return true;
            }
            return false;
        });

        fs.writeFile('villesFR_NoDoubles.json', JSON.stringify(villesFR, null, 2), (err) => {
            if (err) {
                console.error("Erreur lors de l'écriture du fichier", err);
            } else {
                console.log("Fichier sauvegardé avec succès !");
            }
        });
    } catch (parseErr) {
        console.error("Erreur lors de l'analyse du JSON", parseErr);
    }
});
