import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpots } from "../../store/spots";
import SpotCard from "../SpotCard/SpotCard";

const HomePage = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots);

  console.log(spots);

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  if (!spots || Object.keys(spots).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Home Page</h1>
      <div className="spot-card">
        {Object.values(spots).map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
