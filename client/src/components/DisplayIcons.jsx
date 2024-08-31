import config from "../config.js";
import React, {useEffect, useState} from "react";
import {cacheIcons, getCachedIcon} from "../utils/cacheUtils.js";

function DisplayIcons({ icons }) {
    const [cachedIcons, setCachedIcons] = useState([]);

    const loadIcons = async () => {
        const loadedIcons = await Promise.all(icons.map(async (icon) => {
            const cachedIcon = await getCachedIcon(icon);
            if (cachedIcon) {
                return URL.createObjectURL(cachedIcon);
            } else {
                return `${icon}`;
            }
        }));
        setCachedIcons(loadedIcons);
    };

    useEffect(() => {
        async function cacheAndLoadIcons() {
            if (icons.length > 0) {
                await cacheIcons(icons);
            }
            loadIcons();
        }

        cacheAndLoadIcons();
    }, [icons]);


  return (
    <>
        {cachedIcons.map(icon => (
            <img key={icon} src={`${icon}`} alt={`Icon`} style={{width:'4vw', height:'4vw', objectFit:"contain"}} />
        ))}
    </>
    );
}
export default DisplayIcons;