import React, {useEffect, useState} from "react";

function Pub({ displayTime, animationTime, intervalTime }) {
    const [isVisible, setIsVisible] = useState(false);
    const [rightPosition, setRightPosition] = useState(-100);
    const [transitionTime, setTransitionTime] = useState(animationTime);

    useEffect(() => {
        const animate = () => {
            setIsVisible(true);
            setTransitionTime(animationTime);
            setTimeout(() => {
                setRightPosition(0);
                setTimeout(() => {
                    setTransitionTime(animationTime * 2);
                    setRightPosition(-100);
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
        <div className={"pub-card card"} style={{ right: `${rightPosition}%`, transition: `right ${transitionTime}ms` }}>
            <img src={"/elements/logo.svg"} alt="Ad" style={{ height: "4rem" }} />
        </div>
    ) : null;
}

export default Pub;
