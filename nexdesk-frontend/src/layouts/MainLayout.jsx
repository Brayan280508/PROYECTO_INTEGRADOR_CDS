import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import NavbarPrincipal from "../components/NavbarPrincipal";

export default function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="solvix-app nexdesk-app">
      <Sidebar
        abierto={menuAbierto}
        cerrar={() => setMenuAbierto(false)}
      />

      <div className="solvix-main nexdesk-main">
        <NavbarPrincipal
          abrirMenu={() => setMenuAbierto(true)}
        />

        <main className="solvix-content nexdesk-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
