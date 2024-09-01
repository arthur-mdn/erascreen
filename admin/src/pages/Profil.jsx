import {FaSignOutAlt} from "react-icons/fa";
import {Link} from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

function Profil() {
    return (
        <>
            <Breadcrumbs/>
            <div className={"p1"}>
                <Link to={"/logout"} className={"force_button_style"}>
                    <FaSignOutAlt/>
                    Se déconnecter
                </Link>
            </div>
        </>
    );
}

export default Profil;
