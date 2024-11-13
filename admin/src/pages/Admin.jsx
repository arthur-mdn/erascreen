import Breadcrumbs from "../components/Breadcrumbs.jsx";
import {useSocket} from "../SocketContext.jsx";
import {useEffect} from "react";

function Admin() {

    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            socket.emit('adminAskDebugList');

            socket.on('adminDebugList', (data) => {
                console.log(data);
            });
        }
    }, [socket]);
    return (
        <>
            <Breadcrumbs/>
            <div className={"p1"}>
            </div>
        </>
    );
}

export default Admin;