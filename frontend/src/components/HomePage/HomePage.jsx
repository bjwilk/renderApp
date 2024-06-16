import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpots } from "../../store/spots";
import SpotCard from "../SpotCard/SpotCard";
import { Tooltip as ReactTooltip } from 'react-tooltip';

const HomePage = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots);

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
          <div key={spot.id}>
            <div data-tooltip-id={`tooltip-${spot.id}`} data-tooltip-content={`${spot.name}`}>
              <SpotCard spot={spot} />
            </div>
            <ReactTooltip id={`tooltip-${spot.id}`} place="top" effect="solid" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;