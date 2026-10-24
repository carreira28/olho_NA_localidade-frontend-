import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}