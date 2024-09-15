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

async function insertSystemDefaults(){
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
        }
    ];

    for (const data of dataToInsert) {
        const existingImage = await Image.findOne({ system: data.system });
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
            await Screen.updateOne({ _id: screen._id }, { photos: screen.photos });
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
            await Screen.updateOne({ _id: screen._id }, { icons: screen.icons });
        }

        // Migrate old logo field (string)
        if (screen.logo && typeof screen.logo === "string" && screen.logo.includes("uploads")) {
            const newImage = new Image({
                screen: screen._id,
                type: 'logo',
                value: screen.logo,
                where: 'server'
            });
            await newImage.save();

            // Replace the old string with the new ObjectId
            await Screen.updateOne({ _id: screen._id }, { logo: newImage._id });
            console.log(`Logo ${screen.logo} converted to image id: ${newImage._id}`);
        } else if (!screen.logo || screen.logo === null) {
            // Set the default logo image if the logo field is empty
            await Screen.updateOne({ _id: screen._id }, { logo: defaultImages['default-logo'] });
            console.log(`Default logo image set for screen ${screen._id}`);
        } else if( screen.logo && typeof screen.logo === "string" && screen.logo === "" ) {
            await Screen.updateOne({ _id: screen._id }, { logo: defaultImages['default-logo'] });
            console.log(`Logo converted to image id: ${defaultImages['default-logo']}`);
        } else if (screen.logo && typeof screen.logo === "string" && screen.logo.includes("public")) {
            await Screen.updateOne({ _id: screen._id }, { logo: defaultImages['default-logo'] });
            console.log(`Logo ${screen.logo} converted to image id: ${defaultImages['default-logo']}`);
        }

        // Migrate old featured_image field (string)
        if (screen.featured_image && typeof screen.featured_image === "string" && screen.featured_image.includes("uploads")) {
            const newImage = new Image({
                screen: screen._id,
                type: 'featured_image',
                value: screen.featured_image,
                where: 'server'
            });
            await newImage.save();

            // Replace the old string with the new ObjectId
            await Screen.updateOne({ _id: screen._id }, { featured_image: newImage._id });
            console.log(`Featured image ${screen.featured_image} converted to image id: ${newImage._id}`);
        } else if( screen.featured_image && typeof screen.featured_image === "string" && screen.featured_image.includes("public") ) {
            await Screen.updateOne({ _id: screen._id }, { featured_image: defaultImages['default-featured-image'] });
            console.log(`Featured image ${screen.featured_image} converted to image id: ${defaultImages['default-featured-image']}`);
        } else if( !screen.featured_image ) {
            await Screen.updateOne({ _id: screen._id }, { featured_image: defaultImages['default-featured-image'] });
            console.log(`Featured image converted to image id: ${defaultImages['default-featured-image']}`);
        }
    }
}

module.exports = initDatabase;