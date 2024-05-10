import React, {useEffect, useState} from 'react';
import axios from 'axios';
import config from '../../config';
import Loading from "../Loading.jsx";
import { toast } from "react-toastify";
import Modal from "../Modal.jsx";
import { FaPen, FaTrash } from "react-icons/fa6";

const permissions = [
    "nom", "logo", "icons", "meteo", "directions", "photos", "dark_mode", "text_slides", "allowed_users", "config"
];

function AllowedUsersManager({ screenId, initialAllowedUsers, onConfigChange }) {
    const [allowedUsers, setAllowedUsers] = useState(initialAllowedUsers || []);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', permissions: [] });
    const [editIndex, setEditIndex] = useState(null);

    const openModalForEdit = (index) => {
        setNewUser({ email: allowedUsers[index].user.email, permissions: allowedUsers[index].permissions });
        setEditIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewUser({ email: '', permissions: [] });
        setEditIndex(null);
    };

    const handleSaveUser = async () => {
        setIsLoading(true);

        try {
            let response;

            if (editIndex !== null) {
                // Update user
                response = await axios.put(`${config.serverUrl}/screens/users/${allowedUsers[editIndex].user._id}`, {
                    role: "user",
                    permissions: newUser.permissions
                }, { withCredentials: true });
            } else {
                // Add user
                response = await axios.post(`${config.serverUrl}/screens/users`, {
                    userEmail: newUser.email,
                    role: "user",
                    permissions: newUser.permissions
                }, { withCredentials: true });
            }

            if (response.data.success) {
                toast.success(editIndex !== null ? "Utilisateur mis à jour avec succès!" : "Utilisateur ajouté avec succès!");
                const updatedUsers = await fetchScreenDetails();
                setAllowedUsers(updatedUsers.users);
                onConfigChange(updatedUsers);
                closeModal();
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
            if (error.response && error.response.status === 404 && error.response.data.error === 'Utilisateur non trouvé') {
                toast.error("Aucun utilisateur trouvé avec cet email.");
            } else {
                toast.error("Erreur lors de la sauvegarde de l'utilisateur");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchScreenDetails = async () => {
        const response = await axios.get(`${config.serverUrl}/screens/${screenId}`, { withCredentials: true });
        return response.data.screenObj || [];
    };

    const handleDeleteUser = async (index) => {
        setIsLoading(true);
        try {
            const userId = allowedUsers[index].user._id;
            const response = await axios.delete(`${config.serverUrl}/screens/users/${userId}`, { withCredentials: true });
            if (response.data.success) {
                toast.success("Utilisateur supprimé avec succès !");
                const updatedUsers = await fetchScreenDetails();
                setAllowedUsers(updatedUsers.users);
                onConfigChange(updatedUsers);
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            toast.error("Erreur lors de la suppression de l'utilisateur");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (permission) => {
        setNewUser((prevUser) => {
            const newPermissions = prevUser.permissions.includes(permission)
                ? prevUser.permissions.filter(p => p !== permission)
                : [...prevUser.permissions, permission];
            return { ...prevUser, permissions: newPermissions };
        });
    };

    useEffect(() => {
        setIsLoading(true);
        fetchScreenDetails().then((screenObj) => {
            setAllowedUsers(screenObj.users);
            setIsLoading(false);
        });
    }, []);

    return (
        <div>
            {isLoading ? <Loading /> : (
                <>
                    <div className={"fc g1 w100"}>
                        <h3>Utilisateurs autorisés</h3>
                        {allowedUsers.map((user, index) => (
                            <div key={index} className={" fr jc-sb ai-c w100 p1 br0-5 bg-white mb1"}>
                                <div className={"fr g1 fw-w"}>
                                    <div className={"fc"}>
                                        <h4 className={" fw-b"}>
                                            {user.user.firstName} {user.user.lastName}
                                        </h4>
                                        <h4 className={" fw-b"}>
                                            {user.user.email}
                                        </h4>
                                    </div>
                                    <div>
                                        {user.role !== "creator" ? (
                                            <>
                                                {user.permissions.join(', ')}
                                            </>
                                        ) : (
                                            <>
                                                Créateur, permissions totales.
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={"fr g0-5 fw-w"}>
                                    {user.role !== "creator" ? (
                                        <>
                                            <button onClick={() => openModalForEdit(index)}><FaPen/></button>
                                            <button onClick={() => handleDeleteUser(index)}><FaTrash/></button>
                                        </>
                                    ) : (
                                        <>
                                            <button disabled={true}><FaPen/></button>
                                            <button disabled={true}><FaTrash/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setIsModalOpen(true)}>Ajouter un utilisateur</button>

                    <Modal isOpen={isModalOpen} onClose={closeModal}
                           title={editIndex !== null ? "Modifier un utilisateur" : "Ajouter un utilisateur"}>
                        Email: <input
                        type={"email"}
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        readOnly={editIndex !== null}
                    />
                        <h3>Permissions:</h3>
                        <div className={"fc g0-5"}>
                            {permissions.map(permission => (
                                <div key={permission}>
                                    <label className={"fr ai-c g0-5"}>
                                        <input
                                            type="checkbox"
                                            checked={newUser.permissions.includes(permission)}
                                            onChange={() => handleCheckboxChange(permission)}
                                        />
                                        {permission}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleSaveUser} type={"button"}>
                            {editIndex !== null ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                    </Modal>
                </>
            )}
        </div>
    );
}

export default AllowedUsersManager;
