import {useEffect, useState} from 'react';

function useDarkMode(configData) {
    const [isDarkModeActive, setIsDarkModeActive] = useState(false);

    useEffect(() => {
        let timeoutId;

        const checkDarkMode = () => {

            if (!configData?.dark_mode?.ranges || configData.dark_mode.ranges.length === 0) {
                setIsDarkModeActive(false);
                return;
            }

            const currentDateTime = new Date();
            const currentTime = currentDateTime.toTimeString().substr(0, 5); // "HH:MM" format

            const isWithinRange = (range) => {
                const [startHours, startMinutes] = range.start.split(':');
                const [endHours, endMinutes] = range.end.split(':');
                const startTime = new Date(currentDateTime);
                startTime.setHours(startHours, startMinutes, 0, 0);
                const endTime = new Date(currentDateTime);
                endTime.setHours(endHours, endMinutes, 0, 0);

                // Si la fin est le lendemain (ex: 23:00-01:00), ajouter un jour à endTime
                if (endTime <= startTime) {
                    endTime.setDate(endTime.getDate() + 1);
                }

                return currentDateTime >= startTime && currentDateTime < endTime;
            };

            const isDark = configData.dark_mode.ranges.some(isWithinRange);
            setIsDarkModeActive(isDark);

            // Trouver le temps jusqu'à la prochaine activation ou désactivation
            const nextCheckTime = Math.min(
                ...configData.dark_mode.ranges.flatMap(range => {
                    const [startHours, startMinutes] = range.start.split(':');
                    const [endHours, endMinutes] = range.end.split(':');
                    const startTime = new Date(currentDateTime);
                    startTime.setHours(startHours, startMinutes, 0, 0);
                    const endTime = new Date(currentDateTime);
                    endTime.setHours(endHours, endMinutes, 0, 0);

                    // Si la fin est le lendemain, ajouter un jour à endTime
                    if (endTime <= startTime) {
                        endTime.setDate(endTime.getDate() + 1);
                    }

                    // Si la plage horaire est passée aujourd'hui, ajouter un jour à startTime
                    if (startTime < currentDateTime && endTime < currentDateTime) {
                        startTime.setDate(startTime.getDate() + 1);
                    }

                    return [startTime - currentDateTime, endTime - currentDateTime].filter(t => t > 0);
                })
            );

            if (nextCheckTime > 0) {
                timeoutId = setTimeout(checkDarkMode, nextCheckTime);
            }
        };

        if (configData?.dark_mode?.ranges && configData.dark_mode.ranges.length > 0) {
            checkDarkMode();
        } else {
            setIsDarkModeActive(false);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [configData]);

    return isDarkModeActive;
}

export default useDarkMode;