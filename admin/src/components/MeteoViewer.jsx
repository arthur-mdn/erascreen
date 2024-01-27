function MeteoViewer({ screen }) {

    return (
        <>
            { screen.meteo && (
                <div className={"meteo card fr ai-c"}>
                    {
                        (screen.meteo.data && screen.meteo.data.weather) && (
                            <>
                                {screen.meteo.data.weather[0].icon === '01n' && (
                                    <img src="/elements/meteo/01n-edited.png" alt="Météo" style={{width:'6vw', height:'5vw', objectFit:"cover"}}/>
                                )
                                }
                                {screen.meteo.data.weather[0].icon !== '01n' && (
                                    <img src={`https://openweathermap.org/img/wn/${screen.meteo.data.weather[0].icon}@2x.png`} alt="Météo" style={{width:'6vw', height:'5vw', objectFit:"cover"}}/>
                                )
                                }
                            </>
                        )
                    }

                    {
                        screen.meteo.data && (
                            <div>
                                <h3 style={{fontSize:'1.3vw', fontWeight:"bold", lineHeight:'1.3vw'}}>{screen.meteo.data.name}</h3>
                                <p  style={{fontSize:'1.3vw', fontWeight:"bold", lineHeight:'1.3vw'}}>{screen.meteo.data.main.temp}°C</p>
                                <p style={{textTransform:"capitalize",fontSize:'1.3vw', fontWeight:"bold", lineHeight:'1.3vw'}}>{screen.meteo.data.weather[0].description}</p>
                            </div>
                        )
                    }


                </div>
            )
            }
        </>

    );
}
export default MeteoViewer;


