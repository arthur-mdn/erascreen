import React, {useEffect, useState} from "react";
import {cacheLogo, getCachedLogo} from "../utils/cacheUtils.js";
import config from "../config.js";

export default function DisplayLogo({logo, isDarkModeActive}) {
    const [cachedLogo, setCachedLogo] = useState(null);

    useEffect(() => {
        const loadLogo = async () => {
            if (logo) {
                const cachedLogoData = await getCachedLogo(logo._id);
                if (cachedLogoData) {
                    if (cachedLogoData.type === "image/svg+xml") {
                        const reader = new FileReader();
                        reader.onload = function (event) {
                            let svgContent = event.target.result;

                            if (isDarkModeActive) {
                                const svgWithStyle = svgContent.replace(
                                    /<svg([^>]+)>/,
                                    `<svg$1><style>.fill-white-when-dark-mode{fill:#fff}</style>`
                                );
                                const updatedBlob = new Blob([svgWithStyle], {type: "image/svg+xml"});
                                setCachedLogo(URL.createObjectURL(updatedBlob));
                            } else {
                                const svgWithoutDarkMode = svgContent.replace(
                                    /<style>.*?\.fill-white-when-dark-mode{fill:#fff}.*?<\/style>/,
                                    (match) => match.replace(/\.fill-white-when-dark-mode{fill:#fff}/, "")
                                );

                                const updatedBlob = new Blob([svgWithoutDarkMode], {type: "image/svg+xml"});
                                setCachedLogo(URL.createObjectURL(updatedBlob));
                            }
                        };

                        reader.readAsText(cachedLogoData);
                    } else {
                        setCachedLogo(URL.createObjectURL(cachedLogoData));
                    }
                } else {
                    setCachedLogo(`${(logo.where === "server" ? config.serverUrl : "") + "/" + logo.value}`);
                }
            }
        };

        loadLogo();
    }, [logo, isDarkModeActive]);

    useEffect(() => {
        if (logo) {
            cacheLogo(logo);
        }
    }, [logo]);

    return (
        <>
            {cachedLogo && logo && <img src={cachedLogo} className={"card logo"} alt="Logo"/>}
        </>
    );
}