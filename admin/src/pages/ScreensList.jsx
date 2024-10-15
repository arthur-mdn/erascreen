import React, {useState} from 'react';
import ScreenSelector from "../components/ScreenSelector.jsx";
import Loading from "../components/Loading.jsx";
import Screen from "../components/Screen.jsx";
import {Route, Routes} from "react-router-dom";


function ScreensList() {
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) return (
        <Loading/>
    );

    return (
        <>
            <Routes>
                <Route path="/:screenId/*" element={<Screen/>}/>
                <Route path="*" element={<>
                    <ScreenSelector/>
                </>}/>
            </Routes>

        </>
    );

}

export default ScreensList;
