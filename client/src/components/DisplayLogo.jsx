import React, {useEffect, useState} from "react";
import {cacheLogo, getCachedLogo} from "../utils/cacheUtils.js";
import config from "../config.js";

export default function displayLogo({logo, isDarkModeActive}) {
    const [cachedLogo, setCachedLogo] = useState(null);

    useEffect(() => {
        const loadLogo = async () => {
            if (logo) {
                const cachedLogoData = await getCachedLogo(logo);
                if (cachedLogoData) {
                    if (cachedLogoData.type === "image/svg+xml" && isDarkModeActive) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            let svgContent = event.target.result;

                            const svgWithStyle = svgContent.replace(
                                /<svg([^>]+)>/,
                                `<svg$1><style>.fill-white-when-dark-mode{fill:#fff}</style>`
                            );

                            const updatedBlob = new Blob([svgWithStyle], { type: 'image/svg+xml' });
                            setCachedLogo(URL.createObjectURL(updatedBlob));
                        };

                        reader.readAsText(cachedLogoData);
                    } else {
                        setCachedLogo(URL.createObjectURL(cachedLogoData));
                    }
                } else {
                    setCachedLogo(`${config.serverUrl}/${logo}`);
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
        {
            (cachedLogo && logo) && (
                <img src={cachedLogo} className={"card logo"} alt="Logo" />
            )
        }
    </>
  );
}
