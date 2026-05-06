import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout() {
    return (
        <div>
            <Header />
            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;