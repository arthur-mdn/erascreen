module.exports = {
    dbUri: process.env.DB_URI,
    port: process.env.VITE_SERVER_PORT,
    clientUrl: process.env.VITE_SCHEME + '://' + process.env.VITE_CLIENT_URL,
    adminUrl: process.env.VITE_SCHEME + '://' + process.env.VITE_ADMIN_URL,
    secretKey: process.env.SECRET_KEY || 'SECRET_KEY_FOR_JWT',
    openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY
};