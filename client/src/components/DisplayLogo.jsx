import React, {useEffect, useState} from "react";
import {cacheLogo, getCachedLogo} from "../utils/cacheUtils.js";
import config from "../config.js";

export default function displayLogo({logo}) {
    const [cachedLogo, setCachedLogo] = useState(null);

    useEffect(() => {
        const loadLogo = async () => {
            if (logo) {
                const cachedLogoData = await getCachedLogo(logo);
                if (cachedLogoData) {
                    setCachedLogo(URL.createObjectURL(cachedLogoData));
                } else {
                    setCachedLogo(`${config.serverUrl}/${logo}`);
                }
            }
        };

        loadLogo();
    }, [logo]);

    useEffect(() => {
        if (logo) {
            cacheLogo(logo);
        }
    }, [logo]);

  return (
    <div>
        {
            cachedLogo && (
                <img src={cachedLogo} className={"card logo"} alt="Logo" />
            )
        }
    </div>
  );
}
