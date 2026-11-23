import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__brand" aria-label="js4cut 홈">
        <img src={logo} alt="" width="40" height="40" />
        <span>js4cut</span>
      </Link>
    </header>
  );
}
