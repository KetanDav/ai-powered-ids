import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h1 className="nav-title">Threat Analyzer</h1>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link className="nav-link" to="/">
          Home
        </Link>

        <Link className="nav-link" to="/about">
          About Us
        </Link>

        <Link className="nav-link" to="/map">
          Map
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
