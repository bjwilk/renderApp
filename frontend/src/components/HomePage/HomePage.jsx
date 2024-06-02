import  { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots } from '../../store/spots';

const HomePage = () => {
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spots);
  
console.log(spots)

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  if (!spots || Object.keys(spots).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Home Page</h1>
      <ul>
        {Object.values(spots).map((spot) => (
          <li key={spot.id}>{spot.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
