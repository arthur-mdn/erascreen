import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import Loading from "../Loading.jsx";
import { toast } from "react-toastify";
import Modal from "../Modal.jsx";
import { FaCheck } from "react-icons/fa6";

function AllowedUsersManager({ screenId, initialAllowedUsers, onConfigChange }) {
    const [allowedUsers, setAllowedUsers] = useState(initialAllowedUsers || []);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', permissions: [] });

    const permissions = [
        "nom", "logo", "icons", "meteo", "directions", "photos", "dark_mode", "text_slides", "allowed_users", "config"
    ];


    return (
        <div>
            {isLoading ? <Loading /> : (
                <>
                    <button onClick={() => setIsModalOpen(true)}>Ajouter un utilisateur</button>
                    {allowedUsers.map((user, index) => (
                        <div key={index}>
                            {user.user.email} - Permissions: {user.permissions.join(', ')}
                            <button onClick={() => openModalForEdit(index)}>Modifier</button>
                            <button onClick={() => handleDeleteUser(index)}>Supprimer</button>
                        </div>
                    ))}
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter/Modifier un utilisateur">
                        Email: <input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                        <div>Permissions:</div>
                        {permissions.map(permission => (
                            <div key={permission}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newUser.permissions.includes(permission)}
                                    />
                                    {permission}
                                </label>
                            </div>
                        ))}
                        <button>
                            {/* 'Mettre à jour' : 'Ajouter'*/}
                        </button>
                    </Modal>
                </>
            )}
        </div>
    );
}

export default AllowedUsersManager;
