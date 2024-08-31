import config from "../config.js";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {cacheIcons, getCachedIcon} from "../utils/cacheUtils.js";

function DisplayIcons({ icons }) {
    const iconsRef = useRef(null);
    const containerRef = useRef(null);
    const [hiddenContentWidth, setHiddenContentWidth] = useState(0);
    const [shouldScroll, setShouldScroll] = useState(false);

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


    useLayoutEffect(() => {
        const updateWidth = () => {
            if (iconsRef.current && containerRef.current) {
                const contentWidth = iconsRef.current.scrollWidth;
                const containerWidth = containerRef.current.clientWidth;
                const calculatedHiddenWidth = (contentWidth - containerWidth) + 20; // +20 for padding
                if (calculatedHiddenWidth > 0) {
                    setHiddenContentWidth(calculatedHiddenWidth);
                    setShouldScroll(true);
                } else {
                    setShouldScroll(false);
                }
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, [screen]);

    const animationStyle = shouldScroll ? {
        animation: `scroll-icons 20s linear infinite`,
        animationName: `scroll-${hiddenContentWidth}`,
    } : {};

  return (
    <div ref={containerRef} className={"icons-full-container card ai-fs jc-sb fc "} style={{flexDirection:'row', maxWidth:'40%', overflow:"hidden", position:"relative"}}>
        {
            shouldScroll &&
            <style>
                { `@keyframes scroll-${hiddenContentWidth} {
                    10%, 90% { transform: translateX(0); }
                    40%, 60% { transform: translateX(${-hiddenContentWidth}px); }
                }`}
            </style>
        }
        <div className={"icons-container fr"} ref={iconsRef} style={{...animationStyle,gap:'0.5vw', top: 0, padding:'0.5vw 0', justifyContent:"space-around"}}>
        {cachedIcons.map(icon => (
            <img key={icon} src={`${icon}`} alt={`Icon`} style={{width:'4vw', height:'4vw', objectFit:"contain"}} />
        ))}
        </div>
    </div>
    );
}
export default DisplayIcons;