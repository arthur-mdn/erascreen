// Modal.jsx
import React, {useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {FaTimes} from "react-icons/fa";
import {FaEllipsis} from "react-icons/fa6";
import {Link} from "react-router-dom";

const Modal = ({ isOpen, onClose, children, title,actions, bgColor = "#f3f3f3", padding="1rem" , hideBg= false, overflowY = false}) => {
    const [actionPopup, setActionPopup] = useState(false);
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        transition={{ duration: 0.4 }}
                        className="modal-backdrop"
                        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9998 }}
                    >

                        <div onClick={() => {console.log("click");onClose()}} style={{width:'100%', height:'100%'}}>

                        </div>
                    </motion.div>

                    {/* Contenu de la modale */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={modalVariants}
                        transition={{ duration: 0.4 }}
                        className="modal-content"
                        style={{ position: "fixed", bottom: 0, left: 0, width: "100%",height:"100%", pointerEvents: hideBg ? "none" : "all",backgroundColor: hideBg ? "transparent" : bgColor, zIndex: 9999 }}
                    >
                        {
                            !hideBg && (
                                <div className="modal-content" style={{height:'100%',backgroundColor:hideBg ? "transparent" : bgColor, position:"relative", display:"flex", flexDirection:"column", pointerEvents:"all"}}>
                                    {
                                        !hideBg &&
                                        <div className={"over_top_menu jc-sb"}
                                             style={{padding: "0 1rem", position: "relative"}}>

                                            <button onClick={() => {
                                                onClose()
                                            }} style={{
                                                padding: '0.5rem 0.5rem',
                                                backgroundColor: "transparent",
                                                color: "white"
                                            }} className={"fc ai-c jc-c"}>
                                                <FaTimes/>
                                            </button>
                                            <h4 style={{
                                                position: "absolute",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                fontWeight: "bold",
                                                whiteSpace: 'nowrap',
                                                wordBreak: "break-word"
                                            }}>
                                                {title}
                                            </h4>
                                            {actions && actions.length > 0 && (
                                                <div onClick={() => {
                                                    setActionPopup(!actionPopup)
                                                }}>
                                                    <FaEllipsis/>
                                                </div>
                                            )}
                                        </div>
                                    }

                                    <div style={{
                                        padding: padding,
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        overflowY: overflowY ? "scroll" : "",
                                        maxHeight: overflowY ? "94vh" : ""
                                    }}>
                                    {children}
                                    </div>
                                    {actionPopup && (
                                        <div style={{position:"fixed",zIndex:9999, top:0, width:"100%", height:"100%" }}>
                                            <div style={{position:"relative",width:"100%",height:"100%", display:"flex", justifyContent:"flex-end",alignItems:"flex-end"}}>
                                                <div onClick={()=>{setActionPopup(!actionPopup)}} style={{position:"absolute",width:"100%", height:"100%", backgroundColor:"black", opacity:"0.3", zIndex:999}}>
                                                </div>
                                                <div style={{position:"relative",listStyleType:"none", margin:"0", padding:"1rem 0.5rem 4rem",gap:"0rem", zIndex:99999,width:"100%", display:"flex", alignItems:"center",justifyContent:"flex-end",flexDirection:"column"}}>
                                                    <ul style={{listStyleType:"none", margin:"0", width:'100%',borderRadius:"0.5rem",overflow:"hidden"}}>
                                                        {actions.map((action, index) => (
                                                            <li key={index} style={{ width:"100%",margin:"0", padding:"0.7rem", backgroundColor:"white", textAlign:"center", borderBottom:'1px solid lightgrey'}}>
                                                                {action.action && (
                                                                    <div onClick={()=>{ setActionPopup(false);action.action()}} style={{color:"blue",textDecoration:"none"}}>
                                                                        <h3>
                                                                            {action.title}
                                                                        </h3>
                                                                    </div>
                                                                )}
                                                                {action.link && (
                                                                    <Link to={action.link} style={{color:"blue", textDecoration:"none", width:'100%', height:'100%'}}>
                                                                        <h3>
                                                                            {action.title}
                                                                        </h3>
                                                                    </Link>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <li key={"cancel"} style={{ width:"100%",margin:"0.5rem 0 0 0", padding:"0.6rem",borderRadius:"0.5rem", backgroundColor:"white",textAlign:"center"}}>
                                                        <div onClick={()=>{setActionPopup(!actionPopup)}} style={{color:"blue",fontWeight:"bold", textDecoration:"none"}}>
                                                            Annuler
                                                        </div>
                                                    </li>
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            )
                        }
                        {
                            hideBg && (
                                <div style={{pointerEvents:"all"}}>
                                    {children}
                                </div>
                            )
                        }


                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
