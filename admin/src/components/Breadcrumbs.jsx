// Breadcrumbs.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {ChevronRight, Menu} from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className={"fr ai-c g1 p1 bread"}>
            <Menu className={"fs-0"}/>
            <ul className="breadcrumb">
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    return (
                        <li key={to}>
                            <Link to={to}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                            </Link>
                            {index < pathnames.length - 1 && <ChevronRight />}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Breadcrumbs;
