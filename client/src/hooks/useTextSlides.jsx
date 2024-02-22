import { useEffect, useState, useRef } from 'react';

function useTextSlides(configData) {
    const [textSlide, setTextSlide] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const checkTextSlides = () => {
            if (!configData?.text_slides?.ranges) {
                setTextSlide(null);
                return;
            }

            const currentDateTime = new Date();

            const activeSlide = configData.text_slides.ranges.find(range => {
                const [startHours, startMinutes] = range.start.split(':');
                const [endHours, endMinutes] = range.end.split(':');
                const startTime = new Date();
                startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                const endTime = new Date();
                endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

                if (endTime <= startTime) {
                    endTime.setDate(endTime.getDate() + 1);
                }

                return currentDateTime >= startTime && currentDateTime < endTime;
            });

            if (activeSlide) {
                setTextSlide({
                    text: activeSlide.text,
                    textColor: activeSlide.textColor,
                    backgroundColor: activeSlide.backgroundColor,
                    slideTime: activeSlide.slideTime
                });
            } else {
                setTextSlide(null);
            }

            // Calculer le délai jusqu'à la prochaine minute pleine
            const nextMinuteDelay = (60 - currentDateTime.getSeconds()) * 1000;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Vérifier à nouveau les slides à la première seconde de la nouvelle minute
            timeoutRef.current = setTimeout(checkTextSlides, nextMinuteDelay);
        };

        checkTextSlides();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [configData, configData?.text_slides]);

    return textSlide;
}

export default useTextSlides;
