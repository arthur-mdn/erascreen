function MeteoViewer({ screen }) {

    return (
        <>
            { screen.meteo && (
                <>
                    <div className={"meteo card fr ai-c"}>
                    {
                        (screen.meteo.data && screen.meteo.data.weather) && (
                            <>
                                {screen.meteo.data.weather[0].icon === '01n' && (
                                    <img src="/elements/meteo/01n-edited.png" alt="Météo" style={{width:'5rem', height:'5rem', objectFit:"cover"}}/>
                                )
                                }
                                {screen.meteo.data.weather[0].icon !== '01n' && (
                                    <img src={`https://openweathermap.org/img/wn/${screen.meteo.data.weather[0].icon}@2x.png`} alt="Météo" style={{width:'5rem', height:'5rem', objectFit:"cover"}}/>
                                )
                                }
                            </>
                        )
                    }

                    {
                        screen.meteo.data && (
                            <div>
                                <h3 style={{fontSize:'1.3rem', fontWeight:"bold", lineHeight:'1.5rem'}}>{screen.meteo.data.name}</h3>
                                <p  style={{fontSize:'1rem', fontWeight:"bold", lineHeight:'1rem'}}>{screen.meteo.data.main.temp}°C</p>
                                <p style={{textTransform:"capitalize",fontSize:'1rem', fontWeight:"bold", lineHeight:'1rem'}}>{screen.meteo.data.weather[0].description}</p>
                            </div>
                        )
                    }

                </div>
                    {
                        screen.meteo && (
                            <div>
                                <p>Dernière mise à jour : {screen.meteo.date}</p>
                            </div>
                        )
                    }
                </>
            )
            }
        </>

    );
}
export default MeteoViewer;


