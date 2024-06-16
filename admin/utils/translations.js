// translations.js
import translations from '../locales/fr.json'

export const getTranslation = (key) => {
    return translations[key] || key;
};
