import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import "./SpotCard.css";

function SpotCard({ spot }) {
  const previewImage = spot.previewImage;

  // Create an array of star icons based on the avgStarRating
  const starIcons = [];
  const fullStars = Math.floor(spot.avgStarRating);
  const hasHalfStar = spot.avgStarRating % 1 !== 0;

  // Push full stars
  for (let i = 0; i < fullStars; i++) {
    starIcons.push(<FontAwesomeIcon key={i} icon={solidStar} />);
  }

  // Push half star if needed
  if (hasHalfStar) {
    starIcons.push(
      <FontAwesomeIcon key="half" icon={regularStar} className="half-star" />
    );
  }

  return (
    <div className="spot-card">
      <NavLink to={`/spots/${spot.id}`}>
        <h3 className="spot-name">{spot.name}</h3>
        <div>
          {previewImage ? (
            <img className="card-preview-image" src={previewImage} alt={spot.name} />
          ) : (
            "No image"
          )}
        </div>
        <h5>{spot.city}, {spot.state}</h5>
        <p>${spot.price} night</p>
        <div className="rating">
          {starIcons} {/* Render the star icons */}
          <span>{spot.avgRating} avg</span>
        </div>
      </NavLink>
    </div>
  );
}

export default SpotCard;
