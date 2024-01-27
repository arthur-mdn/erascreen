import config from "../config.js";
import React from "react";
import MeteoViewer from "./MeteoViewer";
import TimeViewer from "./TimeViewer";
import DirectionsViewer from "./DirectionsViewer";
import PhotoSlider from "./PhotoSlider.jsx";
import {Helmet} from "react-helmet";

function Screen({configData}){

    return (
        <div>
            <Helmet>
                <title>{configData.nom}</title>
            </Helmet>
            <div className={"fr jc-sb ai-c"}>
                <img src={`${config.serverUrl}/${configData.logo}`} className={"card"} alt="Logo" style={{height:'6vw'}}/>
                <MeteoViewer screen={configData}/>
                <TimeViewer/>
                <div className={"card fr ai-c g0-5"}>
                    {configData.icons.map(icon => (
                        <img key={icon} src={`${config.serverUrl}/${icon}`} alt={`Icon`} style={{width:'4vw', height:'4vw', objectFit:"contain"}} />
                    ))}
                </div>
            </div>
            <div style={{marginTop:'2vw', maxWidth:'100%', height:'75vh',maxHeight:'75vh', gap:'2vw'}} className={"fr jc-sb"}>
                <DirectionsViewer screen={configData}/>
                <PhotoSlider
                    photos={configData.photos}
                    interval={configData.config.photos_interval || 3000}
                    hideDots={configData.config.hide_slider_dots}
                />
            </div>
            {/*<h2 style={{fontSize:'1.3vw'}}>{configData.nom}</h2>*/}
            {/*<p>{configData._id}</p>*/}
        </div>
    );
}
export default Screen;