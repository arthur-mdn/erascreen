require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const config = require('./others/config');

app.use(cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Pi-server is running!');
});

app.post('/execute', (req, res) => {
    const command = req.body.command;

    if (!command) {
        return res.status(400).send('No command provided.');
    }

    const exec = require('child_process').exec;

    switch (command) {
        case 'shutdown':
            exec('sudo shutdown now', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).send('Error executing command.');
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                res.send('Shutting down...');
            });
            break;
        case 'reboot':
            exec('sudo reboot', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).send('Error executing command.');
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                res.send('Rebooting...');
            });
            break;
        default:
            res.status(400).send('Invalid command.');
    }
});

app.listen(config.port, () => {
    console.log(`Pi-server listening on port ${config.port}`);
});