import { Outlet, Link } from "react-router-dom";
import Navbar from "../navbar/Navbar";

export default function Layout() {
    return (
        <div className="Layout">
            <Navbar />
            <Outlet />
        </div>
    )
}