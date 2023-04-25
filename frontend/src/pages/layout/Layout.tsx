import { Outlet, NavLink, Link } from "react-router-dom";

import github from "../../assets/github.svg";

import styles from "./Layout.module.css";
import { FeedbackPanel } from "../../components/FeedbackPanel/FeedbackPanel";
import { useState } from "react";
import { mergeStyles } from "@fluentui/react";



const Layout = () => {

    const [isFeedbackOpen, setFeedbackOpen] = useState<boolean>(false);

    const headerNavPageLinkStyle = mergeStyles(styles.headerNavPageLinkActive, styles.headerNavPageLink);

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <h3 className={styles.headerTitle}>Modern Work GPT</h3>
                    </Link>
                    <nav>
                        <ul className={styles.headerNavList}>
                            <li>
                                <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Chat
                                </NavLink>
                            </li>
                            <li>
                                <Link to="" onClick={() => setFeedbackOpen(true)} className={headerNavPageLinkStyle}>
                                    Feedback
                                </Link>
                            </li>
                            <li>
                                <NavLink to="https://aka.ms/MWGPTFeedback" target="_blank" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Old Feedback Form
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <hr />
            <Outlet />
            <FeedbackPanel isOpen={isFeedbackOpen} onDismiss={() => setFeedbackOpen(false)} />
        </div>
    );
};

export default Layout;
