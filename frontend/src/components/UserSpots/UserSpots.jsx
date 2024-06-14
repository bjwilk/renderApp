import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { fetchUserSpots, removeSpot } from "../../store/spots";
import SpotCard from "../SpotCard/SpotCard";

function UserSpots() {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots);
  const user = useSelector(state => state.session.user)
  
  console.log(spots)

  useEffect(() => {
    dispatch(fetchUserSpots());
  }, [dispatch]);

  const handleDelete = (spotId) => {
    dispatch(removeSpot(spotId));
  };

  if (!spots) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Manage Spots for {user.firstName} {user.lastName}</h1>
      {Object.keys(spots).length === 0 && (
        <div><NavLink to={"/spots/new"} >Create a Spot</NavLink></div>
      )}
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
