import Breadcrumbs from "../components/Breadcrumbs.jsx";
import {useSocket} from "../SocketContext.jsx";
import {useEffect, useState} from "react";
import DisplayImage from "../components/DisplayImage.jsx";

function Admin() {
    const [debugList, setDebugList] = useState([]);
    const [newScreenId, setNewScreenId] = useState('')
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            socket.emit('adminAskDebugList');

            socket.on('adminDebugList', (data) => {
                setDebugList(data);
            });
            return () => {
                socket.off('adminDebugList');
            };
        }
    }, [socket]);

    const handleSetNewScreenId = (socketId, code) => {
        console.log(socketId, newScreenId, code);
        if(newScreenId.length < 5) {
            return;
        }
        socket.emit('adminOrderToChangeScreenId', {"socketId":socketId, 'newScreenId': newScreenId, "code": code});
    }

    const handleReset = (socketId, code) => {
        console.log(socketId, code);
        socket.emit('adminOrderToResetScreen', {"socketId":socketId, "code": code});
    }
    return (
        <>
            <Breadcrumbs/>
            <div className={"p1"}>
                <h2>Debug</h2>
                <div>
                    <label>New screenId</label>
                    <input type={"text"} value={newScreenId} onChange={(e) => {setNewScreenId(e.target.value)}}/>
                </div>
                <table>
                    <thead>
                    <tr>
                        <th>Image</th>
                        <th>Infos</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {debugList.map((item, index) => (
                        <tr key={index}>
                            <td style={{width:'100px'}}><DisplayImage image={item.featured_image} width={'100px'} /></td>
                            <td className={'fc'}>
                                <span>{item.name}</span>
                                <span>{item.code}</span>
                                <span>{item.socketId}</span>
                            </td>
                            <td>
                                <button onClick={() => handleSetNewScreenId(item.socketId, item.code)}>Change screenId</button>
                                <button onClick={() => handleReset(item.socketId, item.code)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Admin;