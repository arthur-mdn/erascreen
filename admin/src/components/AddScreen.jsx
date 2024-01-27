import axios from "axios";
import config from "../config.js";
import {useState} from "react";
import {toast} from "react-toastify";
import Loading from "./Loading.jsx";

function AddScreen ()  {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsLoading(true);

        axios.post(`${config.serverUrl}/associate-screen`, { code }, { withCredentials: true })
            .then(response => {
                console.log(response.data);
                toast.success("Écran associé avec succès !");
            })
            .catch(error => {
                console.error('Erreur lors de l\'association de l\'écran:', error);
                toast.error("Erreur lors de l'association de l'écran.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (isLoading) return <Loading />;

    return (
        <>
            <form onSubmit={handleSubmit} method={"post"}>
                <label htmlFor={"code"}>Code d'écran</label>
                <input type={"text"}
                       name={"code"}
                       id={"code"}
                       placeholder={"Code d'écran"}
                       value={code}
                       onChange={(e) => setCode(e.target.value)}
                />
                <input type={"submit"} value={"associer l'écran"}/>
            </form>
        </>
        )
}

export default AddScreen;
