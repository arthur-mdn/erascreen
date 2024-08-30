import config from "../config.js";
import React, {useEffect, useState} from "react";
import {cacheIcons, cacheImages, getCachedIcon} from "../utils/cacheUtils.js";

function DisplayIcons({ icons }) {
    const [cachedIcons, setCachedIcons] = useState([]);

    useEffect(() => {
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

        loadIcons();
    }, [icons]);

    useEffect(() => {
        if(icons.length > 0){
            cacheIcons(icons);
        }
    }, []);
  return (
    <>
        {cachedIcons.map(icon => (
            <img key={icon} src={`${icon}`} alt={`Icon`} style={{width:'4vw', height:'4vw', objectFit:"contain"}} />
        ))}
    </>
    );
}
export default DisplayIcons;