import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { fetchUserSpots, removeSpot } from "../../store/spots";
import SpotCard from "../SpotCard/SpotCard";

function UserSpots() {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots);

  useEffect(() => {
    dispatch(fetchUserSpots());
  }, [dispatch]);

  const handleDelete = (spotId) => {
    dispatch(removeSpot(spotId));
  };

  if (!spots || Object.keys(spots).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Manage Spots</h1>
      <div className="spot-card">
        {Object.values(spots).map((spot) => (
          <div key={spot.id}>
            <SpotCard spot={spot} />
            <NavLink to={`/spots/${spot.id}/edit`}>
              <button>Update</button>
            </NavLink>
            <button onClick={() => handleDelete(spot.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserSpots;
