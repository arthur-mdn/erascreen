import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {FaTimes} from "react-icons/fa";

const Loading = () => {
    return (
        <>
            <div style={{position:"fixed", top:0,left:0, width:"100%", height:"100%", backgroundColor:"rgba(0,0,0,0.4)",zIndex:9999999999999, display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{backgroundColor:"white", padding:'2rem 2rem 1.5rem 2rem', borderRadius:'1rem'}}>
                    <span className="loader"></span>
                </div>
            </div>
        </>
    );
};

export default Loading;
