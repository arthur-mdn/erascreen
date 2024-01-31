const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};
function TimeIndicator({ ranges }) {
    const segments = [];
    for (let hour = 0; hour <= 24; hour += 3) {
        let isInARange = false;

        for (let range of ranges) {
            const startMinutes = timeToMinutes(range.start);
            const endMinutes = timeToMinutes(range.end === "00:00" ? "24:00" : range.end);
            const segmentStart = hour * 60;
            const segmentEnd = (hour + 3) * 60;

            if ((startMinutes < segmentEnd && endMinutes > segmentStart) || (startMinutes < segmentEnd + 1440 && endMinutes + 1440 > segmentStart)) {
                isInARange = true;
                break;
            }
        }
        segments.push({ hour, isInARange });
    }

    return (
        <div style={{ position: 'relative', width: '100%', marginTop: '10px', height:'6rem', flexShrink:0 }}>
            <div>
                {Array.from({ length: 9 }).map((_, index) => {
                    const hour = index * 3;
                    const leftPosition = `${(hour / 24) * 100}%`;

                    return (
                        <div key={index} style={{ position: 'absolute', left: leftPosition, textAlign: 'left', width: '11.1%' }}>
                            <div style={{ marginLeft: '-0.5rem', fontSize:'0.8rem' }}>{hour}h</div>
                            <div style={{ marginLeft: '-1px', height: '15px', borderLeft: '1px solid black' }}></div>
                        </div>
                    );
                })}
            </div>

            <div style={{ position: 'absolute', top: '40px', width: '100%', height: '20px', border: '1px solid black' }}>
                {ranges.map((range, index) => {
                    const startOffset = (timeToMinutes(range.start) / (24 * 60)) * 100;
                    const endOffset = range.end === "00:00" ? 100 : (timeToMinutes(range.end) / (24 * 60)) * 100;
                    const width = endOffset - startOffset;

                    return (
                        <div key={index} style={{
                            position: 'absolute',
                            left: `${startOffset}%`,
                            width: `${width}%`,
                            height: '100%',
                            backgroundColor: '#0050a3'
                        }}></div>
                    );
                })}
            </div>
        </div>
    );
}
export default TimeIndicator;