// Breadcrumbs.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { getTranslation } from "../../utils/translations.js";
import {
    FaArrowRightArrowLeft,
    FaCopyright,
    FaHeading,
    FaIcons,
    FaImages,
    FaSun,
    FaTextWidth,
    FaUmbrella, FaUsers
} from "react-icons/fa6";
import {FaCogs} from "react-icons/fa";

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const knownPaths = ['screens', 'list', 'add', 'edit', 'delete', 'programmes', 'profil', 'login', 'register', 'logout', 'name', 'logo', 'icons', 'meteo', 'directions', 'photos', 'dark_mode', 'text_slides', 'allowed_users', 'avanced_settings'];

    const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    const breadcrumbItems = [];
    for (let i = 0; i < pathnames.length; i++) {
        const value = pathnames[i];
        const to = `/${pathnames.slice(0, i + 1).join('/')}`;
        if (knownPaths.includes(value) || isObjectId(value)) {
            breadcrumbItems.push({
                to,
                displayName: knownPaths.includes(value) ? getTranslation(value) : value
            });
        } else {
            // Si un segment n'est ni un chemin connu ni un ObjectId valide, arrêtez de construire le breadcrumb
            break;
        }
    }

    return (
        <nav className={"fr ai-c g1 p1 bread"}>
            <Menu className={"fs-0"} />
            <ul className="breadcrumb">
                {breadcrumbItems.map((item, index) => (
                    <li key={item.to}>
                        <Link to={item.to}>
                            {item.displayName}
                        </Link>
                        {index < breadcrumbItems.length - 1 && <ChevronRight />}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Breadcrumbs;
