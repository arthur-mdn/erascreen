import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Clock, Cog, Home, Monitor} from 'lucide-react';
import {useAuth} from "../AuthContext.jsx";

function NavBar({hidden}) {
    const location = useLocation();

    const {user} = useAuth();

    function isActive(path, base) {
        return path === base || path.startsWith(`${base}/`);
    }

    if (hidden) {
        return
    }
    return (
        <>
            <div style={{minWidth: '100px'}} className={"hide-mobile"}></div>
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
                    {user && user.userRole === 'superadmin' &&
                        <li className={`menu-item`}>
                            <Link to={'/admin'}
                                  className={`menu-link ${isActive(location.pathname, '/admin') ? 'active' : ''}`}>
                                <Cog size={24}/>
                                <span className="menu-link-span">Admin</span>
                            </Link>
                        </li>
                    }
                </ul>
            </nav>
        </>
    );
}

export default NavBar;
