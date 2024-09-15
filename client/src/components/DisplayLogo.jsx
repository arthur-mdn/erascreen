import React, {useEffect, useState} from "react";
import {cacheLogo, getCachedLogo} from "../utils/cacheUtils.js";
import config from "../config.js";

export default function displayLogo({logo, isDarkModeActive}) {
    const [cachedLogo, setCachedLogo] = useState(null);

    const loadLogo = async () => {
        const cachedLogoData = await getCachedLogo(logo._id);
        if (cachedLogoData) {
            if (cachedLogoData.type === "image/svg+xml" && isDarkModeActive) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    let svgContent = event.target.result;

                    const svgWithStyle = svgContent.replace(
                        /<svg([^>]+)>/,
                        `<svg$1><style>.fill-white-when-dark-mode{fill:#fff}</style>`
                    );

                    const updatedBlob = new Blob([svgWithStyle], {type: 'image/svg+xml'});
                    setCachedLogo(URL.createObjectURL(updatedBlob));
                };
                reader.readAsText(cachedLogoData);
            } else {
                setCachedLogo(URL.createObjectURL(cachedLogoData));
            }
        } else {
            setCachedLogo(`${(logo.where === "server" ? config.serverUrl : "") + "/" + logo.value}`);
        }
    };


    useEffect(() => {
        async function cacheAndLoadLogo() {
            if (logo) {
                await cacheLogo(logo);
            }
            loadLogo();
        }

        cacheAndLoadLogo();
    }, [logo]);


    return (
        <>
            {
                (cachedLogo && logo) && (
                    <img src={cachedLogo} className={"card logo"} alt="Logo"/>
                )
            }
        </>
    );
}
