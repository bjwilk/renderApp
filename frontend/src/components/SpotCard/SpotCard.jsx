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
    <div className="spot-card-container">
      <NavLink className="spot-card" to={`/spots/${spot.id}`}>
        <div className="spot-mini">
          <h3 className="spot-name">{spot.name}</h3>
          <div className="image-container">
            {previewImage ? (
              <img
                className="card-preview-image"
                src={previewImage}
                alt={spot.name}
              />
            ) : (
              "No image"
            )}
          </div>
          <div className="card-detail">
            <h5>
              {spot.city}, {spot.state}
            </h5>
            <p>${spot.price} night</p>
          </div>
          <div className="rating">
            {starIcons}
            <span>
              {spot.avgRating && <span>{spot.avgRating.toFixed(1)}</span>}{" "}
              {spot.avgRating ? "" : "New"}
            </span>
          </div>
        </div>
      </NavLink>
    </div>
  );
}

export default SpotCard;
