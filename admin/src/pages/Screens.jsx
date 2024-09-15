import {useState} from 'react';
import Loading from "../components/Loading.jsx";
import {MonitorCheck, MonitorOff, MonitorSmartphone} from "lucide-react";
import {Link, Route, Routes} from "react-router-dom";
import AddScreen from "../components/AddScreen.jsx";
import ScreensList from "./ScreensList.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";


function Home() {
    const [isLoading, setIsLoading] = useState(false);

    function isActive(path, base) {
        return path === base || path.startsWith(`${base}/`);
    }

    if (isLoading) return (
        <Loading/>
    );

    return (
        <div className={"fr h100 w100 bg-blue-to-gray"}>
            <div className={"fc h100 bg-grey p1 br-l-1 fs-0 dn"}>
                <h4 className={"fw-b"}>Écrans</h4>
                <br/>
                <div className={"fc g1"}>
                    <Link to={"list"} className={`fr g0-5 ai-c ${isActive(location.pathname, '/screens/list') ? 'active' : ''}`}>
                        <MonitorCheck size={24}/>
                        <h4>Écrans associés</h4>
                    </Link>
                    <Link to={"add"} className={`fr g0-5 ai-c ${isActive(location.pathname, '/screens/add') ? 'active' : ''}`}>
                        <MonitorSmartphone size={24}/>
                        <h4>Associer un nouvel écran</h4>
                    </Link>
                    <Link to={"delete"} className={`fr g0-5 ai-c ${isActive(location.pathname, '/screens/delete') ? 'active' : ''}`}>
                        <MonitorOff size={24}/>
                        <h4>Dissocier un écran</h4>
                    </Link>
                </div>
            </div>
            <div className={"w100 br-l-1 bg-white bs ofy-s"}>
                <Breadcrumbs/>
                <Routes>
                    <>
                        <Route path="/list/*" element={<ScreensList/>}/>
                        <Route path="/add" element={<AddScreen/>}/>
                        <Route path="/add/:screenId" element={<AddScreen/>}/>
                        <Route path="/del/*" element={<>del</>}/>
                    </>
                    <Route path="*" element={<div className={"fr g0-5 p1 setting-buttons"}>
                        <Link to={"list"} className={"setting-button"}>
                            <MonitorCheck size={24}/>
                            <h4>Écrans associés</h4>
                        </Link>

                        <Link to={"add"} className={"setting-button"}>
                            <MonitorSmartphone size={24}/>
                            <h4>Associer un nouvel écran</h4>
                        </Link>

                        <Link to={"delete"} className={"setting-button"}>
                            <MonitorOff size={24}/>
                            <h4>Dissocier un écran</h4>
                        </Link>
                    </div>}/>
                </Routes>
            </div>
        </div>
    );

}

export default Home;
