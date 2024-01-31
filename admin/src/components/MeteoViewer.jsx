import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
function MeteoViewer({ screen }) {
    const date = (screen.meteo && screen.meteo.lastUpdated) ? screen.meteo.lastUpdated : Date.now();
    const formattedDate = format(new Date(date), 'PPPpp', { locale: fr });

    return (
        <>
            { screen.meteo && Object.keys(screen.meteo.data).length > 0  && (
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
                <div>
                    <p>Dernière mise à jour : {formattedDate}</p>
                </div>
                </>
            )
            }
        </>

    );
}
export default MeteoViewer;


