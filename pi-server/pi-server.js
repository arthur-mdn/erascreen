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
    const exec = require('child_process').exec;
    exec('ddcutil detect', (error, stdout, stderr) => {
        if (!stdout.includes('Invalid display')) {
            exec('ddcutil getvcp 0x10', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                const brightnessValue = stdout.match(/current value = (\d+)/);
                defaultValues.brightness = parseInt(brightnessValue[1]);
                availableCommands.push('brightness');
            })
        }
    });
    res.json({ appVersion: appVersion, availableCommands: availableCommands, defaultValues: defaultValues });
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
                        const brightnessValue = stdout.match(/current value = (\d+)/);
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