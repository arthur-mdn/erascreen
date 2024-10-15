const mongoose = require("mongoose");
const Image = require("../models/Image");
const User = require("../models/User");
const Screen = require("../models/Screen");

const defaultImages = {};

async function initDatabase() {
    console.log("Initializing database...");
    try {
        await insertSystemDefaults();
        console.log("Before Detecting old images...");
        await detectUploadedImagesUsingOldWay();
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

async function insertSystemDefaults() {
    const dataToInsert = [
        {
            screen: null,
            type: 'featured_image',
            where: 'server',
            value: 'public/template-screen-image.png',
            system: 'default-featured-image'
        },
        {
            screen: null,
            type: 'logo',
            where: 'server',
            value: 'public/logo.svg',
            system: 'default-logo'
        },
        {
            screen: null,
            type: 'icon',
            where: 'server',
            value: 'public/icons/defibrillator.svg',
            system: 'default-icon'
        },
        {
            screen: null,
            type: 'icon',
            where: 'server',
            value: 'public/icons/smoke.svg',
            system: 'default-icon'
        },
        {
            screen: null,
            type: 'icon',
            where: 'server',
            value: 'public/icons/wifi.svg',
            system: 'default-icon'
        },
        {
            screen: null,
            type: 'icon',
            where: 'server',
            value: 'public/icons/camera.svg',
            system: 'default-icon'
        }
    ];

    for (const data of dataToInsert) {
        const existingImage = await Image.findOne({system: data.system, value: data.value});
        if (!existingImage) {
            const newImage = new Image(data);
            await newImage.save();
            defaultImages[data.system] = newImage._id;
            console.log(`System default image ${data.system} inserted`);
        } else {
            defaultImages[data.system] = existingImage._id;
            console.log(`System default image ${data.system} already exists`);
        }
    }
}

async function detectUploadedImagesUsingOldWay() {
    // Detect old images stored as strings and update them
    console.log("Detecting old images...");

    // Use `.lean()` to bypass schema and retrieve raw documents
    const screens = await Screen.find().lean();

    for (const screen of screens) {
        // Migrate old photos field (array of strings)
        if (screen.photos && screen.photos.length > 0) {
            for (const photo of screen.photos) {
                if (typeof photo === "string" && photo.includes("uploads")) {
                    const newImage = new Image({
                        screen: screen._id,
                        type: 'photo',
                        value: photo,
                        where: 'server'
                    });
                    await newImage.save();

                    // Replace the old string with the new ObjectId
                    screen.photos = screen.photos.map(p => (p === photo ? newImage._id : p));
                    console.log(`Photo ${photo} converted to image id: ${newImage._id}`);
                }
            }

            // Update the screen document in the database with the new photos array
            await Screen.updateOne({_id: screen._id}, {photos: screen.photos});
        }

        // Migrate old icons field (array of strings)
        if (screen.icons && screen.icons.length > 0) {
            for (const icon of screen.icons) {
                if (typeof icon === "string" && icon.includes("uploads")) {
                    const newImage = new Image({
                        screen: screen._id,
                        type: 'icon',
                        value: icon,
                        where: 'server'
                    });
                    await newImage.save();

                    // Replace the old string with the new ObjectId
                    screen.icons = screen.icons.map(i => (i === icon ? newImage._id : i));
                    console.log(`Icon ${icon} converted to image id: ${newImage._id}`);
                }
            }

            // Update the screen document in the database with the new icons array
            await Screen.updateOne({_id: screen._id}, {icons: screen.icons});
        }

        // Migrate old logo field (string)
        if (screen.logo && typeof screen.logo === "string") {
            if (screen.logo === "") {
                // Set to default logo if logo is empty
                await Screen.updateOne({_id: screen._id}, {logo: defaultImages['default-logo']});
                console.log(`Default logo set for screen ${screen._id}`);
            } else if (screen.logo.includes("uploads")) {
                const newImage = new Image({
                    screen: screen._id,
                    type: 'logo',
                    value: screen.logo,
                    where: 'server'
                });
                await newImage.save();

                await Screen.updateOne({_id: screen._id}, {logo: newImage._id});
                console.log(`Logo ${screen.logo} converted to image id: ${newImage._id}`);
            }
        }

        // Migrate old featured_image field (string)
        if (screen.featured_image && typeof screen.featured_image === "string") {
            if (screen.featured_image === "") {
                // Set to default featured image if empty
                await Screen.updateOne({_id: screen._id}, {featured_image: defaultImages['default-featured-image']});
                console.log(`Default featured image set for screen ${screen._id}`);
            } else if (screen.featured_image.includes("uploads")) {
                const newImage = new Image({
                    screen: screen._id,
                    type: 'featured_image',
                    value: screen.featured_image,
                    where: 'server'
                });
                await newImage.save();

                await Screen.updateOne({_id: screen._id}, {featured_image: newImage._id});
                console.log(`Featured image ${screen.featured_image} converted to image id: ${newImage._id}`);
            }
        }
    }
}

module.exports = initDatabase;