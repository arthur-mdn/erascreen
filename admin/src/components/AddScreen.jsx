import axios from "axios";
import config from "../config.js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loading from "./Loading.jsx";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

function AddScreen({ onScreenAdd, fromUrl = false }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { screenId } = useParams();
    const [cookies, setCookie] = useCookies(['selectedScreen']);

    useEffect(() => {
        if (screenId && screenId !== code) {
            setCode(screenId);
        }
    }, [screenId, code]);

    useEffect(() => {
        if (code && screenId === code) {
            handleSubmit();
        }
    }, [code]);

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${config.serverUrl}/associate-screen`, { code }, { withCredentials: true });
            toast.success("Écran associé avec succès !");
            if (fromUrl) {
                setCookie('selectedScreen', response.data.screen._id, { path: '/', domain: config.cookieDomain });
                window.location.href = "/";
            } else {
                onScreenAdd(response.data.screen);
            }
        } catch (error) {
            toast.error("Erreur lors de l'association de l'écran.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loading />;

    return (
        <>
            <form onSubmit={handleSubmit} className={"fc g1"}>
                <label htmlFor={"code"}>Code d'écran</label>
                <input
                    type={"text"}
                    id={"code"}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={"Code d'écran"}
                />
                <button type="submit">Associer l'écran</button>
            </form>
        </>
    );
}

export default AddScreen;
