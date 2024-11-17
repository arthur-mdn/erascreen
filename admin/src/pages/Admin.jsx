import Breadcrumbs from "../components/Breadcrumbs.jsx";
import {Link} from "react-router-dom";

function Admin() {

    return (
        <>
            <Breadcrumbs/>
            <div className={"p1 fc g1"}>
                <Link to={'socketControl'} className={'force_button_style'}>Socket Control</Link>
            </div>
        </>
    );
}

export default Admin;