import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isDoctor = user && user.role === "doctor";

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <Link to={isDoctor ? "/doctor" : "/"} className="brand" onClick={close}>
        <span className="brand-logo">+</span> MediBook
      </Link>

      <button
        className="menu-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      <nav className={"nav-menu" + (open ? " open" : "")}>
        <div className="nav-links">
          {isDoctor ? (
            <>
              <NavLink to="/doctor" end className={linkClass} onClick={close}>Dashboard</NavLink>
              <NavLink to="/doctor/appointments" className={linkClass} onClick={close}>Appointments</NavLink>
              <NavLink to="/doctor/profile" className={linkClass} onClick={close}>My Profile</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
              <NavLink to="/doctors" className={linkClass} onClick={close}>Doctors</NavLink>
              <NavLink to="/book" className={linkClass} onClick={close}>Book Appointment</NavLink>
              <NavLink to="/appointments" className={linkClass} onClick={close}>My Appointments</NavLink>
              <NavLink to="/profile" className={linkClass} onClick={close}>My Profile</NavLink>
            </>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">
                <span className="avatar-sm">{isDoctor ? "🩺" : "👤"}</span> {user.username}
              </span>
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" onClick={close}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={close}>Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}