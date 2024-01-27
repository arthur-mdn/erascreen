import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import config from "../config.js";

function PhotoSlider({ photos, interval, hideDots }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const settings = {
        dots: !hideDots,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: interval * 1000,
        beforeChange: (current, next) => setCurrentIndex(next),
    };

    return (
        <div style={{ width: '60%'}}> {/* Ajustez la hauteur maximale selon vos besoins */}
            <Slider {...settings}>
                {photos.map((photo, index) => (
                    <div key={index} style={{ width: '100%', height: '100%' }}>
                        <img src={`${config.serverUrl}/${photo}`} alt={`Slide ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default PhotoSlider;
