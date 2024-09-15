import config from '../config';
import { openDB, deleteDB } from 'idb';

export async function deleteDatabases() {
    try {
        await deleteDB('ImageCache', {
            blocked() {
                console.log('Database deletion blocked');
            },
        });
        await deleteDB('LogoCache', {
            blocked() {
                console.log('Database deletion blocked');
            },
        });
        await deleteDB('IconCache', {
            blocked() {
                console.log('Database deletion blocked');
            },
        });
        console.log('Databases deleted successfully');
    } catch (error) {
        console.error('Failed to delete databases', error);
    }
}

// Images
async function initImagesDB() {
    return openDB('ImageCache', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images');
            }
        },
    });
}

export async function cacheImages(photos) {
    const db = await initImagesDB();

    const promises = photos.map(async (photo) => {
        const cachedImage = await db.get('images', photo._id);
        if (!cachedImage) {
            console.log('Caching image:', photo);
            const response = await fetch(`${(photo.where === "server" ? config.serverUrl : "") + "/" + photo.value}`);
            const blob = await response.blob();
            await db.put('images', blob, photo._id);
        }
    });

    await Promise.all(promises);
}

export async function getCachedImage(photo) {
    const db = await initImagesDB();
    return await db.get('images', photo);
}

// Logo
async function initLogosDB() {
    return openDB('LogoCache', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('logos')) {
                db.createObjectStore('logos');
            }
        },
    });
}

export async function cacheLogo(logo) {
    if (!logo) return;

    const db = await initLogosDB();
    const cachedLogo = await db.get('logos', logo._id);
    if (!cachedLogo) {
        console.log('Caching logo:', logo);
        const response = await fetch(`${(logo.where === "server" ? config.serverUrl : "") + "/" + logo.value}`);
        const blob = await response.blob();
        await db.put('logos', blob, logo._id);
    }
}

export async function getCachedLogo(logo) {
    const db = await initLogosDB();
    return await db.get('logos', logo);
}


// Icons
async function initIconsDB() {
    return openDB('IconCache', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('icons')) {
                db.createObjectStore('icons');
            }
        },
    });
}

export async function cacheIcons(icons) {
    const db = await initIconsDB();

    const promises = icons.map(async (icon) => {
        const cachedIcon = await db.get('icons', icon._id);
        if (!cachedIcon) {
            console.log('Caching icon:', icon);
            const response = await fetch(`${(icon.where === "server" ? config.serverUrl : "") + "/" + icon.value}`);
            const blob = await response.blob();
            await db.put('icons', blob, icon._id);
        }
    });

    await Promise.all(promises);
}

export async function getCachedIcon(icon) {
    const db = await initIconsDB();
    return await db.get('icons', icon);
}
