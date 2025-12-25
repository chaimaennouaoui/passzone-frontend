import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/pass-zone-logo.png";

export function Topbar({ email, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <img src={logo} alt="Pass Zone Logo" className="brandLogo" />
          <div>
            <div className="brandTitle">Pass Zone</div>
            <div className="brandSubtitle">
              Réserve ta Fan Zone en toute simplicité
            </div>
          </div>
        </div>

        {/* ✅ Fan navigation فقط */}
        <nav className="nav">
          <NavLink
            to="/fanzones"
            className={({ isActive }) =>
              "navLink " + (isActive ? "navActive" : "")
            }
          >
            Accueil
          </NavLink>

          <NavLink
            to="/my"
            className={({ isActive }) =>
              "navLink " + (isActive ? "navActive" : "")
            }
          >
            Mes réservations
          </NavLink>
        </nav>

        <div className="userBox">
          <span className="userEmail">{email || "Guest"}</span>
          {email && (
            <button className="btn btnRed" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Modal({ title, children, onClose, footer }) {
  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modalBody">{children}</div>
        {footer && <div className="modalFooter">{footer}</div>}
      </div>
    </div>
  );
}
