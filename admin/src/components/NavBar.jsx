import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Monitor, Home, Cog } from 'lucide-react';

function NavBar() {
    const location = useLocation();

    function isActive(path, base) {
        return path === base || path.startsWith(`${base}/`);
    }

    return (
        <>
            <div style={{ minWidth: '110px' }} className={"hide-mobile"}></div>
            <nav className="navbar">
                <ul className="menu">
                    <li className={"fc ai-c hide-mobile"}>
                        <img src={"/elements/logo-only.svg"} className="logo"/>
                    </li>
                    <li className={`menu-item`}>
                        <Link to={'/'}
                              className={`menu-link ${location.pathname === '/' ? 'active' : ''}`}>
                            <Home size={24}/>
                            <span className="menu-link-span">Accueil</span>
                        </Link>
                    </li>
                    <li className={`menu-item`}>
                        <Link to={'/screens'}
                              className={`menu-link ${isActive(location.pathname, '/screens') ? 'active' : ''}`}>
                            <Monitor size={24}/>
                            <span className="menu-link-span">Écrans</span>
                        </Link>
                    </li>
                    <li className={`menu-item`}>
                        <Link to={'/programmes'}
                              className={`menu-link ${isActive(location.pathname, '/programmes') ? 'active' : ''}`}>
                            <Clock size={24}/>
                            <span className="menu-link-span">Campagnes</span>
                        </Link>
                    </li>
                    <li className={`menu-item `}>
                        <Link to={'/profil'}
                              className={`menu-link ${isActive(location.pathname, '/profil') ? 'active' : ''}`}>
                            <Cog size={24}/>
                            <span className="menu-link-span">Paramètres</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default NavBar;
