import {FaHouse, FaClock, FaTv, FaUser} from "react-icons/fa6";
import {Link} from "react-router-dom";
import { useLocation } from 'react-router-dom';

function BottomBar() {
    const location = useLocation();
    function isActive(base, path) {
        return path === base || path.startsWith(`${base}/`);
    }
    return (
        <>
            <div style={{ minHeight: '85px' }}></div>
            <nav style={styles.navbar}>
                <ul style={styles.menu}>
                    <li style={styles.menuItem}>
                        <Link to={'/'} style={location.pathname === '/' ? { ...styles.menuLink, color:'#6A6D71' } : styles.menuLink}>
                            <FaHouse size={20} />
                            <span style={styles.menuLinkSpan}>Accueil</span>
                        </Link>
                    </li>
                    <li style={styles.menuItem}>
                        <Link to={'/programmes'} style={isActive(location.pathname, '/programmes') ? { ...styles.menuLink, color:'#6A6D71' } : styles.menuLink}>
                            <FaClock size={20} />
                            <span style={styles.menuLinkSpan}>Programmes</span>
                        </Link>
                    </li>
                    <li style={styles.menuItem}>
                        <Link to={'/screens'} style={isActive(location.pathname, '/screens') ? { ...styles.menuLink, color:'#6A6D71' } : styles.menuLink}>
                            <FaTv size={20} />
                            <span style={styles.menuLinkSpan}>Écrans</span>
                        </Link>
                    </li>
                    <li style={styles.menuItem}>
                        <Link to={'/profil'} style={isActive(location.pathname, '/profil') ? { ...styles.menuLink, color:'#6A6D71' } : styles.menuLink}>
                            <FaUser size={20} />
                            <span style={styles.menuLinkSpan}>Profil</span>
                        </Link>
                    </li>

                </ul>
            </nav>
        </>
    );
}

const styles = {
    navbar: {
        marginTop:'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        zIndex: 1000,
        padding: '1rem 0rem 2rem',
        backgroundColor:'white',
        height: '85px',
        boxShadow:'rgb(67 71 85 / 27%) 1px -2px 0.25em, rgb(90 125 188 / 5%) 0px 0.25em 1em',
        position: 'fixed',
        bottom: 0
    },
    menu:{
        maxWidth:'75rem',
        width: '100%',
        listStyle: 'none',
        gap: '0.2rem',
        padding: 0,
        display:'flex',
    },
    menuItem:{
        width:'100%',
        minWidth:0,
        padding: '0 5px',
    },
    menuLink:{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        gap:'0.2rem',
        fontSize: '0.8rem',
        color: '#ABABAB'
    },
    menuLinkSpan:{
        maxWidth: '100%',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
    },
    logo: {
        maxWidth: '350px',
        maxHeight: '100%',
        marginLeft: '10px',
    },
    menuButton: {
        marginRight: '10px',
        marginLeft: 'auto',
        padding: '10px',
        fontSize: '1.5em',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        fontFamily:"Expansiva Regular",
        color:'#fff',
        backgroundColor: 'transparent',
        border: 'none',

    },
    menuBarContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'right',
        alignItems: 'flex-end',
        gap: '5px',
    },
    menuBar: {
        width: '30px',
        height: '3px',
        backgroundColor: '#fff',
        borderRadius:' 10px 0 0 10px'
    },
    middleBar: {
        width: '40px',
    },
};

export default BottomBar;