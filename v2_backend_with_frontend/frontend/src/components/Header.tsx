import styles from "./Header.module.css";

function Header() {

    const appName = "2048";

    return (
        <header className={styles.header}>
            <div className={styles.logo}>{appName}</div>
        </header>
    );
}

export default Header;