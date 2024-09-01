require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const config = require('./others/config');
const {exec} = require("child_process");

const appVersion = 'pi-0.0.2';

app.use(cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/', (req, res) => {
    let availableCommands = ['shutdown', 'reboot', 'update'];
    let defaultValues = {};

    const execPromise = (command) => {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    };

    (async () => {
        try {
            const detectResult = await execPromise('ddcutil detect');
            if (!detectResult.stdout.includes('Invalid display')) {
                const brightnessResult = await execPromise('ddcutil getvcp 0x10');
                console.log(`stdout: ${brightnessResult.stdout}`);
                console.error(`stderr: ${brightnessResult.stderr}`);

                const brightnessValue = brightnessResult.stdout.match(/current value\s*=\s*(\d+)/);
                if (brightnessValue) {
                    defaultValues.brightness = parseInt(brightnessValue[1]);
                    availableCommands.push('brightness');
                }
            }

            res.json({ appVersion: appVersion, availableCommands: availableCommands, defaultValues: defaultValues });

        } catch (error) {
            console.error('Error executing commands:', error);
            res.status(500).json({ error: 'An error occurred while retrieving display information.' });
        }
    })();
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
        case 'update':
            exec('git pull', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).send('Error executing command.');
                }
                if(!stdout.includes('Already up to date.')) {
                    exec('sudo reboot', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return res.status(500).send('Error executing command.');
                        }
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                        res.send('Updating...');
                    });
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                res.send('Updating...');
            });
            break;
            case 'brightness':
                const brightness = req.body.brightness;
                if (!brightness) {
                    return res.status(400).send('No brightness provided.');
                }
                if (isNaN(brightness)) {
                    return res.status(400).send('Invalid brightness value.');
                }
                exec(`ddcutil setvcp 10 ${brightness}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return res.status(500).send('Error executing command.');
                    }
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    exec(`ddcutil getvcp 0x10`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return res.status(500).send('Error executing command.');
                        }
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                        const brightnessValue = stdout.match(/current value\s*=\s*(\d+)/);
                        res.send(`Brightness set to ${brightnessValue[1]}.`);
                    })
                });
        default:
            res.status(400).send('Invalid command.');
    }
});

app.listen(config.port, () => {
    console.log(`Pi-server listening on port ${config.port}`);
});