import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "./Loading.jsx";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import Modal from "./Modal.jsx";
import Scan from "./Scan.jsx"; // Assurez-vous que le chemin d'importation est correct
import config from "../config.js";
import {FaQrcode} from "react-icons/fa6";

function AddScreen({ onScreenAdd, fromUrl = false }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [scanModalIsOpen, setScanModalIsOpen] = useState(false);
    const { screenId } = useParams();
    const [cookies, setCookie, removeCookie] = useCookies(['selectedScreen', 'pendingScreenId']);

    useEffect(() => {
        const init = async () => {
            if (cookies.pendingScreenId) {
                setIsLoading(true);

                try {
                    const response = await axios.post(`${config.serverUrl}/associate-screen`, { code: cookies.pendingScreenId }, { withCredentials: true });
                    toast.success("Écran associé avec succès !");
                    if (fromUrl) {
                        removeCookie('pendingScreenId', { path: '/' });
                        setCookie('selectedScreen', response.data.screen._id, { path: '/', domain: config.cookieDomain });
                        window.location.href = "/";
                    } else {
                        removeCookie('pendingScreenId', { path: '/' });
                        onScreenAdd(response.data.screen);
                    }
                } catch (error) {
                    toast.error("Erreur lors de l'association de l'écran.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        init();
    }, [cookies.pendingScreenId, fromUrl, onScreenAdd, removeCookie, setCookie]);

    useEffect(() => {
        if (screenId && screenId !== code) {
            setCode(screenId);
        }
    }, [screenId, code]);

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const response = await axios.post(`${config.serverUrl}/associate-screen`, { code }, { withCredentials: true });
            toast.success("Écran associé avec succès !");
            if (fromUrl) {
                removeCookie('pendingScreenId', { path: '/' });
                setCookie('selectedScreen', response.data.screen._id, { path: '/', domain: config.cookieDomain });
                window.location.href = "/";
            } else {
                removeCookie('pendingScreenId', { path: '/' });
                onScreenAdd(response.data.screen);
            }
        } catch (error) {
            toast.error("Erreur lors de l'association de l'écran.");
        } finally {
            setIsLoading(false);
        }
    };

    const onScanSuccess = (decodedText, decodedResult) => {
        // Extrait l'ID de l'écran à partir de l'URL scannée
        console.log(decodedText);
        const regexPattern = `${config.instanceUrl.replace(/\//g, "\\/")}\\/screens\\/add\\/([\\w-]+)`;
        const regex = new RegExp(regexPattern);
        const match = decodedText.match(regex);
        if (match && match[1]) {
            setCode(match[1]);
            setScanModalIsOpen(false);
            handleSubmit();
        } else {
            toast.error("QR code invalide.");
        }
    };

    const onScanError = (error) => {
        //console.log(`Erreur de scan: ${error}`);
    };

    if (isLoading) return <Loading />;

    return (
        <>
            {(cookies.pendingScreenId && fromUrl) && (

                    <button type={"button"} style={{marginRight: "auto"}} onClick={() => {
                        removeCookie('pendingScreenId', { path: '/' });
                        window.location.href = "/";
                    }}>Annuler</button>
            )}
            <form onSubmit={(e) => {e.preventDefault(); handleSubmit();}} className={"fc g1"}>
                <label htmlFor={"code"}>Code d'écran</label>
                <input
                    type={"text"}
                    id={"code"}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={"Code d'écran"}
                    required={true}
                />
                <button type="button" className={"forgot_password_button"} onClick={() => setScanModalIsOpen(true)}> <FaQrcode/> Scanner QR Code</button>
                <button type="submit">Associer l'écran</button>
            </form>
            <Modal isOpen={scanModalIsOpen} onClose={() => setScanModalIsOpen(false)} title={"Scanner le QRCode de l'écran"}>
                <Scan onScanSuccess={onScanSuccess} onScanError={onScanError} />
            </Modal>
        </>
    );
}

export default AddScreen;
