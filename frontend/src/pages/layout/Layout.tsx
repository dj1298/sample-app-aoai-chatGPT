import { Outlet, NavLink, Link } from "react-router-dom";

import github from "../../assets/github.svg";

import styles from "./Layout.module.css";
import mwStyles from "./Layout.mw.module.css";

const Layout = () => {
    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <h3 className={styles.headerTitle}>Modern Work GPT</h3>
                    </Link>
                    <nav>
                        <ul className={mwStyles.headerNavList}>
                            <li>
                                <NavLink to="/" className={({ isActive }) => (isActive ? mwStyles.headerNavPageLinkActive : mwStyles.headerNavPageLink)}>
                                    Chat
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="https://aka.ms/HowToUseMWGPT" target="_blank" className={({ isActive }) => (isActive ? mwStyles.headerNavPageLinkActive : mwStyles.headerNavPageLink)}>
                                    Help
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="https://msdpn.azurewebsites.net/" target="_blank" className={({ isActive }) => (isActive ? mwStyles.headerNavPageLinkActive : mwStyles.headerNavPageLink)}>
                                    Data Privacy Notice
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <hr />
            <Outlet />
        </div>
    );
};

export default Layout;
