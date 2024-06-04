import "./SpotCard.css";
import { NavLink, useNavigate } from "react-router-dom";

function SpotCard({ spot }) {
  return (
    <div>
      <NavLink to={`/spots/${spot.id}`}>
        <h3>{spot.name}</h3>
        <div>{spot.previewImage}</div>
        <p>{spot.price}</p>
        <p>{spot.description}</p>
      </NavLink>
    </div>
  );
}

export default SpotCard;
