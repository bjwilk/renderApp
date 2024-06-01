/* eslint-disable react/prop-types */

import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faAirbnb } from '@fortawesome/free-brands-svg-icons';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav>
      <div>
      <NavLink to="/">
      <FontAwesomeIcon icon={faAirbnb} className='nav-icon'/>
      </NavLink>
      </div>
    <ul>
      {isLoaded && (
        <li>
          <ProfileButton user={sessionUser} />
        </li>
      )}
    </ul>
    </nav>
  );
}

export default Navigation;