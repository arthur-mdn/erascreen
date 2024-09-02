require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const config = require('./others/config');

const app = express();
const appVersion = 'pi-0.0.2';

app.use(cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
};

app.get('/', async (req, res) => {
    let availableCommands = ['shutdown', 'reboot', 'update'];
    let defaultValues = {};

    try {
        const detectOutput = await executeCommand('ddcutil detect');
        if (!detectOutput.stdout.includes('Invalid display')) {
            const brightnessOutput = await executeCommand('ddcutil getvcp 0x10');
            const brightnessValue = brightnessOutput.stdout.match(/current value\s*=\s*(\d+)/);
            if (brightnessValue) {
                defaultValues.brightness = parseInt(brightnessValue[1], 10);
                availableCommands.push('brightness');
            }
        }
        res.json({ appVersion, availableCommands, defaultValues });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error: ' + error);
    }
});

app.post('/execute', async (req, res) => {
    const command = req.body.command;
    const value = req.body.value;

    if (!command) {
        return res.status(400).send('No command provided.');
    }

    try {
        switch (command) {
            case 'shutdown':
                res.send('Shutting down...');
                await executeCommand('sudo shutdown now');
                break;
            case 'reboot':
                res.send('Rebooting...');
                await executeCommand('sudo reboot');
                break;
            case 'update':
                const output = await executeCommand('git pull');
                if (!output.stdout.includes('Already up to date.')) {
                    res.send('Updating and rebooting...');
                    await executeCommand('sudo reboot');
                } else {
                    res.send('Already up to date.');
                }
                break;
            case 'brightness':
                if (!value) {
                    return res.status(400).send('No brightness provided.');
                }
                const detectOutput = await executeCommand('ddcutil detect');
                if (!detectOutput.stdout.includes('Invalid display')) {
                    await executeCommand(`ddcutil setvcp 10 ${value}`);
                    const brightnessOutput = await executeCommand(`ddcutil getvcp 0x10`);
                    const brightnessValue = brightnessOutput.stdout.match(/current value\s*=\s*(\d+)/);
                    if (brightnessValue) {
                        res.send(`Brightness set to ${brightnessValue[1]}.`);
                    } else {
                        res.status(500).send('Failed to get current brightness value.');
                    }
                } else {
                    res.status(500).send('Monitor not supported.');
                }
                break;
            default:
                res.status(400).send('Invalid command.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error: ' + error);
    }
});

app.listen(config.port, () => {
    console.log(`Pi-server listening on port ${config.port}`);
});