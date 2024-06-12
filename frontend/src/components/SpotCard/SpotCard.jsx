import "./SpotCard.css";
import { NavLink } from "react-router-dom";

function SpotCard({ spot }) {
  const previewImage = spot.previewImage;
  return (
    <div>
      <NavLink to={`/spots/${spot.id}`}>
        <h3>{spot.name}</h3>
        <div>
          {previewImage ? (
            <img className="card-preview-image" src={previewImage} alt={spot.name} />
          ) : (
            "No image"
          )}
        </div>
        <p>{spot.price}</p>
        <p>{spot.description}</p>
      </NavLink>
    </div>
  );
}

export default SpotCard;
