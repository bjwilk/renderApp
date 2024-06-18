/* eslint-disable react/prop-types */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAirbnb } from "@fortawesome/free-brands-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "./Navigation.css";

function Navigation({ isLoaded }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sessionUser = useSelector((state) => state.session.user);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav>
      <div>
        <NavLink to="/">
          <FontAwesomeIcon icon={faAirbnb} className="nav-icon" />
        </NavLink>
      </div>
      {sessionUser && (
        <div>
          <NavLink to={"/spots/new"}>Create a Spot</NavLink>
        </div>
      )}
      <ul>
        <li>
          <FontAwesomeIcon
            icon={faBars}
            onClick={toggleMenu}
            className="menu-icon"
          />
        </li>
        {isLoaded && menuOpen && (
          <li>
            <ProfileButton user={sessionUser} />
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
