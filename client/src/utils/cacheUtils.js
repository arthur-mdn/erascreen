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
        const response = await fetch(`${config.serverUrl}/${photo}`);
        const blob = await response.blob();
        await db.put('images', blob, photo);
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

    const response = await fetch(`${config.serverUrl}/${logo}`);
    const blob = await response.blob();
    await db.put('logos', blob, logo);
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
        const cachedIcon = await db.get('icons', icon);
        if (!cachedIcon) {
            console.log('Caching icon:', icon);
            const response = await fetch(`${config.serverUrl}/${icon}`);
            const blob = await response.blob();
            await db.put('icons', blob, icon);
        }
    });

    await Promise.all(promises);
}

export async function getCachedIcon(icon) {
    const db = await initIconsDB();
    return await db.get('icons', icon);
}
