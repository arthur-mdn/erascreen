// utils/weatherUtils.js
const Meteo = require("../models/Meteo");
const axios = require("axios");
const Screen = require("../models/Screen");
const config = require("../others/config");

async function updateWeatherData(screenId, cityId) {
    try {
        const encodedCityId = encodeURIComponent(cityId);
        // Rechercher si un document Meteo existe déjà pour cette ville
        let meteo = await Meteo.findOne({ "weatherId": encodedCityId });

        // Si cityId est vide, supprimer le document Meteo
        if (cityId === "") {
            const screen = await Screen.findByIdAndUpdate(
                screenId,
                { $unset: { "meteo": "" } },
                { new: true }
            );

            if (!screen) {
                throw new Error('Écran non trouvé');
            }

            return screen;
        }

        // Si le document n'existe pas ou si la dernière mise à jour date de plus d'une heure, créer/mettre à jour le document Meteo
        if (!meteo || Date.now() - new Date(meteo.lastUpdated).getTime() > 3600000) { // 3600000 ms = 1 heure
            const apiKey = config.openWeatherApiKey;
            const url = `https://api.openweathermap.org/data/2.5/weather?id=${encodedCityId}&appid=${apiKey}&units=metric&lang=fr`;
            const weatherResponse = await axios.get(url);
            const weatherData = weatherResponse.data;

            if (meteo) {
                meteo.data = weatherData;
                meteo.lastUpdated = Date.now();
            } else {
                meteo = new Meteo({ weatherId: weatherData.id, data: weatherData });
            }
            await meteo.save();
        }

        const screen = await Screen.findByIdAndUpdate(screenId, { meteo: meteo._id }, { new: true }).populate('meteo');
        if (!screen) {
            throw new Error('Écran non trouvé');
        }

        return screen;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des données météo:', error);
        throw error;
    }
}

module.exports = { updateWeatherData };
