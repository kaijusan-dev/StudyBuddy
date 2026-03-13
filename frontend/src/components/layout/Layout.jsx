import { Outlet, Link } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Layout() {
    const {loading} = useContext(AuthContext);
    return (
        <div className="Layout">
            <Navbar />
            {loading
            ? <div>Загрузка...</div>
            : <Outlet />
            }
        </div>
    )
}