import config from "../config.js";
import React, {useEffect, useState} from "react";
import MeteoViewer from "./MeteoViewer";
import TimeViewer from "./TimeViewer";
import DirectionsViewer from "./DirectionsViewer";
import PhotoSlider from "./PhotoSlider.jsx";
import DisplayLogo from "./DisplayLogo.jsx";
import {Helmet} from "react-helmet";
import DisplayIcons from "./DisplayIcons.jsx";

function Screen({configData}){
    return (
        <div>
            <Helmet>
                <title>{configData.name}</title>
            </Helmet>
            <div className={"fr jc-sb ai-c"}>
                <DisplayLogo logo={configData.logo}/>
                {
                    configData.meteo && (
                        <MeteoViewer screen={configData}/>
                    )
                }
                <TimeViewer/>
                {
                    configData.icons && configData.icons.length > 0 && (
                        <div className={"card fr ai-c g0-5"}>
                            <DisplayIcons icons={configData.icons}/>
                        </div>
                    )
                }
            </div>
            <div style={{marginTop:'1vw', maxWidth:'100%', height:'75vh',maxHeight:'75vh', gap:'2vw'}} className={"fr jc-sb directions-and-photos"}>
                {
                    configData.directions && configData.directions.length > 0 && (
                        <DirectionsViewer screen={configData}/>
                    )
                }
                {
                    configData.photos && configData.photos.length > 0 && (
                        <PhotoSlider
                            photos={configData.photos}
                            interval={configData.config.photos_interval || 3000}
                            hideDots={configData.config.hide_slider_dots}
                            screen={configData}
                        />
                    )
                }
            </div>
            {/*<h2 style={{fontSize:'1.3vw'}}>{configData.name}</h2>*/}
            {/*<p>{configData._id}</p>*/}
        </div>
    );
}
export default Screen;