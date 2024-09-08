import {useEffect, useLayoutEffect, useRef, useState} from "react";

function DirectionsViewer({ screen }) {
    const directionsRef = useRef(null);
    const containerRef = useRef(null);
    const [hiddenContentHeight, setHiddenContentHeight] = useState(0);
    const [shouldScroll, setShouldScroll] = useState(false);

    const updateHeight = () => {
        if (directionsRef.current && containerRef.current) {
            const contentHeight = directionsRef.current.scrollHeight;
            const containerHeight = containerRef.current.clientHeight;
            const calculatedHiddenHeight = contentHeight - containerHeight;
            if (calculatedHiddenHeight > 0) {
                setHiddenContentHeight(calculatedHiddenHeight);
                setShouldScroll(true);
            } else {
                setShouldScroll(false);
            }
        }
    };

    useLayoutEffect(() => {
        const timer = setTimeout(updateHeight, 1000);
        return () => clearTimeout(timer);
    }, [screen]);

    useLayoutEffect(() => {
        window.addEventListener('resize', updateHeight);
        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    }, []);

    const animationStyle = shouldScroll ? {
        animation: `scroll-directions 20s linear infinite`,
        animationName: `scroll-${hiddenContentHeight}`,
    } : {};

    return (
        <div ref={containerRef} className={"directions-full-container card ai-fs jc-sb fc "} style={{flexDirection:'column', width:'40%', overflow:"hidden", position:"relative"}}>
            {
                shouldScroll &&
                <style>
                    { `@keyframes scroll-${hiddenContentHeight} {
                    10%, 90% { transform: translateY(0); }
                    40%, 60% { transform: translateY(${-hiddenContentHeight}px); }
                }`}
                </style>
            }

            <div className={"directions-container fc"} ref={directionsRef} style={{...animationStyle, position:"absolute",gap:'1.5vw', top: 0, padding:'0.5vw 0', minHeight:'100%', justifyContent:"space-around"}}>
                {screen.directions.map((direction, index) => (
                    <div className={"fr ai-c g1"} key={index}>
                        <img src={`/elements/arrows/${direction.arrow.style}`} alt="Flèche" style={{ transform: `rotate(${direction.arrow.orientation}deg)`}} className={"direction-arrow"} />
                        <div style={{textAlign:"left"}} className={"direction-text"}>
                            {/* if color == "#000000", do not set the color, else set the color */}
                            <h3 style={{ color: `${direction.title.color === "#000000" ? '' : direction.title.color}`, fontWeight:"bold" }}>
                                {direction.title.text}
                            </h3>
                            <p style={{whiteSpace: 'pre-wrap', fontWeight:"bold"}}>
                                {direction.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default DirectionsViewer;


