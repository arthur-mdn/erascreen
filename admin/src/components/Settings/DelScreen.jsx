import React, {useState} from 'react';
import axios from 'axios';
import config from '../../config';
import Loading from "../Loading.jsx";
import {toast} from "react-toastify";
import {FaTrash} from "react-icons/fa6";
import Modal from "../Modal.jsx";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

function DelScreen( { onRemoveScreenSelected } ) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['selectedScreen']);
    const navigate = useNavigate();
    const handleScreenDelete = () => {
        setIsLoading(true);
        axios.delete(`${config.serverUrl}/screens/`, {
            withCredentials: true
        })
            .then(response => {
                if (response.data.success) {
                    removeCookie('selectedScreen', { path: '/' });
                    onRemoveScreenSelected();
                    toast.success(`Écran supprimé avec succès !`);
                    navigate(`/screens/list`);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la suppression de l\'écran:', error);
                toast.error(`Erreur lors de la suppression de l'écran`);
            })
            .finally(() => setIsLoading(false));
    };

    if (isLoading) return (
        <Loading/>
    );

    return (

        <div>

            <button
                type={"button"}
                onClick={() => setIsOpenDelete(true)}
                className={"setting_element"}
                style={{justifyContent:"center", backgroundColor:"red", color:"white", border:"1px solid red"}}
            >

                <div className={"fr g0-5 ai-c"} style={{color:"white",marginTop:"auto", textAlign:"center"}}>
                    <FaTrash/>
                    Supprimer l'écran
                </div>
            </button>
            <Modal isOpen={isOpenDelete} onClose={() => setIsOpenDelete(false)} title={"Supprimer l'écran"} hideBg={true} >
                <div className={"fc ai-c jc-c g1"} style={{top:'50%', left:'50%', transform:'translate(-50%, -50%)', backgroundColor:"white", padding:'1rem', borderRadius:'0.5rem', position:"absolute", width:'80%', maxWidth:'400px'}}>
                    <h3 style={{fontWeight:"bold"}}>Supprimer cet écran et toutes les données associées.</h3>
                    <p>Attention, toutes les données de l'écran seront supprimées. Cette action est irréversible.</p>
                    <div className={"fr g0-5 fw-w"}>
                        <button type={"button"} onClick={handleScreenDelete} style={{backgroundColor:'red'}}>Supprimer l'écran</button>
                        <button type={"button"} onClick={() => setIsOpenDelete(false)}>Annuler</button>
                    </div>
                </div>
            </Modal>
        </div>

    );
}

export default DelScreen;
