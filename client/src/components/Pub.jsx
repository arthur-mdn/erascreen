import React, { useEffect, useState } from "react";

function Pub({ displayTime, animationTime, intervalTime }) {
    const [isVisible, setIsVisible] = useState(false);
    const [leftPosition, setLeftPosition] = useState(-100);
    const [transitionTime, setTransitionTime] = useState(animationTime);

    useEffect(() => {
        const animate = () => {
            setIsVisible(true);
            setTransitionTime(animationTime);
            setTimeout(() => {
                setLeftPosition(0);
                setTimeout(() => {
                    setTransitionTime(animationTime * 2);
                    setLeftPosition(-100);
                    setTimeout(() => {
                        setIsVisible(false);
                    }, animationTime * 2);
                }, displayTime);
            }, 10);
        };

        const intervalId = setInterval(animate, displayTime + animationTime * 2 + intervalTime);
        animate();

        return () => clearInterval(intervalId);
    }, [displayTime, animationTime, intervalTime]);

    return isVisible ? (
        <div className={"pub-card card"} style={{ left: `${leftPosition}%`, transition: `left ${transitionTime}ms` }}>
            <img src={"/elements/logo.svg"} alt="Ad" style={{ height: "4rem" }} />
        </div>
    ) : null;
}

export default Pub;
