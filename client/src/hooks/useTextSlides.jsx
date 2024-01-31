// hooks/useTextSlides.js
import { useEffect, useState } from 'react';

function useTextSlides (configData) {
    const [textSlide, setTextSlide] = useState(null);

    useEffect(() => {
        const checkTextSlides = () => {
            if (!configData?.text_slides?.ranges) {
                setTextSlide(null);
                return;
            }

            const currentDateTime = new Date();
            const currentTime = currentDateTime.toTimeString().substr(0, 5); // "HH:MM" format

            const activeSlide = configData.text_slides.ranges.find(range => {
                const [startHours, startMinutes] = range.start.split(':');
                const [endHours, endMinutes] = range.end.split(':');
                const startTime = new Date(currentDateTime);
                startTime.setHours(startHours, startMinutes, 0, 0);
                const endTime = new Date(currentDateTime);
                endTime.setHours(endHours, endMinutes, 0, 0);

                // Ajuster pour la fin le lendemain si nécessaire
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
                });
            } else {
                setTextSlide(null);
            }
        };

        if (configData?.text_slides?.ranges) {
            checkTextSlides();
        }

    }, [configData]);

    return textSlide;
}
export default useTextSlides;
