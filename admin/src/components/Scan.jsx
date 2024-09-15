import React, {useEffect, useRef, useState} from 'react';
import {Html5QrcodeScanner} from 'html5-qrcode';
import {FaBolt} from "react-icons/fa6";
import Modal from "./Modal.jsx";
import {FaBackspace} from "react-icons/fa";

function Scan({ onScanSuccess, onScanError, onClose }) {
    const qrRef = useRef(null);
    const [isManualScanOpen, setIsManualScanOpen] = useState(false);
    let scanner = null;
    let [code, setCode] = useState("");
    const [codeError, setCodeError] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formatRegex = /^[0-9]{3}\+[0-9]{3}$/;

        if (formatRegex.test(code)) {
            onScanSuccess(code);
            setIsManualScanOpen(false);
            setCode("");
            setCodeError(null)
        } else {
            setCodeError("Le format du code doit être 'XXX+XXX'.");
        }

    };

    useEffect(() => {
        if (qrRef.current) {
            const config = {
                fps: 50,
                qrbox: 250,
                aspectRatio: 1
            };

            scanner = new Html5QrcodeScanner(
                qrRef.current.id,
                config,
                false
            );

            scanner.render(onScanSuccess, onScanError);
            const videoElement = qrRef.current.querySelector('video');
            if (videoElement) {
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
            }
        }

        // Fonction de nettoyage
        return () => {
            if (scanner) {
                scanner.clear().then(() => {
                    console.log('Scanner cleared');
                }).catch((error) => {
                    console.error('Error clearing scanner:', error);
                });
            }
        };
    }, [onScanSuccess, onScanError]);

    const handleButtonClick = (value) => {
        if (value === 'effacer') {
            setCode(code.slice(0, -1)); // Supprime le dernier caractère
        } else {
            setCode(code + value); // Ajoute le caractère cliqué
        }
    };

    const renderVirtualKeyboard = () => {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', 'effacer'];
        return keys.map(key => (
            <button type={"button"} key={key} onClick={() => handleButtonClick(key)} style={{flex:'1 1 25%',margin:"auto",flexGrow:0,padding:0,backgroundColor:"white", color:"black", width:"50px", height:'50px', display:"flex",alignItems:"center", justifyContent:"center",borderRadius:'2rem',pointerEvents:"all",fontWeight:"bold", boxShadow:"rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em"}}>

                {key === 'effacer' ? <FaBackspace/> : key}
            </button>
        ));
    };

    return (
        <>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div ref={qrRef} id="qr-code-reader" style={{ width: '100%', height:"100%", backgroundColor:"black", border:"0!important" }} />
                <div style={{position:"absolute", width:"100%", height:"100%", top:0, left:0,display:"flex",justifyContent:"center", alignItems:"center",gap:'1rem', pointerEvents:"none"}}>
                    <button onClick={()=>{setIsManualScanOpen(true)}} style={{backgroundColor:"white", color:"black", width:"50px", height:'50px', display:"flex",alignItems:"center", justifyContent:"center",borderRadius:'2rem',pointerEvents:"all",fontWeight:"bold"}}>
                        123
                    </button>
                    <button style={{backgroundColor:"white", color:"black", width:"50px", height:'50px', display:"flex",alignItems:"center", justifyContent:"center",borderRadius:'2rem',pointerEvents:"all"}}>
                        <FaBolt/>
                    </button>
                </div>
            </div>
            <Modal isOpen={isManualScanOpen} onClose={() => setIsManualScanOpen(false)} title={"Saisir code manuel"}>
                <form onSubmit={handleSubmit}>
                    {codeError && (
                        <div style={{color:"red", textAlign:"center", margin:"1rem 0"}}>
                            {codeError}
                        </div>
                    )}
                    <input type={"text"}
                           maxLength={7}
                           placeholder={"Code"}
                           style={{padding:"1rem", width:"100%", margin:"1rem 0"}}
                           required
                           value={code}
                           onChange={(e) => setCode(e.target.value)}
                    />
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap:'0.8rem'}}>
                        {renderVirtualKeyboard()}
                    </div>
                    <br/>
                    <br/>
                    <button type={"submit"} style={{width:"100%", margin:"1rem 0"}}>Valider</button>
                </form>
            </Modal>
        </>

    );
}

export default Scan;